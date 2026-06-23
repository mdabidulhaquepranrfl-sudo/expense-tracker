import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { useApp } from '@/Context/AppContext';
import api from '@/lib/api';

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#84cc16', '#f97316',
    '#64748b', '#6b7280',
];

const PRESET_ICONS = [
    'utensils', 'car', 'shopping-bag', 'film', 'heart',
    'book', 'zap', 'home', 'plane', 'tag', 'coffee', 'gift',
    'music', 'camera', 'phone', 'more-horizontal',
];

function CategoryModal({ initial, onClose, onSaved }) {
    const { showSuccess, showError } = useApp();
    const [form, setForm] = useState({
        name:  initial?.name  ?? '',
        color: initial?.color ?? '#6366f1',
        icon:  initial?.icon  ?? 'tag',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            if (initial?.id) {
                const res = await api.put(`/expense-types/${initial.id}`, form);
                showSuccess('Category updated!');
                onSaved(res.data.data);
            } else {
                const res = await api.post('/expense-types', form);
                showSuccess('Category created!');
                onSaved(res.data.data);
            }
            onClose();
        } catch (e) {
            if (e.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
            } else {
                showError(e.userMessage ?? 'Failed to save.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">
                        {initial?.id ? 'Edit Category' : 'New Category'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="e.g. Food & Dining"
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name[0]}</p>}
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Color</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => set('color', c)}
                                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={form.color}
                                onChange={e => set('color', e.target.value)}
                                className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="text-xs text-slate-400">Custom color: {form.color}</span>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl">
                        <span className="text-sm text-slate-400">Preview:</span>
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                            style={{ backgroundColor: form.color + '25', color: form.color, border: `1px solid ${form.color}40` }}
                        >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: form.color }}></span>
                            {form.name || 'Category Name'}
                        </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {submitting ? 'Saving...' : (initial?.id ? 'Update' : 'Create')}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ExpenseTypesIndex({ expense_types }) {
    const { showSuccess, showError } = useApp();
    const [types, setTypes] = useState(expense_types?.data ?? []);
    const [modal, setModal] = useState(null); // null | {} | {id, ...}
    const [deletingId, setDeletingId] = useState(null);

    const handleSaved = (saved) => {
        setTypes(prev => {
            const idx = prev.findIndex(t => t.id === saved.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = saved;
                return updated;
            }
            return [...prev, saved];
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await api.delete(`/expense-types/${id}`);
            showSuccess('Category deleted.');
            setTypes(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            showError(e.response?.data?.message ?? e.userMessage ?? 'Failed to delete.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-bold text-white">🏷️ Expense Categories</h1>}>
            <Head title="Expense Categories" />

            {modal !== null && (
                <CategoryModal
                    initial={modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">{types.length} categories</p>
                    <button
                        onClick={() => setModal({})}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        ➕ New Category
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {types.length === 0 && (
                        <div className="col-span-full text-center py-16 text-slate-500">
                            <div className="text-5xl mb-4">🏷️</div>
                            <p>No categories yet. Create your first one!</p>
                        </div>
                    )}
                    {types.map((type) => (
                        <div
                            key={type.id}
                            className="group relative bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all hover:-translate-y-0.5 backdrop-blur"
                        >
                            {/* Color strip */}
                            <div
                                className="w-full h-1 rounded-full mb-4"
                                style={{ backgroundColor: type.color }}
                            />
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                                    style={{ backgroundColor: type.color + '30', border: `1px solid ${type.color}50` }}
                                >
                                    <span style={{ color: type.color }}>
                                        {type.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{type.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{type.color}</p>
                                </div>
                            </div>

                            {/* Badge preview */}
                            <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4"
                                style={{ backgroundColor: type.color + '20', color: type.color, border: `1px solid ${type.color}35` }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }}></span>
                                {type.name}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setModal(type)}
                                    className="flex-1 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(type.id)}
                                    disabled={deletingId === type.id}
                                    className="flex-1 py-1.5 bg-red-600/60 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {deletingId === type.id ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
