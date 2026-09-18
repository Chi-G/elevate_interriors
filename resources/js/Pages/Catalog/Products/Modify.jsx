import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeft, Box, Upload, X, HelpCircle, CheckCircle2, Wallet, Tag, PlusCircle, MinusCircle, Layers } from 'lucide-react';

export default function Modify({ product = null, categories, sku_suggestion = '' }) {
    const isEditing = !!product;
    const { auth } = usePage().props;
    const [imagePreview, setImagePreview] = useState(product?.image_url || null);
    const fileInputRef = useRef();

    // Hierarchy state
    const [parentCategoryId, setParentCategoryId] = useState(() => {
        if (!product?.category_id) return '';
        const currentCat = categories.find(c => c.id === product.category_id);
        return currentCat?.parent_id || currentCat?.id || '';
    });

    const { data, setData, post, processing, errors, transform } = useForm({
        sku: product?.sku || sku_suggestion,
        name: product?.name || '',
        description: product?.description || '',
        category_id: product?.category_id || '',
        barcode_value: product?.barcode_value || '',
        alert_threshold: product?.alert_threshold || 10,
        cost_price: product?.cost_price || 0,
        retail_price: product?.retail_price || 0,
        attributes: product?.attributes || [], // [{key: 'Size', value: 'XL'}]
        image: null,
        _method: isEditing ? 'PUT' : 'POST',
    });

    const mainCategories = categories;
    const selectedParentCat = categories.find(c => c.id == parentCategoryId);
    const subCategories = selectedParentCat ? selectedParentCat.children : [];

    const handleParentCategoryChange = (e) => {
        const newParentId = e.target.value;
        setParentCategoryId(newParentId);
        // If the new parent has no subcategories, or user wants to bind to root,
        // we set the category_id to the parent itself.
        setData('category_id', newParentId);
    };

    const addAttribute = () => {
        setData('attributes', [...data.attributes, { key: '', value: '' }]);
    };

    const updateAttribute = (index, field, value) => {
        const newAttributes = [...data.attributes];
        newAttributes[index][field] = value;
        setData('attributes', newAttributes);
    };

    const removeAttribute = (index) => {
        setData('attributes', data.attributes.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();

        // Laravel doesn't support native PUT with files, so we POST and spoof the method.
        if (isEditing) {
            post(route('products.update', { slug: auth.user.slug, product: product.id }));
        } else {
            post(route('products.store', { slug: auth.user.slug }));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? `Edit: ${product.name}` : 'New Product'}>
            <Head title={isEditing ? 'Edit Product' : 'Add Product'} />

            <div className="mb-8">
                <Link
                    href={route('products.index', { slug: auth.user.slug })}
                    className="group inline-flex items-center text-slate-500 hover:text-[#B8874A] transition-colors text-sm font-medium mb-3"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to catalog
                </Link>
                <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {isEditing ? `Update details and inventory rules for ${product.name}.` : 'Add a new luxury interior item to your collection.'}
                </p>
            </div>

            <form onSubmit={submit} className="max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-[#FBF7EE] text-[#B8874A] flex items-center justify-center">
                                    <Box className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Product Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="sku" value="Stock Keeping Unit (SKU)" className="text-slate-500" />
                                    <div className="relative">
                                        <TextInput
                                            id="sku"
                                            className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 uppercase font-mono tracking-wider focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                            required
                                        />
                                        {!isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setData('sku', 'ELV-' + Math.random().toString(36).substr(2, 6).toUpperCase())}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#B8874A] hover:text-[#A3743B] bg-[#FBF7EE] hover:bg-[#F5EEDC] px-2 py-1 rounded transition-colors"
                                            >
                                                Regen
                                            </button>
                                        )}
                                    </div>
                                    <InputError className="mt-2" message={errors.sku} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="parent_category_id" value="Main Category" className="text-slate-500" />
                                        <select
                                            id="parent_category_id"
                                            className="mt-1 block w-full border-slate-200 bg-slate-50 rounded-xl shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] h-12 text-sm font-medium text-slate-700 focus:bg-white"
                                            value={parentCategoryId}
                                            onChange={handleParentCategoryChange}
                                            required
                                        >
                                            <option value="">Select Main Category</option>
                                            {mainCategories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="category_id" value="Sub-category (Optional)" className="text-slate-500" />
                                        <select
                                            id="category_id"
                                            className="mt-1 block w-full border-slate-200 bg-slate-50 rounded-xl shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] h-12 text-sm font-medium text-slate-700 focus:bg-white disabled:opacity-50"
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            disabled={!parentCategoryId}
                                        >
                                            <option value={parentCategoryId}>None (Top-Level)</option>
                                            {subCategories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={errors.category_id} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Product Display Name" className="text-slate-500" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B] text-lg font-bold"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Minimalist Velvet Armchair"
                                    required
                                    style={{ fontSize: '14px' }}
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Detailed Description" className="text-slate-500" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full rounded-2xl border-slate-200 bg-slate-50 shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] min-h-[120px] p-4 text-slate-700 focus:bg-white transition-all"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Provide detailed information about materials, dimensions, and style..."
                                />
                                <InputError className="mt-2" message={errors.description} />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Financial Data</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="cost_price" value="Cost Price (Buy)" className="text-slate-500" />
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">₦</span>
                                        <TextInput
                                            id="cost_price"
                                            type="number"
                                            step="0.01"
                                            className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 pl-10 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                            value={data.cost_price}
                                            onChange={(e) => setData('cost_price', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError className="mt-2" message={errors.cost_price} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="retail_price" value="Retail Price (Sell)" className="text-slate-500" />
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">₦</span>
                                        <TextInput
                                            id="retail_price"
                                            type="number"
                                            step="0.01"
                                            className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 pl-10 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B] font-bold text-[#B8874A]"
                                            value={data.retail_price}
                                            onChange={(e) => setData('retail_price', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError className="mt-2" message={errors.retail_price} />
                                </div>
                            </div>
                        </div>

                        {/* Attributes Section */}
                        <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#FBF7EE] text-[#B8874A] flex items-center justify-center">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Product Specifications</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addAttribute}
                                    className="text-xs font-semibold text-[#B8874A] hover:text-[#A3743B] bg-[#FBF7EE] hover:bg-[#F5EEDC] px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Add property
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.attributes.length === 0 && (
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">No custom properties defined (Size, Color, etc.)</p>
                                    </div>
                                )}

                                {data.attributes.map((attr, index) => (
                                    <div key={index} className="flex gap-4 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div className="flex-1">
                                            <TextInput
                                                className="w-full bg-slate-50 border-slate-200 h-11"
                                                value={attr.key}
                                                onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                                                placeholder="Label (e.g. Size)"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <TextInput
                                                className="w-full bg-slate-50 border-slate-200 h-11"
                                                value={attr.value}
                                                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                                placeholder="Value (e.g. King-Size)"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(index)}
                                            className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <MinusCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                Useful for filtering and technical sheets (Material, Dimensions, weight etc.)
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-xl bg-[#FBF7EE] text-[#B8874A] flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Advanced Parameters</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="barcode_value" value="Manual Barcode (EAN-13/UPC)" className="text-slate-500" />
                                    <TextInput
                                        id="barcode_value"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 font-mono focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                        value={data.barcode_value}
                                        onChange={(e) => setData('barcode_value', e.target.value)}
                                        placeholder="Leave blank to auto-gen from SKU"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <InputError className="mt-2" message={errors.barcode_value} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="alert_threshold" value="Low Stock Alert Threshold" className="text-slate-500" />
                                    <TextInput
                                        id="alert_threshold"
                                        type="number"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 h-12 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                        value={data.alert_threshold}
                                        onChange={(e) => setData('alert_threshold', e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Triggers notification when stock dips below this value.</p>
                                    <InputError className="mt-2" message={errors.alert_threshold} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image Upload & Preview */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Product Imagery</h3>

                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[320px] ${imagePreview
                                        ? 'border-[#D9C4A1] bg-slate-50'
                                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-[#C9A24B]'
                                    }`}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full group">
                                        <img src={imagePreview} alt="Preview" className="w-full h-[320px] object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                className="bg-white p-2 rounded-full text-red-500 hover:bg-red-50 shadow-lg"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center">
                                        <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-600">Click to upload photo</p>
                                        <p className="text-xs text-slate-400 mt-2">supports WEBP, PNG, JPG up to 2MB</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <InputError className="mt-2" message={errors.image} />

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Primary search thumbnail</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>High resolution mobile optimization</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl space-y-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Publish Settings</h3>
                            <PrimaryButton
                                disabled={processing}
                                className="w-full h-12 bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] flex items-center justify-center gap-2 border-transparent text-sm"
                            >
                                {isEditing ? 'Save changes' : 'Create product'}
                            </PrimaryButton>
                            <SecondaryButton
                                type="button"
                                onClick={() => router.get(route('products.index', { slug: auth.user.slug }))}
                                className="w-full h-12 bg-transparent text-slate-400 border-slate-800 hover:bg-slate-800 flex items-center justify-center text-sm"
                            >
                                Discard & exit
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
