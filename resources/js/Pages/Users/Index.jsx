import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, User, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';

export default function Index({ users }) {
    const { auth, flash } = usePage().props;
    
    // Core accounts protection is now handled dynamically via Permissions page.
    const isProtected = (email) => false;
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState(null);

    // Form handlers
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'Staff',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        clearErrors();
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user) => {
        Swal.fire({
            title: 'Delete User?',
            text: `Are you sure you want to permanently delete ${user.name}? This action cannot be reversed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B8874A',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', { user: user.id, slug: auth.user.slug }));
            }
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('users.store', { slug: auth.user.slug }), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('users.update', { user: selectedUser.id, slug: auth.user.slug }), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedUser(null);
            },
        });
    };



    // Role styling helpers
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'Super Admin': return 'bg-red-100 text-red-700 border-red-200';
            case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="Users" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Staff & Users</h1>
                    <p className="text-slate-500 mt-1 text-sm font-normal">Manage platform access, roles, and staff details.</p>
                </div>
                {auth.can['users.create'] && (
                    <PrimaryButton 
                        onClick={openCreateModal} 
                        className="w-full md:w-auto h-11 px-6 bg-[#B8874A] border-transparent hover:bg-[#A3743B] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        New user
                    </PrimaryButton>
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-3xl border border-[#EAE6DF] shadow-sm overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                    <thead className="bg-[#FAF8F5]/80">
                        <tr>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#EAE6DF] italic">User Profile</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#EAE6DF] italic">Role</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#EAE6DF] italic">Status</th>
                            <th className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#EAE6DF] italic">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE9]">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-[#FAF8F5]/50 transition-colors group">
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-[#FBF7EE] border border-[#F0E6D2] flex items-center justify-center text-[#B8874A] font-bold text-lg group-hover:bg-[#B8874A] group-hover:text-white group-hover:border-[#B8874A] transition-all shadow-sm">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-base leading-none">{u.name}</p>
                                            <p className="text-slate-400 font-normal text-xs mt-1">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-lg border ${getRoleBadgeColor(u.role)}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wide">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Active
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {auth.can['users.edit'] && (
                                            <button 
                                                onClick={() => !isProtected(u.email) && openEditModal(u)}
                                                disabled={isProtected(u.email)}
                                                className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${isProtected(u.email) ? 'bg-slate-50 border-slate-100 text-slate-200' : 'border-[#EAE6DF] text-slate-400 hover:text-[#B8874A] hover:border-[#F0E6D2] hover:bg-[#FBF7EE]'}`}
                                                title={isProtected(u.email) ? "Master account cannot be edited." : "Edit User"}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {auth.can['users.delete'] && (
                                            <button 
                                                onClick={() => openDeleteModal(u)}
                                                disabled={isProtected(u.email)}
                                                className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${isProtected(u.email) ? 'bg-slate-50 border-slate-100 text-slate-200' : 'border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'}`}
                                                title={isProtected(u.email) ? "Master account cannot be deleted." : "Delete User"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {users.map((u) => (
                    <div key={u.id} className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-[#FBF7EE] border border-[#F0E6D2] flex items-center justify-center text-[#B8874A] font-bold text-lg">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base leading-tight">{u.name}</h4>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getRoleBadgeColor(u.role)}`}>
                                        {u.role}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {auth.can['users.edit'] && (
                                    <button 
                                        onClick={() => openEditModal(u)}
                                        disabled={isProtected(u.email)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${isProtected(u.email) ? 'bg-slate-50 text-slate-200' : 'bg-[#FBF7EE] text-[#B8874A] border border-[#F0E6D2]'}`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                                {auth.can['users.delete'] && (
                                    <button 
                                        onClick={() => openDeleteModal(u)}
                                        disabled={isProtected(u.email)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${isProtected(u.email) ? 'bg-slate-50 text-slate-200' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#F2EFE9] space-y-2">
                            <div className="flex items-center gap-2.5 text-slate-500 text-xs">
                                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#EAE6DF] group-hover:bg-[#FBF7EE] group-hover:border-[#F0E6D2] transition-all">
                                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#B8874A]" />
                                </div>
                                <span className="font-medium text-slate-700 truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600 gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-green-50 group-hover:border-green-100 transition-all">
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="font-bold text-green-600 tracking-wide uppercase text-xs">Active Status</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 italic">No users found in the system.</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Create New User</h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="role" value="Access Role" />
                        <select
                            id="role"
                            className="mt-1 block w-full border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B] rounded-xl shadow-sm text-sm"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            required
                        >
                            <option value="Staff">Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <InputError className="mt-2" message={errors.role} />
                    </div>
                    
                    <p className="mt-4 text-xs text-slate-500 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE6DF]">
                        The user's default password will be <strong className="text-slate-700">password123</strong>. They should change this upon their first login.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>Create user</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Edit User: {selectedUser?.name}</h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="edit_name" value="Full Name" />
                        <TextInput
                            id="edit_name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="edit_email" value="Email Address" />
                        <TextInput
                            id="edit_email"
                            type="email"
                            className={`mt-1 block w-full ${isProtected(selectedUser?.email) ? 'bg-slate-100 italic text-slate-500' : ''}`}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            disabled={isProtected(selectedUser?.email)}
                        />
                        {isProtected(selectedUser?.email) && (
                            <p className="mt-1 text-[10px] text-amber-600 font-medium tracking-tight uppercase">Master account email cannot be changed</p>
                        )}
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {selectedUser?.role !== 'Super Admin' && (
                        <div className="mt-4">
                            <InputLabel htmlFor="edit_role" value="Access Role" />
                            <select
                                id="edit_role"
                                className="mt-1 block w-full border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B] rounded-xl shadow-sm text-sm"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                required
                            >
                                <option value="Staff">Staff</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <InputError className="mt-2" message={errors.role} />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
                    </div>
                </form>
            </Modal>



        </AuthenticatedLayout>
    );
}
