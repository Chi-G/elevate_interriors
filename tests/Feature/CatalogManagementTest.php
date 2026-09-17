<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'Super Admin',
        ]);
    }

    public function test_can_create_category_via_form_request(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('categories.store', ['slug' => $this->admin->slug]), [
                'name' => 'Office Furniture',
                'description' => 'Desks, chairs, and lamps.',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categories', [
            'name' => 'Office Furniture',
        ]);
    }

    public function test_cannot_create_duplicate_category(): void
    {
        Category::factory()->create(['name' => 'Lighting']);

        $response = $this->actingAs($this->admin)
            ->post(route('categories.store', ['slug' => $this->admin->slug]), [
                'name' => 'Lighting',
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    public function test_can_create_supplier_via_form_request(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('suppliers.store', ['slug' => $this->admin->slug]), [
                'name' => 'Acme Timber Co',
                'email' => 'contact@acmetimber.com',
                'phone' => '+1234567890',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Acme Timber Co',
            'email' => 'contact@acmetimber.com',
        ]);
    }

    public function test_can_create_product_via_form_request(): void
    {
        $category = Category::factory()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('products.store', ['slug' => $this->admin->slug]), [
                'sku' => 'ELV-CHAIR-01',
                'name' => 'Ergonomic Mesh Chair',
                'description' => 'High-end ergonomic chair',
                'category_id' => $category->id,
                'alert_threshold' => 5,
                'cost_price' => 120.00,
                'retail_price' => 249.99,
            ]);

        $response->assertRedirect(route('products.index', ['slug' => $this->admin->slug]));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('products', [
            'sku' => 'ELV-CHAIR-01',
            'name' => 'Ergonomic Mesh Chair',
            'barcode_value' => 'ELV-CHAIR-01',
        ]);
    }

    public function test_can_update_product_via_form_request(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'sku' => 'ELV-SOFA-01',
            'name' => 'Original Sofa',
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('products.update', [
                'slug' => $this->admin->slug,
                'product' => $product->id,
            ]), [
                'sku' => 'ELV-SOFA-01',
                'name' => 'Updated Luxury Sofa',
                'category_id' => $category->id,
                'alert_threshold' => 3,
                'cost_price' => 300.00,
                'retail_price' => 599.99,
            ]);

        $response->assertRedirect(route('products.index', ['slug' => $this->admin->slug]));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Luxury Sofa',
        ]);
    }
}
