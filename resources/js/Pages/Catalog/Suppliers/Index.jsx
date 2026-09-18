import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Truck, Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ suppliers }) {
    const { auth, flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (supplier) => {
        clearErrors();
        setSelectedSupplier(supplier);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('suppliers.store', { slug: auth.user.slug }), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('suppliers.update', { supplier: selectedSupplier.id, slug: auth.user.slug }), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedSupplier(null);
            },
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Supplier?',
            text: "This vendor and their details will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B8874A',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('suppliers.destroy', { supplier: id, slug: auth.user.slug }));
            }
        });
    };

    return (
        <AuthenticatedLayout header="Suppliers">
            <Head title="Suppliers" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Vendors & Suppliers</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your furniture and materials supply network.</p>
                </div>
                {auth.can['suppliers.create'] && (
                    <PrimaryButton 
                        onClick={openCreateModal} 
                        className="w-full md:w-auto h-11 px-6 bg-[#B8874A] border-transparent hover:bg-[#A3743B] focus:ring-2 focus:ring-[#C9A24B] flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add supplier
                    </PrimaryButton>
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-3xl border border-[#EAE6DF] shadow-sm overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Supplier Name</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact Details</th>
                            {(auth.can['suppliers.edit'] || auth.can['suppliers.delete']) && (
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#B8874A] group-hover:text-white transition-all">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{supplier.name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Verified Vendor</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="space-y-1">
                                        {supplier.contact_person && (
                                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {supplier.contact_person}
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {supplier.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {(auth.can['suppliers.edit'] || auth.can['suppliers.delete']) && (
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {auth.can['suppliers.edit'] && (
                                                <button 
                                                    onClick={() => openEditModal(supplier)}
                                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#B8874A] hover:border-[#D9C4A1] hover:bg-[#FBF7EE] transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {auth.can['suppliers.delete'] && (
                                                <button 
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white p-5 rounded-3xl border border-[#EAE6DF] shadow-sm transition-all active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 leading-tight">{supplier.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Verified Vendor</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {auth.can['suppliers.edit'] && (
                                    <button 
                                        onClick={() => openEditModal(supplier)}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#FBF7EE] text-[#B8874A] border border-[#EAE6DF]"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                )}
                                {auth.can['suppliers.delete'] && (
                                    <button 
                                        onClick={() => handleDelete(supplier.id)}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {(supplier.contact_person || supplier.email || supplier.phone) && (
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                {supplier.contact_person && (
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <span className="font-medium text-slate-700">{supplier.contact_person}</span>
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600 truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600">{supplier.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {suppliers.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-[#EAE6DF] shadow-sm text-slate-400 italic">
                    No suppliers registered in the system yet.
                </div>
            )}

            {/* Create/Edit Modals */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-8">
                    <h2 className="text-xl font-serif font-medium text-[#1E1B18] mb-6">New Vendor Register</h2>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <InputLabel htmlFor="name" value="Company / Brand Name" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Italian Marble Co."
                                required
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="contact_person" value="Contact Person" />
                                <TextInput
                                    id="contact_person"
                                    className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput
                                    id="phone"
                                    className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] h-11 px-8">Create supplier</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEdit} className="p-8">
                    <h2 className="text-xl font-serif font-medium text-[#1E1B18] mb-6">Update Vendor Details</h2>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Company Name" />
                            <TextInput
                                id="edit_name"
                                className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit_contact" value="Contact Person" />
                                <TextInput
                                    id="edit_contact"
                                    className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_phone" value="Phone" />
                                <TextInput
                                    id="edit_phone"
                                    className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_email" value="Email" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                className="mt-1 block w-full h-11 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] h-11 px-8 border-transparent">Save changes</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
