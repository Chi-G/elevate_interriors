<?php

namespace Tests\Feature;

use App\Actions\Inventory\RecordStockMovementAction;
use App\Events\StockUpdated;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class StockMovementTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'role' => 'Super Admin',
        ]);

        $category = Category::factory()->create();

        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'current_stock' => 50,
        ]);
    }

    public function test_stock_in_increases_current_stock(): void
    {
        Event::fake([StockUpdated::class]);

        $action = app(RecordStockMovementAction::class);
        $movement = $action->execute(
            product: $this->product,
            quantity: 20,
            type: 'IN',
            notes: 'Restock shipment',
            userId: $this->superAdmin->id
        );

        $this->assertEquals(20, $movement->quantity);
        $this->assertEquals('IN', $movement->type);
        $this->assertEquals(70, $this->product->fresh()->current_stock);

        Event::assertDispatched(StockUpdated::class, function ($event) {
            return $event->product->id === $this->product->id && $event->movementType === 'IN';
        });
    }

    public function test_stock_out_decreases_current_stock(): void
    {
        Event::fake([StockUpdated::class]);

        $action = app(RecordStockMovementAction::class);
        $movement = $action->execute(
            product: $this->product,
            quantity: 15,
            type: 'OUT',
            notes: 'Customer order',
            userId: $this->superAdmin->id
        );

        $this->assertEquals(-15, $movement->quantity);
        $this->assertEquals('OUT', $movement->type);
        $this->assertEquals(35, $this->product->fresh()->current_stock);

        Event::assertDispatched(StockUpdated::class, function ($event) {
            return $event->product->id === $this->product->id && $event->movementType === 'OUT';
        });
    }

    public function test_stock_out_fails_when_quantity_exceeds_current_stock(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Insufficient stock to process this Stock-Out transaction.');

        $action = app(RecordStockMovementAction::class);
        $action->execute(
            product: $this->product,
            quantity: 100, // available is 50
            type: 'OUT',
            notes: 'Excessive order',
            userId: $this->superAdmin->id
        );
    }

    public function test_controller_records_stock_movement_via_post_request(): void
    {
        Event::fake([StockUpdated::class]);

        $response = $this->actingAs($this->superAdmin)
            ->from('/inventory')
            ->post(route('products.stock', [
                'slug' => $this->superAdmin->slug,
                'product' => $this->product->id,
            ]), [
                'quantity' => 10,
                'type' => 'IN',
                'notes' => 'Received via controller',
            ]);

        $response->assertRedirect('/inventory');
        $response->assertSessionHas('success');
        $this->assertEquals(60, $this->product->fresh()->current_stock);

        Event::assertDispatched(StockUpdated::class);
    }

    public function test_unauthorized_user_cannot_adjust_stock(): void
    {
        $staffUser = User::factory()->create([
            'role' => 'Staff',
            'role_id' => null,
        ]);

        $response = $this->actingAs($staffUser)
            ->post(route('products.stock', [
                'slug' => $staffUser->slug,
                'product' => $this->product->id,
            ]), [
                'quantity' => 10,
                'type' => 'IN',
            ]);

        $response->assertForbidden();
    }
}
