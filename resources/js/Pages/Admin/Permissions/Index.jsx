import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Shield, Check, X, Lock, Info, Fingerprint } from 'lucide-react';
import { useState } from 'react';

export default function Index({ roles, permissionsByModule, matrix }) {
    const { auth } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const handleToggle = (roleId, permissionId, currentValue) => {
        setProcessing(true);
        router.post(route('permissions.update', { slug: auth.user.slug }), {
            role_id: roleId,
            permission_id: permissionId,
            value: !currentValue
        }, {
            preserveScroll: true,
            onSuccess: () => setProcessing(false),
            onError: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout header="Role Permissions">
            <Head title="Role Permissions" />

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 px-2">
                <div className="max-w-xl">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-indigo-600" />
                        Access Control Matrix
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium leading-relaxed">Configure exactly what each staff role can see and do across the system.</p>
                </div>
                
                {auth.user?.role === 'Super Admin' && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm shadow-indigo-100/50 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest leading-none">Super Admin Bypass</p>
                            <p className="text-xs text-indigo-600 font-bold mt-1">Status: Active</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="sticky left-0 z-20 bg-slate-50/80 backdrop-blur-sm px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-[280px]">
                                    Permissions Catalog
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="px-4 py-6 text-xs font-bold text-slate-800 uppercase tracking-widest text-center min-w-[120px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 font-black shadow-sm">{role.display_name}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.entries(permissionsByModule).map(([module, permissions]) => (
                                <React.Fragment key={module}>
                                    <tr className="bg-slate-50/20">
                                        <td colSpan={roles.length + 1} className="sticky left-0 z-10 px-8 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-white/50 backdrop-blur-sm">
                                            Module: {module}
                                        </td>
                                    </tr>
                                    {permissions.map((permission) => (
                                        <tr key={permission.id} className="hover:bg-indigo-50/20 transition-colors group">
                                            <td className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm px-8 py-5 group-hover:bg-indigo-50/20 transition-colors">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{permission.display_name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-tighter opacity-60">{permission.name}</p>
                                                </div>
                                            </td>
                                            {roles.map(role => {
                                                const isActive = matrix[role.id]?.includes(permission.id);
                                                return (
                                                    <td key={role.id} className="px-4 py-5 text-center">
                                                        <button 
                                                            disabled={processing}
                                                            onClick={() => handleToggle(role.id, permission.id, isActive)}
                                                            className={`h-11 w-11 mx-auto rounded-2xl flex items-center justify-center transition-all ${
                                                                isActive 
                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-100/50 hover:scale-105 active:scale-95' 
                                                                : 'bg-slate-50 text-slate-300 border border-slate-200 hover:bg-slate-100 hover:text-slate-400 hover:scale-105 active:scale-95'
                                                            }`}
                                                            title={isActive ? 'Revoke Permission' : 'Grant Permission'}
                                                        >
                                                            {isActive ? <Check className="w-5 h-5 stroke-[3.5px]" /> : <X className="w-5 h-5 stroke-[2.5px]" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 px-1">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-start gap-5 shadow-xl shadow-slate-200/20">
                    <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/30">
                        <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Identity-First Security</h3>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed font-medium">
                            Every permission toggle is instantly synced across all sessions. Changes take effect on the next page interaction.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 flex items-start gap-5 shadow-sm">
                    <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 ring-1 ring-slate-100">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">Managing Access</h3>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
                            Toggle the checkmark to grant access. A grey 'X' indicates the role is currently restricted from that module action.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React from 'react'; // For React.Fragment
