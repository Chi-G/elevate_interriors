import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { List, Plus, Edit, Trash2, ChevronRight, Layers } from 'lucide-react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ categories, parentCategories }) {
    const { auth, flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        parent_id: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category) => {
        clearErrors();
        setSelectedCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id || '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('categories.store', { slug: auth.user.slug }), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('categories.update', { category: selectedCategory.id, slug: auth.user.slug }), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedCategory(null);
            },
        });
    };

    const handleDelete = (category) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This category will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B8874A',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('categories.destroy', { category: category.id, slug: auth.user.slug }));
            }
        });
    };

    return (
        <AuthenticatedLayout header="Categories">
            <Head title="Categories" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Categories & Taxonomy</h1>
                    <p className="text-slate-500 text-sm mt-1">Organize your interior inventory by type and style.</p>
                </div>
                {auth.can['categories.create'] && (
                    <div className="flex-shrink-0">
                        <PrimaryButton
                            onClick={openCreateModal}
                            className="w-full md:w-auto h-11 px-6 bg-[#B8874A] hover:bg-[#A3743B] focus:ring-2 focus:ring-[#C9A24B] flex items-center justify-center gap-2 border-transparent text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            New category
                        </PrimaryButton>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.data.map((category) => (
                    <div key={category.id} className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            {auth.can['categories.edit'] && (
                                <button onClick={() => openEditModal(category)} className="p-2 bg-slate-50 hover:bg-[#FBF7EE] text-slate-400 hover:text-[#B8874A] rounded-lg border border-slate-100 transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-[#FBF7EE] text-[#B8874A] flex items-center justify-center">
                                {category.parent_id ? <Layers className="w-5 h-5" /> : <List className="w-5 h-5" />}
                            </div>
                            {category.parent && (
                                <div className="flex items-center text-xs font-medium text-slate-400">
                                    <span>{category.parent.name}</span>
                                    <ChevronRight className="w-3 h-3 mx-1" />
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{category.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                            {category.description || 'No description provided.'}
                        </p>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {category.children_count || 0} Sub-categories
                            </span>
                            <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase bg-[#FBF7EE] text-[#B8874A]">
                                Main Category
                            </span>
                        </div>
                    </div>
                ))}

                {categories.data.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                            <List className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600">No categories yet</h3>
                        <p className="text-slate-400 mt-1 max-w-xs">Start by adding your first product category to organize your warehouse.</p>
                        <PrimaryButton onClick={openCreateModal} className="mt-6 bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B]">Add category</PrimaryButton>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {categories.links && categories.links.length > 3 && (
                <div className="mt-8 flex justify-center gap-2">
                    {categories.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${link.active
                                    ? 'bg-[#B8874A] text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-white hover:text-[#B8874A] border border-transparent hover:border-[#D9C4A1]'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-8">
                    <h2 className="text-xl font-serif font-medium text-[#1E1B18] mb-6">Create New Category</h2>

                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Category Name" className="text-slate-600" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Living Room Furniture"
                                required
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="parent_id" value="Parent Category (Optional)" className="text-slate-600" />
                            <select
                                id="parent_id"
                                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] bg-slate-50 focus:bg-white"
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                            >
                                <option value="">None (Make this a Top-Level Category)</option>
                                {parentCategories.map(parent => (
                                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={errors.parent_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" className="text-slate-600" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] bg-slate-50 focus:bg-white min-h-[100px]"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe the type of products in this category..."
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)} className="border-slate-200 text-slate-600">Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] h-11 px-6">Create category</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEdit} className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-serif font-medium text-[#1E1B18]">Edit Category</h2>
                        {auth.can['categories.delete'] && (
                            <button
                                type="button"
                                onClick={() => {
                                    Swal.fire({
                                        title: 'Are you sure?',
                                        text: "This category will be permanently deleted!",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#B8874A',
                                        cancelButtonColor: '#ef4444',
                                        confirmButtonText: 'Yes, delete it!'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            router.delete(route('categories.destroy', { category: selectedCategory.id, slug: auth.user.slug }), {
                                                onSuccess: () => setIsEditModalOpen(false)
                                            });
                                        }
                                    });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Category Name" />
                            <TextInput
                                id="edit_name"
                                className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_parent_id" value="Parent Category" />
                            <select
                                id="edit_parent_id"
                                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] bg-slate-50 focus:bg-white"
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                            >
                                <option value="">None (Top-Level)</option>
                                {parentCategories
                                    .filter(p => p.id !== selectedCategory?.id)
                                    .map(parent => (
                                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                                    ))
                                }
                            </select>
                            <InputError className="mt-2" message={errors.parent_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_description" value="Description" />
                            <textarea
                                id="edit_description"
                                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-[#C9A24B] focus:ring-[#C9A24B] bg-slate-50 focus:bg-white min-h-[100px]"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] h-11 px-6">Save changes</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

