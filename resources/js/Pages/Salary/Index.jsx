import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { useApp } from '@/Context/AppContext';
import api from '@/lib/api';

function BalanceBar({ salary, expense }) {
    const pct = salary > 0 ? Math.min((expense / salary) * 100, 100) : 0;
    const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
        <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Spent: {pct.toFixed(1)}%</span>
                <span>Remaining: {(100 - pct).toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function SalaryIndex({ salary, monthly_expense, remaining_balance, salary_history, current_month }) {
    const { showSuccess, showError, currency } = useApp();
    const fmt = (n) => `${currency} ${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const today = new Date();
    const [form, setForm] = useState({
        amount: salary?.amount ?? '',
        month:  salary?.month  ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        note:   salary?.note   ?? '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [currentSalary, setCurrentSalary] = useState(salary);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const res = await api.post('/salary', form);
            showSuccess('Salary saved!');
            setCurrentSalary(res.data.data);
        } catch (e) {
            if (e.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
            } else {
                showError(e.userMessage ?? 'Failed to save salary.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const salaryAmount = parseFloat(currentSalary?.amount ?? 0);
    const balance = salaryAmount - parseFloat(monthly_expense ?? 0);

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-bold text-white">💰 Salary Management</h1>}>
            <Head title="Salary" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary Form */}
                <div className="space-y-5">
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                        <h2 className="text-base font-semibold text-white mb-5">
                            {currentSalary ? 'Update Salary' : 'Set Monthly Salary'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Month *</label>
                                <input
                                    type="month"
                                    value={form.month}
                                    onChange={e => set('month', e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.month && <p className="mt-1 text-xs text-red-400">{errors.month[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Salary Amount *</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.amount}
                                        onChange={e => set('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-900/80 border border-slate-600 text-white rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Note</label>
                                <textarea
                                    rows={2}
                                    value={form.note}
                                    onChange={e => set('note', e.target.value)}
                                    placeholder="Optional note..."
                                    className="w-full bg-slate-900/80 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {submitting ? 'Saving...' : '💰 Save Salary'}
                            </button>
                        </form>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur space-y-4">
                        <h2 className="text-base font-semibold text-white">📊 This Month Overview</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-400">Salary</span>
                                <span className="text-sm font-semibold text-emerald-400">{fmt(salaryAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-400">Total Expenses</span>
                                <span className="text-sm font-semibold text-red-400">{fmt(monthly_expense)}</span>
                            </div>
                            <div className="border-t border-slate-700 pt-3 flex justify-between">
                                <span className="text-sm font-semibold text-white">Balance</span>
                                <span className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {fmt(balance)}
                                </span>
                            </div>
                        </div>
                        <BalanceBar salary={salaryAmount} expense={parseFloat(monthly_expense ?? 0)} />
                        {balance < 0 && (
                            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-xs">
                                ⚠️ You've exceeded your salary by {fmt(Math.abs(balance))}!
                            </div>
                        )}
                    </div>
                </div>

                {/* Salary History */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                    <h2 className="text-base font-semibold text-white mb-4">📅 Salary History</h2>
                    {salary_history?.data?.length === 0 || !salary_history?.data ? (
                        <div className="text-center py-10 text-slate-500">
                            <div className="text-4xl mb-3">📋</div>
                            <p>No salary records yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                            {salary_history.data.map((s) => (
                                <div key={s.id}
                                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/40 hover:border-slate-600 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{s.month}</p>
                                        {s.note && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{s.note}</p>}
                                    </div>
                                    <span className="text-emerald-400 font-bold text-sm">{fmt(s.amount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
