import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { Box, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Printer, ImageIcon, RefreshCcw, Download } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import Swal from 'sweetalert2';

export default function Index({ products, categories, suppliers, filters }) {
    const { auth, flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [parentCategoryId, setParentCategoryId] = useState(filters.parent_category_id || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    
    // Get subcategories for the selected parent
    const selectedParent = categories.find(c => c.id == parentCategoryId);
    const availableSubCategories = selectedParent ? selectedParent.children : [];
    
    // Stock Adjustment Form State
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'IN',
        quantity: '',
        supplier_id: '',
        notes: ''
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('products.index', { slug: auth.user.slug }), { search, parent_category_id: parentCategoryId, category_id: categoryId }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, parentCategoryId, categoryId]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This product will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('products.destroy', { product: id, slug: auth.user.slug }));
            }
        });
    };

    const openAdjustModal = (product) => {
        clearErrors();
        reset();
        setSelectedProduct(product);
        setIsAdjusting(true);
    };

    const closeAdjustModal = () => {
        setIsAdjusting(false);
        setTimeout(() => {
            setSelectedProduct(null);
            reset();
        }, 300);
    };

    const submitAdjustment = (e) => {
        e.preventDefault();
        post(route('products.stock', { product: selectedProduct.id, slug: auth.user.slug }), {
            preserveScroll: true,
            onSuccess: () => closeAdjustModal(),
        });
    };

    return (
        <AuthenticatedLayout header="Product Catalog">
            <Head title="Products" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Product Catalog</h1>
                    <p className="text-slate-500 mt-1 text-sm font-normal">Manage physical stock, barcodes, and product details.</p>
                </div>
                <div className="flex gap-3">
                    {auth.can['products.export'] && (
                        <a 
                            href={route('products.export', { slug: usePage().props.auth.user.slug })} 
                            className="h-11 px-5 bg-white text-slate-700 border border-[#EAE6DF] rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-[#FAF8F5] transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                            Export CSV
                        </a>
                    )}
                    {auth.can['products.create'] && (
                        <Link href={route('products.create', { slug: auth.user.slug })}>
                            <PrimaryButton className="h-11 px-5 bg-[#B8874A] hover:bg-[#A3743B] flex items-center gap-2 shadow-sm border-transparent transition-all">
                                <Plus className="w-5 h-5" />
                                Add product
                            </PrimaryButton>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <TextInput
                        className="w-full pl-10 h-11 bg-[#FAF8F5] border-transparent focus:bg-white focus:ring-[#C9A24B]/30"
                        placeholder="Search by SKU or Product Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 ml-2" />
                    <select
                        className="h-11 border-transparent bg-[#FAF8F5] rounded-xl text-sm font-medium text-slate-600 focus:ring-[#C9A24B]/30 min-w-[180px]"
                        value={parentCategoryId}
                        onChange={(e) => {
                            setParentCategoryId(e.target.value);
                            setCategoryId(''); // Reset sub-category when parent changes
                        }}
                    >
                        <option value="">All Main Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className={`h-11 border-transparent bg-[#FAF8F5] rounded-xl text-sm font-medium text-slate-600 focus:ring-[#C9A24B]/30 min-w-[180px] transition-opacity ${!parentCategoryId ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={!parentCategoryId}
                    >
                        <option value="">All Sub-categories</option>
                        {availableSubCategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAF8F5]/80 border-b border-[#EAE6DF]">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">SKU & Barcode</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory</th>
                                {(auth.can['products.edit'] || auth.can['products.delete'] || auth.can['products.barcode'] || auth.can['inventory.adjust']) && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F2EFE9]">
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-[#FAF8F5]/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-center overflow-hidden shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 truncate max-w-[200px]">{product.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{product.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col"> 
                                            {product.category?.parent && (
                                                <span className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                                                    {product.category.parent.name}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-[#FBF7EE] text-[#B8874A] rounded-full text-[11px] font-semibold ring-1 ring-[#F0E6D2] w-fit">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-mono font-bold text-slate-700">{product.sku}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">BC: {product.barcode_value}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-800">₦{parseFloat(product.retail_price).toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Cost: ₦{parseFloat(product.cost_price).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${product.current_stock <= product.alert_threshold ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                            <span className={`text-xs font-bold ${product.current_stock <= product.alert_threshold ? 'text-amber-600' : 'text-slate-600'}`}>
                                                {product.current_stock} pcs
                                            </span>
                                            {product.current_stock <= product.alert_threshold && (
                                                <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Low</span>
                                            )}
                                        </div>
                                    </td>
                                    {(auth.can['products.edit'] || auth.can['products.delete'] || auth.can['products.barcode'] || auth.can['inventory.adjust']) && (
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                {auth.can['products.edit'] && (
                                                    <Link 
                                                        href={route('products.edit', { product: product.id, slug: auth.user.slug })}
                                                        className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#B8874A] hover:bg-[#FBF7EE] transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content width="40">
                                                        {auth.can['products.barcode'] && (
                                                            <button 
                                                                onClick={() => window.open(route('products.print', { product: product.id, slug: auth.user.slug }), '_blank')}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                <Printer className="w-4 h-4" /> Print label
                                                            </button>
                                                        )}
                                                        {auth.can['inventory.adjust'] && (
                                                            <button 
                                                                onClick={() => openAdjustModal(product)}
                                                                className="w-full text-left px-4 py-2 text-sm text-[#B8874A] hover:bg-[#FBF7EE] flex items-center gap-2 font-medium"
                                                            >
                                                                <RefreshCcw className="w-4 h-4" /> Adjust stock
                                                            </button>
                                                        )}
                                                        {auth.can['products.delete'] && (
                                                            <button 
                                                                onClick={() => handleDelete(product.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete
                                                            </button>
                                                        )}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Box className="w-12 h-12 text-slate-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Products Found</h3>
                                            <p className="text-sm text-slate-400 mt-2">Try adjusting your search or add a new item.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {products.links.length > 3 && (
                    <div className="px-6 py-4 bg-[#FAF8F5]/80 border-t border-[#EAE6DF] flex justify-center gap-2">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    link.active 
                                        ? 'bg-[#B8874A] text-white shadow-md' 
                                        : 'text-slate-500 hover:bg-white hover:text-[#B8874A] border border-transparent hover:border-[#F0E6D2]'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Adjust Stock Modal */}
            <Modal show={isAdjusting} onClose={closeAdjustModal} maxWidth="md">
                <form onSubmit={submitAdjustment} className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Adjust Stock: {selectedProduct?.name}</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="type" value="Adjustment Type" />
                            <select
                                id="type"
                                className="mt-1 block w-full border-[#EAE6DF] rounded-xl focus:border-[#C9A24B] focus:ring-[#C9A24B] text-sm"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                required
                            >
                                <option value="IN">Stock-In (Receive Goods)</option>
                                <option value="OUT">Stock-Out (Deduct Goods)</option>
                                <option value="ADJUSTMENT">Correction/Audit</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="quantity" value="Quantity" />
                            <TextInput
                                id="quantity"
                                type="number"
                                className="mt-1 block w-full border-[#EAE6DF] focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                                min="1"
                                required
                                placeholder="Enter amount to adjust..."
                            />
                            <InputError message={errors.quantity} className="mt-2" />
                        </div>

                        {data.type === 'IN' && (
                            <div className="animate-in slide-in-from-top-2">
                                <InputLabel htmlFor="supplier_id" value="Supplier (Optional)" />
                                <select
                                    id="supplier_id"
                                    className="mt-1 block w-full border-[#EAE6DF] rounded-xl focus:border-[#C9A24B] focus:ring-[#C9A24B] text-sm"
                                    value={data.supplier_id}
                                    onChange={e => setData('supplier_id', e.target.value)}
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers && suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.supplier_id} className="mt-2" />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="notes" value="Notes / Reason" />
                            <TextInput
                                id="notes"
                                type="text"
                                className="mt-1 block w-full border-[#EAE6DF] focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder={data.type === 'IN' ? 'PO#1234...' : 'Broken item, auditing, etc...'}
                            />
                            <InputError message={errors.notes} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={closeAdjustModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#B8874A] hover:bg-[#A3743B]">
                            Process adjustment
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
