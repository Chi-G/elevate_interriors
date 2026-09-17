<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index($slug = null)
    {
        $this->authorize('categories.view');

        return Inertia::render('Catalog/Categories/Index', [
            'categories' => Category::roots()->withCount('children')->latest()->paginate(10),
            'parentCategories' => Category::roots()->get(),
        ]);
    }

    public function show(Category $category, $slug = null)
    {
        return redirect()->route('categories.index', ['slug' => auth()->user()->slug]);
    }

    public function store(StoreCategoryRequest $request, $slug = null)
    {
        Category::create($request->validated());

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(UpdateCategoryRequest $request, Category $category, $slug = null)
    {
        $category->update($request->validated());

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category, $slug = null)
    {
        $this->authorize('categories.delete');

        if ($category->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category containing products.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
