import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useCallback } from 'react';
import { useApp } from '@/Context/AppContext';
import api from '@/lib/api';

function CategoryBadge({ type }) {
    if (!type) return null;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: type.color + '25', color: type.color, border: `1px solid ${type.color}40` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }}></span>
            {type.name}
        </span>
    );
}

function Filters({ filters, expenseTypes, onApply }) {
    const [form, setForm] = useState({
        search:    filters?.search    ?? '',
        category:  filters?.category  ?? '',
        month:     filters?.month     ?? '',
        date_from: filters?.date_from ?? '',
        date_to:   filters?.date_to   ?? '',
    });

    const handleApply = () => {
        const cleaned = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
        onApply(cleaned);
    };

    const handleReset = () => {
        setForm({ search: '', category: '', month: '', date_from: '', date_to: '' });
        onApply({});
    };

    return (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-slate-400 mb-1">Search</label>
                <input
                    type="text"
                    placeholder="Search title..."
                    value={form.search}
                    onChange={e => setForm(f => ({ ...f, search: e.target.value }))}
                    className="w-full bg-slate-900/80 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
            </div>
            <div className="min-w-[150px]">
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-slate-900/80 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                    <option value="">All Categories</option>
                    {expenseTypes?.data?.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-[140px]">
                <label className="block text-xs text-slate-400 mb-1">Month</label>
                <input
                    type="month"
                    value={form.month}
                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full bg-slate-900/80 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
            </div>
            <div className="min-w-[130px]">
                <label className="block text-xs text-slate-400 mb-1">From</label>
                <input
                    type="date"
                    value={form.date_from}
                    onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))}
                    className="w-full bg-slate-900/80 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
            </div>
            <div className="min-w-[130px]">
                <label className="block text-xs text-slate-400 mb-1">To</label>
                <input
                    type="date"
                    value={form.date_to}
                    onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))}
                    className="w-full bg-slate-900/80 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
            </div>
            <div className="flex gap-2">
                <button onClick={handleApply}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                    Filter
                </button>
                <button onClick={handleReset}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                    Reset
                </button>
            </div>
        </div>
    );
}

export default function ExpenseIndex({ expenses, expense_types, filters }) {
    const { showSuccess, showError } = useApp();
    const [deletingId, setDeletingId] = useState(null);

    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

    const handleFilter = useCallback((params) => {
        router.get('/expenses', params, { preserveState: true, replace: true });
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this expense?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/expenses/${id}`);
            showSuccess('Expense deleted.');
            router.reload({ only: ['expenses'] });
        } catch (e) {
            showError(e.userMessage ?? 'Failed to delete.');
        } finally {
            setDeletingId(null);
        }
    };

    const items = expenses?.data ?? [];
    const meta  = expenses?.meta ?? {};
    const links = expenses?.links ?? {};

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-bold text-white">💸 Expenses</h1>}>
            <Head title="Expenses" />

            <div className="space-y-5">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                        {meta.total ?? 0} expense{meta.total !== 1 ? 's' : ''} found
                    </p>
                    <Link href="/expenses/create"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                        ➕ Add Expense
                    </Link>
                </div>

                {/* Filters */}
                <Filters filters={filters} expenseTypes={expense_types} onApply={handleFilter} />

                {/* Table */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Note</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/40">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                                            <div className="text-4xl mb-3">🔍</div>
                                            <p>No expenses found. Try adjusting your filters.</p>
                                        </td>
                                    </tr>
                                ) : items.map((expense) => (
                                    <tr key={expense.id}
                                        className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-white max-w-[200px] truncate">
                                            {expense.title}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <CategoryBadge type={expense.expense_type} />
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-right text-emerald-400">
                                            {fmt(expense.amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[200px] truncate">
                                            {expense.note || '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/expenses/${expense.id}/edit`}
                                                    className="px-3 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    disabled={deletingId === expense.id}
                                                    className="px-3 py-1.5 bg-red-600/60 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                                                    {deletingId === expense.id ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/50">
                            <p className="text-xs text-slate-400">
                                Showing {meta.from}–{meta.to} of {meta.total}
                            </p>
                            <div className="flex gap-2">
                                {links.prev && (
                                    <Link href={links.prev}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors">
                                        ← Prev
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 bg-indigo-600/30 text-indigo-300 text-xs rounded-lg">
                                    {meta.current_page} / {meta.last_page}
                                </span>
                                {links.next && (
                                    <Link href={links.next}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors">
                                        Next →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
