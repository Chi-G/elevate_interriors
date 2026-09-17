<?php

namespace Tests\Feature;

use App\Actions\Inventory\RecordStockMovementAction;
use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Notifications\LowStockAlertNotification;
use App\Notifications\StaffWelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_low_stock_notification_sent_to_admins_when_stock_falls_to_or_below_threshold(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'Admin']);
        $manager = User::factory()->create(['role' => 'Manager']);
        $staff = User::factory()->create(['role' => 'Staff']);

        $category = Category::create(['name' => 'Lighting']);
        $product = Product::create([
            'sku' => 'LIGHT-001',
            'name' => 'Pendant Lamp',
            'category_id' => $category->id,
            'cost_price' => 20.00,
            'retail_price' => 45.00,
            'alert_threshold' => 5,
            'current_stock' => 8,
        ]);

        // Stock-out of 4 items reduces stock from 8 to 4 (which is <= alert_threshold 5)
        app(RecordStockMovementAction::class)->execute(
            product: $product,
            quantity: 4,
            type: 'OUT',
            userId: $admin->id
        );

        Notification::assertSentTo(
            [$admin, $manager],
            LowStockAlertNotification::class,
            function (LowStockAlertNotification $notification) use ($product) {
                return $notification->product->id === $product->id;
            }
        );

        Notification::assertNotSentTo([$staff], LowStockAlertNotification::class);
    }

    public function test_low_stock_notification_not_sent_when_stock_remains_above_threshold(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'Admin']);
        $category = Category::create(['name' => 'Chairs']);
        $product = Product::create([
            'sku' => 'CHAIR-001',
            'name' => 'Dining Chair',
            'category_id' => $category->id,
            'cost_price' => 50.00,
            'retail_price' => 120.00,
            'alert_threshold' => 3,
            'current_stock' => 15,
        ]);

        // Stock-out of 5 items leaves 10 in stock (which is > alert_threshold 3)
        app(RecordStockMovementAction::class)->execute(
            product: $product,
            quantity: 5,
            type: 'OUT',
            userId: $admin->id
        );

        Notification::assertNothingSent();
    }

    public function test_staff_welcome_notification_sent_when_admin_creates_user(): void
    {
        Notification::fake();

        $superAdmin = User::factory()->create(['role' => 'Super Admin']);
        Role::create(['name' => 'staff', 'display_name' => 'Staff']);

        $response = $this->actingAs($superAdmin)->post(route('users.store', ['slug' => $superAdmin->slug]), [
            'name' => 'Alice Staff',
            'email' => 'alice@elevateinteriors.space',
            'role' => 'Staff',
        ]);

        $response->assertSessionHasNoErrors();

        $createdUser = User::where('email', 'alice@elevateinteriors.space')->first();
        $this->assertNotNull($createdUser);

        Notification::assertSentTo(
            $createdUser,
            StaffWelcomeNotification::class,
            function (StaffWelcomeNotification $notification) {
                return $notification->temporaryPassword === 'password123';
            }
        );
    }
}
