import { Link, usePage, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

function StatCard({ label, value, icon, color, subtext }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 border ${color} backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
                </div>
                <div className="text-3xl opacity-80">{icon}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white"></div>
        </div>
    );
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
        tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
        },
    },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    },
};

import { useApp } from '@/Context/AppContext';

export default function Dashboard({ stats, category_breakdown, monthly_chart, weekly_chart, current_month }) {
    const { currency } = useApp();
    const fmt = (n) => `${currency} ${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const monthlyBarData = {
        labels: monthly_chart?.labels ?? [],
        datasets: [{
            label: 'Daily Expenses',
            data: monthly_chart?.data ?? [],
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 6,
        }],
    };

    const weeklyLineData = {
        labels: weekly_chart?.labels ?? [],
        datasets: [{
            label: 'Weekly Expenses',
            data: weekly_chart?.data ?? [],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 5,
            fill: true,
            tension: 0.4,
        }],
    };

    const doughnutData = {
        labels: category_breakdown?.map(c => c.name) ?? [],
        datasets: [{
            data: category_breakdown?.map(c => parseFloat(c.total)) ?? [],
            backgroundColor: category_breakdown?.map(c => c.color) ?? [],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: '#334155',
                borderWidth: 1,
            },
        },
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <input 
                    type="month" 
                    value={current_month}
                    onChange={(e) => router.get('/', { month: e.target.value }, { preserveState: true })}
                    className="bg-indigo-500/10 text-indigo-300 text-xs rounded-lg border border-indigo-500/30 px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                />
            </div>
        }>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Monthly Expenses"
                        value={fmt(stats?.monthly_total)}
                        icon="💸"
                        color="bg-slate-800/60 border-slate-700/50"
                        subtext="This month"
                    />
                    <StatCard
                        label="Weekly Expenses"
                        value={fmt(stats?.weekly_total)}
                        icon="📅"
                        color="bg-violet-900/30 border-violet-500/30"
                        subtext="This week"
                    />
                    <StatCard
                        label="Monthly Salary"
                        value={fmt(stats?.salary)}
                        icon="💰"
                        color="bg-emerald-900/30 border-emerald-500/30"
                        subtext="Current month"
                    />
                    <StatCard
                        label="Remaining Balance"
                        value={fmt(stats?.remaining_balance)}
                        icon={stats?.remaining_balance >= 0 ? '✅' : '⚠️'}
                        color={stats?.remaining_balance >= 0
                            ? 'bg-indigo-900/30 border-indigo-500/30'
                            : 'bg-red-900/30 border-red-500/30'
                        }
                        subtext="Salary - Expenses"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Bar Chart */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4">📊 Monthly Daily Breakdown</h2>
                        <div className="h-52">
                            <Bar data={monthlyBarData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Weekly Line Chart */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4">📈 This Week</h2>
                        <div className="h-52">
                            <Line data={weeklyLineData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Doughnut */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4">🏷️ Spending by Category</h2>
                        <div className="h-52">
                            {category_breakdown?.length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    No expenses this month
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category list */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4">📋 Category Summary</h2>
                        <div className="space-y-3 overflow-y-auto max-h-52 pr-1">
                            {category_breakdown?.length > 0 ? category_breakdown.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className="text-sm text-slate-300 flex-1 truncate">{cat.name}</span>
                                    <span className="text-sm font-semibold text-white">
                                        {fmt(cat.total)}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm">No data for this month.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 flex-wrap">
                    <Link href="/expenses/create"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                        ➕ Add Expense
                    </Link>
                    <Link href="/expenses"
                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors">
                        📋 View All Expenses
                    </Link>
                    <Link href="/salary"
                        className="px-5 py-2.5 bg-emerald-700/60 hover:bg-emerald-600/60 text-white text-sm font-medium rounded-xl transition-colors">
                        💰 Manage Salary
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
