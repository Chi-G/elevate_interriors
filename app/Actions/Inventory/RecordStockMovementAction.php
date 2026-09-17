<?php

namespace App\Actions\Inventory;

use App\Events\StockUpdated;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RecordStockMovementAction
{
    /**
     * Record a stock movement with pessimistic locking and transactional integrity.
     *
     * @param  string  $type  'IN', 'OUT', or 'ADJUSTMENT'
     *
     * @throws Exception|InvalidArgumentException
     */
    public function execute(
        Product $product,
        int $quantity,
        string $type,
        ?string $notes = null,
        ?int $userId = null,
        ?int $supplierId = null
    ): StockMovement {
        return DB::transaction(function () use ($product, $quantity, $type, $notes, $userId, $supplierId) {
            // 1. Lock the product row for update to prevent concurrent race conditions
            $lockedProduct = Product::where('id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            // 2. Determine signed quantity delta
            $signedDelta = match ($type) {
                'IN' => abs($quantity),
                'OUT' => -abs($quantity),
                'ADJUSTMENT' => $quantity,
                default => throw new InvalidArgumentException("Invalid stock movement type: {$type}"),
            };

            // 3. Concurrency check: prevent negative stock on Stock-Out transactions
            if ($type === 'OUT' && ($lockedProduct->current_stock + $signedDelta < 0)) {
                throw new Exception('Insufficient stock to process this Stock-Out transaction.');
            }

            // 4. Create movement record (triggers booted() model hook for current_stock sync)
            $movement = $lockedProduct->stockMovements()->create([
                'quantity' => $signedDelta,
                'type' => $type,
                'notes' => $notes,
                'user_id' => $userId ?? auth()->id(),
                'supplier_id' => $supplierId,
            ]);

            // 5. Broadcast real-time stock update ONLY after transaction commits
            DB::afterCommit(function () use ($lockedProduct, $userId, $type) {
                $user = $userId ? User::find($userId) : auth()->user();
                event(new StockUpdated($lockedProduct->fresh(), $user, $type));
            });

            return $movement;
        });
    }
}
