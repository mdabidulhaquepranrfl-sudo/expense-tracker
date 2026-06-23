import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useApp } from '@/Context/AppContext';

const navItems = [
    { label: 'Dashboard',      href: '/',               icon: '📊' },
    { label: 'Expenses',       href: '/expenses',        icon: '💸' },
    { label: 'Add Expense',    href: '/expenses/create', icon: '➕' },
    { label: 'Categories',     href: '/expense-types',   icon: '🏷️' },
    { label: 'Salary',         href: '/salary',          icon: '💰' },
];

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { currency, setCurrency } = useApp();
    const currentPath = window.location.pathname;

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex-shrink-0 flex flex-col bg-slate-900/80 backdrop-blur border-r border-indigo-500/20 shadow-2xl`}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-4 py-5 border-b border-indigo-500/20">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                            <span className="text-lg">💎</span>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <p className="font-bold text-white text-sm leading-tight">ExpenseTracker</p>
                                <p className="text-indigo-400 text-xs">Smart Finance</p>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.href ||
                                (item.href !== '/' && currentPath.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                                    {sidebarOpen && (
                                        <span className="text-sm font-medium truncate">{item.label}</span>
                                    )}
                                    {isActive && sidebarOpen && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User */}
                    <div className="p-3 border-t border-indigo-500/20">
                        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${sidebarOpen ? '' : 'justify-center'}`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-xs text-indigo-400 hover:text-red-400 transition-colors"
                                    >
                                        Sign out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                {/* Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="self-center mx-auto mt-2 mb-2 w-8 h-8 bg-slate-700 hover:bg-indigo-600 rounded-lg flex items-center justify-center shadow text-sm transition-colors"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <header className="flex-shrink-0 px-6 py-4 border-b border-indigo-500/10 bg-slate-900/40 backdrop-blur flex items-center justify-between">
                        <div>
                            {header || <h1 className="text-lg font-semibold text-white">Dashboard</h1>}
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-slate-800 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="Tk">Tk</option>
                                <option value="$">USD ($)</option>
                                <option value="৳">BDT (৳)</option>
                                <option value="€">EUR (€)</option>
                                <option value="£">GBP (£)</option>
                                <option value="₹">INR (₹)</option>
                            </select>
                            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hidden sm:block">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
    );
}
