<?php

namespace App\Http\Controllers;

use App\Actions\Inventory\RecordStockMovementAction;
use App\Http\Requests\StoreStockMovementRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    /**
     * Display a listing of stock movements.
     */
    public function index(Request $request, $slug = null)
    {
        $this->authorize('inventory.view');

        $movements = StockMovement::with(['product', 'user', 'supplier'])
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventory/Logs', [
            'movements' => $movements,
            'filters' => $request->only(['type']),
        ]);
    }

    /**
     * Handle incoming stock adjustments.
     */
    public function store(StoreStockMovementRequest $request, Product $product, RecordStockMovementAction $action, $slug = null)
    {
        try {
            $action->execute(
                product: $product,
                quantity: $request->integer('quantity'),
                type: $request->string('type')->value(),
                notes: $request->input('notes'),
                userId: $request->user()->id,
                supplierId: $request->filled('supplier_id') ? $request->integer('supplier_id') : null,
            );

            $actionLabel = match ($request->input('type')) {
                'IN' => 'Stock-In',
                'OUT' => 'Stock-Out',
                default => 'Stock Adjustment',
            };

            return back()->with('success', "{$actionLabel} of {$request->input('quantity')} units recorded successfully for {$product->name}.");
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function export($slug = null)
    {
        $this->authorize('inventory.export');

        $movements = StockMovement::with(['product', 'user', 'supplier'])->latest()->get();
        $csvHeader = ['Date', 'Type', 'Product SKU', 'Product Name', 'Quantity', 'Handled By', 'Supplier', 'Notes'];

        $callback = function () use ($movements, $csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);

            foreach ($movements as $m) {
                fputcsv($file, [
                    $m->created_at->format('Y-m-d H:i:s'),
                    $m->type,
                    $m->product->sku,
                    $m->product->name,
                    ($m->type === 'OUT' ? '-' : '+').$m->quantity,
                    $m->user?->name ?? 'System',
                    $m->supplier?->name ?? 'N/A',
                    $m->notes ?? '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=movement_logs_'.date('Y-m-d').'.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }
}
