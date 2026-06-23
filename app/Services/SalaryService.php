<?php

namespace App\Services;

use App\Models\Salary;
use Carbon\Carbon;

class SalaryService
{
    /**
     * Get current month's salary for the user.
     */
    public function currentMonthSalary(int $userId, ?string $month = null): ?Salary
    {
        $month = $month ?? Carbon::now()->format('Y-m');

        return Salary::where('user_id', $userId)
            ->where('month', $month)
            ->first();
    }

    /**
     * Calculate remaining balance = salary - total expenses.
     */
    public function remainingBalance(int $userId, float $monthlyExpense, ?string $month = null): float
    {
        $salary = $this->currentMonthSalary($userId, $month);
        $salaryAmount = $salary ? (float) $salary->amount : 0.0;

        return $salaryAmount - $monthlyExpense;
    }

    /**
     * Upsert salary for a given month.
     */
    public function upsert(int $userId, float $amount, string $month, ?string $note = null): Salary
    {
        return Salary::updateOrCreate(
            ['user_id' => $userId, 'month' => $month],
            ['amount'  => $amount, 'note' => $note]
        );
    }
}
