<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {

        $admin = User::first();
        if (! $admin) {
            return;
        }

        $catalog = [
            'Furniture' => [
                'Sofas' => [
                    ['name' => 'Velvet Tufted 3-Seater Sofa', 'price' => 850000, 'cost' => 600000, 'attr' => [['key' => 'Material', 'value' => 'Velvet'], ['key' => 'Size', 'value' => '3-Seater']]],
                    ['name' => 'Contemporary Leather Sectional', 'price' => 1200000, 'cost' => 900000, 'attr' => [['key' => 'Material', 'value' => 'Top-grain Leather']]],
                ],
                'Centre Tables' => [
                    ['name' => 'Marble Top Circular Coffee Table', 'price' => 250000, 'cost' => 180000, 'attr' => [['key' => 'Material', 'value' => 'Carrara Marble']]],
                    ['name' => 'Tempered Glass Geometric Table', 'price' => 185000, 'cost' => 120000, 'attr' => [['key' => 'Material', 'value' => 'Glass/Steel']]],
                ],
                'Accent Chairs' => [
                    ['name' => 'Emerald Green Occasional Chair', 'price' => 145000, 'cost' => 95000, 'attr' => [['key' => 'Style', 'value' => 'Mid-Century']]],
                ],
            ],
            'Beddings' => [
                'Duvets' => [
                    ['name' => 'Luxury Goose Down Duvet - King', 'price' => 125000, 'cost' => 85000, 'attr' => [['key' => 'Size', 'value' => 'King'], ['key' => 'Material', 'value' => 'Goose Down']]],
                ],
                'Bedsheet Sets' => [
                    ['name' => 'Egyptian Cotton 1000TC Sheet Set', 'price' => 75000, 'cost' => 45000, 'attr' => [['key' => 'Material', 'value' => 'Cotton'], ['key' => 'Thread Count', 'value' => '1000']]],
                ],
            ],
            'Lighting' => [
                'Table Lamps' => [
                    ['name' => 'Crystal Base Bedside Lamp', 'price' => 65000, 'cost' => 35000],
                ],
                'Wall Sconces' => [
                    ['name' => 'Modern Gold Linear Sconce', 'price' => 45000, 'cost' => 25000],
                ],
            ],
            'Home Decor' => [
                'Vases' => [
                    ['name' => 'Metallic Gold Hammered Vase', 'price' => 35000, 'cost' => 15000, 'attr' => [['key' => 'Material', 'value' => 'Metallic']]],
                    ['name' => 'Handmade Rattan Floor Vase', 'price' => 48000, 'cost' => 22000, 'attr' => [['key' => 'Material', 'value' => 'Rattan']]],
                ],
                'Figurines' => [
                    ['name' => 'Abstract Resin Panther', 'price' => 28000, 'cost' => 12000],
                ],
            ],
            'Fragrance' => [
                'Scented Candles' => [
                    ['name' => 'Sandlewood & Amber Soy Candle', 'price' => 18000, 'cost' => 8000],
                ],
                'Diffusers' => [
                    ['name' => 'Ultrasonic Ceramic Humidifier', 'price' => 35000, 'cost' => 20000],
                ],
            ],
            'Plants' => [
                'Artificial Plants' => [
                    ['name' => 'Fiddle Leaf Fig - 180cm', 'price' => 75000, 'cost' => 40000, 'attr' => [['key' => 'Height', 'value' => '180cm']]],
                ],
            ],
        ];

        foreach ($catalog as $parentName => $subs) {
            $parentCat = Category::where('name', $parentName)->first();
            if (! $parentCat) {
                continue;
            }

            foreach ($subs as $subName => $products) {
                $subCat = Category::where('name', $subName)->where('parent_id', $parentCat->id)->first() ?: $parentCat;

                foreach ($products as $pData) {
                    $productExists = Product::where('name', $pData['name'])
                        ->where('category_id', $subCat->id)
                        ->first();

                    $sku = $productExists ? strtoupper($productExists->sku) : strtoupper(substr($parentName, 0, 3)).'-'.strtoupper(substr($subName, 0, 3)).'-'.strtoupper(Str::random(4));

                    $product = Product::updateOrCreate(
                        ['name' => $pData['name'], 'category_id' => $subCat->id],
                        [
                            'sku' => $sku,
                            'description' => "Premium quality {$pData['name']} from the {$parentName} collection.",
                            'cost_price' => $pData['cost'],
                            'retail_price' => $pData['price'],
                            'barcode_value' => $sku,
                            'barcode_symbology' => 'CODE128',
                            'attributes' => $pData['attr'] ?? [],
                            'alert_threshold' => 5,
                        ]
                    );

                    // Add initial stock only if it doesn't already have the seed movement
                    $hasSeedMovement = StockMovement::where('product_id', $product->id)
                        ->where('notes', 'Initial inventory seed.')
                        ->exists();

                    if (! $hasSeedMovement) {
                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => $admin->id,
                            'quantity' => rand(10, 50),
                            'type' => 'IN',
                            'notes' => 'Initial inventory seed.',
                        ]);
                    }
                }
            }
        }

        // Final Sync: Ensure current_stock matches all movements
        // This fixes instances where stock was added previously while events were disabled
        foreach (Product::all() as $product) {
            $actualStock = StockMovement::where('product_id', $product->id)->sum('quantity');
            $product->update(['current_stock' => (int) $actualStock]);
        }
    }
}
