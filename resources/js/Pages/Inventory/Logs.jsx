import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { History, ArrowUpRight, ArrowDownRight, RefreshCcw, User, Truck, Package, Search, Download } from 'lucide-react';
import TextInput from '@/Components/TextInput';

export default function Logs({ movements, filters }) {
    const { auth } = usePage().props;
    const getTypeBadge = (type) => {
        switch (type) {
            case 'IN':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <ArrowUpRight className="w-3 h-3" />
                        STOCK IN
                    </span>
                );
            case 'OUT':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                        <ArrowDownRight className="w-3 h-3" />
                        STOCK OUT
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        <RefreshCcw className="w-3 h-3" />
                        ADJUSTMENT
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout header="Movement Logs">
            <Head title="Movement Logs" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Movement Logs</h1>
                    <p className="text-slate-500 text-sm mt-1">Audit trail of all stock additions, deductions, and adjustments.</p>
                </div>
                {auth.can['inventory.logs.export'] && auth.user?.slug && (
                    <a 
                        href={route('inventory.logs.export', { slug: auth.user.slug })} 
                        className="h-11 px-6 bg-slate-900 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-[#B8874A] transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </a>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Handled By</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movements.data.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">
                                                {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{log.product.name}</p>
                                                <p className="text-[10px] font-bold text-[#B8874A] uppercase tracking-wider">{log.product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getTypeBadge(log.type)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-base font-black ${log.type === 'IN' ? 'text-emerald-600' : log.type === 'OUT' ? 'text-red-500' : 'text-amber-600'}`}>
                                            {log.type === 'OUT' ? '-' : '+'}{log.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">{log.user?.name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.supplier ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                <Truck className="w-3.5 h-3.5" />
                                                <span>{log.supplier.name}</span>
                                            </div>
                                        ) : log.notes ? (
                                            <p className="text-xs text-slate-400 italic truncate max-w-[150px]">"{log.notes}"</p>
                                        ) : (
                                            <span className="text-xs text-slate-300">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {movements.data.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <History className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-400">No movements recorded yet</h3>
                                            <p className="text-sm text-slate-300">Add or remove stock to see history here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {movements.links && movements.links.length > 3 && (
                    <div className="p-6 border-t border-slate-100 flex justify-center gap-2">
                        {movements.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    link.active 
                                        ? 'bg-[#B8874A] text-white shadow-sm' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#B8874A]'
                                } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
