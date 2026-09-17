import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutDashboard,
    Users,
    Box,
    List,
    Truck,
    Component,
    History,
    Lock,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
    const { url } = usePage();
    const user = usePage().props.auth.user;
    const can = usePage().props.auth.can;

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'dashboard.index', active: route().current('dashboard.index'), show: true },
        { name: 'Products', icon: Box, route: 'products.index', active: route().current('products.*'), show: can?.['products.view'] },
        { name: 'Categories', icon: List, route: 'categories.index', active: route().current('categories.*'), show: can?.['categories.view'] },
        { name: 'Scan Center', icon: Component, route: 'scanner.index', active: route().current('scanner.*'), show: can?.['products.view'] },
        { name: 'Movement Logs', icon: History, route: 'inventory.logs', active: route().current('inventory.logs'), show: can?.['inventory.view'] },
        { name: 'Suppliers', icon: Truck, route: 'suppliers.index', active: route().current('suppliers.*'), show: can?.['suppliers.view'] },
        { name: 'Users', icon: Users, route: 'users.index', active: route().current('users.*'), show: can?.['users.view'] },
        { name: 'Permissions', icon: Lock, route: 'permissions.index', active: route().current('permissions.*'), show: can?.['users.permissions'] },
    ].filter(item => item.show);

    if (!user) return null;

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 text-white min-h-screen flex flex-col shrink-0 shadow-xl transition-all duration-300 md:static md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${
                    isCollapsed ? 'md:w-20' : 'md:w-64'
                } w-64`}
            >
                {/* Header with Logo & Collapse Toggle */}
                <div
                    className={`h-16 flex items-center ${
                        isCollapsed ? 'md:justify-center px-3' : 'justify-between px-5'
                    } border-b border-slate-800 shrink-0 bg-slate-950/40 transition-all duration-300`}
                >
                    <Link
                        href={route('dashboard.index', { slug: user?.slug })}
                        className={`flex items-center gap-3 group/logo ${isCollapsed ? 'md:hidden' : ''}`}
                    >
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center p-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-2 ring-slate-900 transition-transform group-hover/logo:scale-105 duration-300 overflow-hidden shrink-0">
                            <ApplicationLogo className="block h-8 w-auto" />
                        </div>
                        <div className="font-black text-lg tracking-[0.2em] text-white flex flex-col leading-none">
                            <span>ELEVATE</span>
                        </div>
                    </Link>

                    {/* Collapsed Logo (Desktop Only) */}
                    {isCollapsed && (
                        <Link
                            href={route('dashboard.index', { slug: user?.slug })}
                            className="hidden md:flex items-center justify-center group/logo"
                            title="Elevate Interiors"
                        >
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center p-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-2 ring-slate-900 transition-transform group-hover/logo:scale-105 duration-300 overflow-hidden shrink-0">
                                <ApplicationLogo className="block h-8 w-auto" />
                            </div>
                        </Link>
                    )}

                    {/* Desktop Collapse Icon Button */}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden md:inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-indigo-400" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
                    {!isCollapsed && (
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                            Menu
                        </div>
                    )}
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={route(item.route, { slug: user?.slug })}
                            onClick={() => onClose && onClose()}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center ${
                                isCollapsed ? 'md:justify-center md:px-2' : 'px-3'
                            } py-2.5 rounded-lg text-sm font-medium transition-all group ${
                                item.active
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                            }`}
                        >
                            <item.icon
                                className={`h-5 w-5 ${
                                    isCollapsed ? 'md:mr-0' : 'mr-3'
                                } shrink-0 transition-colors ${
                                    item.active
                                        ? 'text-indigo-200'
                                        : 'text-slate-500 group-hover:text-indigo-400'
                                }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                    ))}
                </div>

                {/* User Profile Footer */}
                <div className="p-3 border-t border-slate-800 bg-slate-900">
                    <div
                        className={`flex items-center ${
                            isCollapsed ? 'md:justify-center p-1.5' : 'p-2.5'
                        } rounded-lg bg-slate-800/60 ring-1 ring-slate-700/50 min-w-0 transition-all`}
                        title={isCollapsed ? `${user?.name} (${user?.role})` : undefined}
                    >
                        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm ring-2 ring-slate-900">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 truncate flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-indigo-300 truncate font-medium">{user?.role || 'Guest'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
