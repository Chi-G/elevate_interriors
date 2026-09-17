<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index($slug = null)
    {
        $this->authorize('suppliers.view');

        return Inertia::render('Catalog/Suppliers/Index', [
            'suppliers' => Supplier::all(),
        ]);
    }

    public function show(Supplier $supplier, $slug = null)
    {
        return redirect()->route('suppliers.index', ['slug' => auth()->user()->slug]);
    }

    public function store(StoreSupplierRequest $request, $slug = null)
    {
        Supplier::create($request->validated());

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier, $slug = null)
    {
        $supplier->update($request->validated());

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier, $slug = null)
    {
        $this->authorize('suppliers.delete');

        $supplier->delete();

        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }
}
