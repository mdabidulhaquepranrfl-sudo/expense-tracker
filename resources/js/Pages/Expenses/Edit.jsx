import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { useApp } from '@/Context/AppContext';
import api from '@/lib/api';

function FormField({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}

const inputClass = "w-full bg-slate-900/80 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors placeholder-slate-500";

export default function ExpenseEdit({ expense, expense_types }) {
    const { showSuccess, showError, currency } = useApp();
    const exp = expense?.data ?? expense;

    const [form, setForm] = useState({
        expense_type_id: exp?.expense_type_id ?? '',
        title:           exp?.title ?? '',
        amount:          exp?.amount ?? '',
        date:            exp?.date ?? new Date().toISOString().slice(0, 10),
        note:            exp?.note ?? '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            await api.put(`/expenses/${exp.id}`, form);
            showSuccess('Expense updated successfully!');
            router.visit('/expenses');
        } catch (e) {
            if (e.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
            } else {
                showError(e.userMessage ?? 'Failed to update expense.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const types = expense_types?.data ?? [];

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-bold text-white">✏️ Edit Expense</h1>}>
            <Head title="Edit Expense" />

            <div className="max-w-2xl">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormField label="Category *" error={errors.expense_type_id?.[0]}>
                            <select
                                value={form.expense_type_id}
                                onChange={e => set('expense_type_id', e.target.value)}
                                className={inputClass}
                                required
                            >
                                <option value="">Select a category</option>
                                {types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Title *" error={errors.title?.[0]}>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                className={inputClass}
                                required
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Amount *" error={errors.amount?.[0]}>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.amount}
                                        onChange={e => set('amount', e.target.value)}
                                        className={inputClass + ' pl-8'}
                                        required
                                    />
                                </div>
                            </FormField>
                            <FormField label="Date *" error={errors.date?.[0]}>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => set('date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                            </FormField>
                        </div>

                        <FormField label="Note / Description" error={errors.note?.[0]}>
                            <textarea
                                rows={3}
                                value={form.note ?? ''}
                                onChange={e => set('note', e.target.value)}
                                className={inputClass + ' resize-none'}
                            />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                {submitting ? 'Saving...' : 'Update Expense'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit('/expenses')}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Expense meta info */}
                <div className="mt-4 px-2 text-xs text-slate-500">
                    Created: {exp?.created_at ? new Date(exp.created_at).toLocaleString() : '—'}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
