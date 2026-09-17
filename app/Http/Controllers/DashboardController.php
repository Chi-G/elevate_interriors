<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, $slug = null)
    {
        // 1. Core KPIs
        $totalProducts = Product::count();

        // Total Value: SUM(current_stock * retail_price)
        $totalValue = Product::selectRaw('COALESCE(SUM(current_stock * retail_price), 0) as total_value')
            ->value('total_value');

        // Low Stock Count: Products where current_stock <= alert_threshold
        $lowStockCount = Product::whereColumn('current_stock', '<=', 'alert_threshold')
            ->count();

        $totalSuppliers = Supplier::count();

        // 2. Recent Movements
        $recentMovements = StockMovement::with(['product', 'user'])
            ->latest()
            ->limit(5)
            ->get();

        // 3. Stock Status Distribution (Direct database aggregates for maximum speed)
        $stockStatus = [
            'out_of_stock' => Product::where('current_stock', '<=', 0)->count(),
            'low_stock' => Product::where('current_stock', '>', 0)
                ->whereColumn('current_stock', '<=', 'alert_threshold')
                ->count(),
            'healthy' => Product::whereColumn('current_stock', '>', 'alert_threshold')
                ->count(),
        ];

        // 4. Trends (Last 30 Days)
        $days = 30;
        $trendData = StockMovement::selectRaw('DATE(created_at) as date, type, SUM(quantity) as total')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date', 'type')
            ->get()
            ->groupBy('date');

        $trends = [];
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $movements = $trendData->get($date);

            $trends[] = [
                'date' => now()->subDays($i)->format('d M'),
                'in' => $movements ? (int) abs($movements->where('type', 'IN')->sum('total')) : 0,
                'out' => $movements ? (int) abs($movements->where('type', 'OUT')->sum('total')) : 0,
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'inventory_value' => (float) $totalValue,
                'low_stock_count' => $lowStockCount,
                'total_suppliers' => $totalSuppliers,
                'total_users' => User::where('role', '!=', 'Super Admin')
                    ->where('email', '!=', 'chijindu.nwokeohuru@gmail.com')
                    ->count(),
                'user_slug' => $request->user()?->slug,
            ],
            'recentMovements' => $recentMovements,
            'stockStatus' => $stockStatus,
            'trends' => $trends,
        ]);
    }
}
