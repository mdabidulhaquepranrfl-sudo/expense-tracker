<?php

namespace App\Services;

use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    /**
     * Get total expenses for the current month.
     */
    public function monthlyTotal(int $userId, ?string $month = null): float
    {
        $month = $month ?? Carbon::now()->format('Y-m');
        [$year, $mon] = explode('-', $month);

        return (float) Expense::where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $mon)
            ->sum('amount');
    }

    /**
     * Get total expenses for the current week (Mon–Sun).
     */
    public function weeklyTotal(int $userId): float
    {
        $start = Carbon::now()->startOfWeek();
        $end   = Carbon::now()->endOfWeek();

        return (float) Expense::where('user_id', $userId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');
    }

    /**
     * Get expense breakdown grouped by category for the current month.
     */
    public function categoryBreakdown(int $userId, ?string $month = null): array
    {
        $month = $month ?? Carbon::now()->format('Y-m');
        [$year, $mon] = explode('-', $month);

        return Expense::where('expenses.user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $mon)
            ->join('expense_types', 'expenses.expense_type_id', '=', 'expense_types.id')
            ->select(
                'expense_types.id',
                'expense_types.name',
                'expense_types.color',
                'expense_types.icon',
                DB::raw('SUM(expenses.amount) as total')
            )
            ->groupBy('expense_types.id', 'expense_types.name', 'expense_types.color', 'expense_types.icon')
            ->orderByDesc('total')
            ->get()
            ->toArray();
    }

    /**
     * Get daily totals for the current month (for monthly chart).
     */
    public function monthlyChartData(int $userId, ?string $month = null): array
    {
        $month = $month ?? Carbon::now()->format('Y-m');
        [$year, $mon] = explode('-', $month);

        $rows = Expense::where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $mon)
            ->select(DB::raw('DATE(date) as day'), DB::raw('SUM(amount) as total'))
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('total', 'day');

        // Build full month array
        $daysInMonth = Carbon::createFromDate($year, $mon, 1)->daysInMonth;
        $labels = [];
        $data   = [];

        for ($d = 1; $d <= $daysInMonth; $d++) {
            $key      = sprintf('%s-%s-%02d', $year, $mon, $d);
            $labels[] = $d;
            $data[]   = (float) ($rows[$key] ?? 0);
        }

        return compact('labels', 'data');
    }

    /**
     * Get daily totals for the current week (for weekly chart).
     */
    public function weeklyChartData(int $userId): array
    {
        $start = Carbon::now()->startOfWeek();

        $rows = Expense::where('user_id', $userId)
            ->whereBetween('date', [
                $start->toDateString(),
                $start->copy()->endOfWeek()->toDateString(),
            ])
            ->select(DB::raw('DATE(date) as day'), DB::raw('SUM(amount) as total'))
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('total', 'day');

        $labels = [];
        $data   = [];

        for ($i = 0; $i < 7; $i++) {
            $date     = $start->copy()->addDays($i);
            $labels[] = $date->format('D');
            $data[]   = (float) ($rows[$date->toDateString()] ?? 0);
        }

        return compact('labels', 'data');
    }
}
