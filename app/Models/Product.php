<?php

namespace App\Models;

use App\Actions\Inventory\RecordStockMovementAction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'cost_price',
        'retail_price',
        'image_path',
        'barcode_value',
        'barcode_symbology',
        'attributes',
        'alert_threshold',
        'current_stock',
    ];

    protected $casts = [
        'attributes' => 'array',
        'cost_price' => 'float',
        'retail_price' => 'float',
    ];

    protected $appends = ['image_url'];

    // Removed current_stock append to favor real DB column

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Removed getCurrentStockAttribute to favor direct column access for performance

    /**
     * Helper to perform a stock adjustment and generate a movement record.
     */
    public function adjustStock(int $absoluteQuantity, string $type, ?string $notes = null, ?int $userId = null, ?int $supplierId = null)
    {
        return app(RecordStockMovementAction::class)->execute(
            product: $this,
            quantity: $absoluteQuantity,
            type: $type,
            notes: $notes,
            userId: $userId,
            supplierId: $supplierId
        );
    }

    /**
     * Get the full URL for the product image.
     */
    public function getImageUrlAttribute()
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
