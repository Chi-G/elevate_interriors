<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request, $slug = null)
    {
        $this->authorize('products.view');
        $products = Product::with('category.parent')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $category_id) {
                $query->where('category_id', $category_id);
            })
            ->when($request->parent_category_id, function ($query, $parent_id) {
                $subCategoryIds = Category::where('parent_id', $parent_id)->pluck('id');
                $query->whereIn('category_id', $subCategoryIds);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Catalog/Products/Index', [
            'products' => $products,
            'categories' => Category::roots()->with('children')->get(),
            'suppliers' => Supplier::orderBy('name')->get(),
            'filters' => $request->only(['search', 'category_id', 'parent_category_id']),
        ]);
    }

    public function create($slug = null)
    {
        $this->authorize('products.create');

        return Inertia::render('Catalog/Products/Modify', [
            'categories' => Category::roots()->with('children')->get(),
            'sku_suggestion' => 'ELV-'.strtoupper(Str::random(6)),
        ]);
    }

    public function store(StoreProductRequest $request, $slug = null)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        // Auto-generate barcode if blank
        if (empty($validated['barcode_value'])) {
            $validated['barcode_value'] = $validated['sku'];
        }

        Product::create($validated);

        return redirect()->route('products.index', ['slug' => auth()->user()->slug])->with('success', 'Product added to catalog.');
    }

    public function show(Product $product, $slug = null)
    {
        return redirect()->route('products.edit', [
            'slug' => auth()->user()->slug,
            'product' => $product->id,
        ]);
    }

    public function edit(Product $product, $slug = null)
    {
        $this->authorize('products.edit');

        return Inertia::render('Catalog/Products/Modify', [
            'product' => $product->load('category.parent'),
            'categories' => Category::roots()->with('children')->get(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product, $slug = null)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image_path) {
                Storage::delete($product->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('products.index', ['slug' => auth()->user()->slug])->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product, $slug = null)
    {
        $this->authorize('products.delete');

        if ($product->image_path) {
            Storage::delete($product->image_path);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Product removed from system.');
    }

    public function printBarcode(Product $product, $slug = null)
    {
        $this->authorize('products.barcode');

        return Inertia::render('Catalog/Products/ProductSheet', [
            'product' => $product,
        ]);
    }

    public function scanCenter($slug = null)
    {
        return Inertia::render('Catalog/Scanner/Index');
    }

    public function apiLookup($barcode)
    {
        $idCandidate = $barcode;
        if (str_contains($barcode, '-')) {
            $idCandidate = explode('-', $barcode)[0];
        }

        $product = Product::with(['category.parent'])
            ->where('barcode_value', $barcode)
            ->orWhere('sku', $barcode)
            ->orWhere(function ($query) use ($barcode, $idCandidate) {
                if (is_numeric($barcode)) {
                    $query->where('id', $barcode);
                } elseif (is_numeric($idCandidate)) {
                    $query->where('id', $idCandidate);
                }
            })
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'retail_price' => $product->retail_price,
            'cost_price' => $product->cost_price,
            'category_name' => $product->category?->name,
            'parent_category' => $product->category?->parent?->name,
            'image_url' => $product->image_url,
            'current_stock' => $product->current_stock,
            'alert_threshold' => $product->alert_threshold,
            'attributes' => $product->attributes,
        ]);
    }

    public function export($slug = null)
    {
        $this->authorize('products.export');

        $products = Product::with('category')->get();
        $csvHeader = ['SKU', 'Name', 'Category', 'Cost Price', 'Retail Price', 'Stock', 'Threshold'];

        $callback = function () use ($products, $csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->sku,
                    $product->name,
                    $product->category?->name ?? 'Uncategorized',
                    $product->cost_price,
                    $product->retail_price,
                    $product->current_stock,
                    $product->alert_threshold,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=products_export_'.date('Y-m-d').'.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }
}
