<?php

namespace App\Http\Controllers;

use App\Services\ExpenseService;
use App\Services\SalaryService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private ExpenseService $expenseService,
        private SalaryService  $salaryService,
    ) {}

    public function index(Request $request): Response
    {
        $user  = $request->user();
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $monthlyTotal    = $this->expenseService->monthlyTotal($user->id, $month);
        $weeklyTotal     = $this->expenseService->weeklyTotal($user->id);
        $categoryData    = $this->expenseService->categoryBreakdown($user->id, $month);
        $monthlyChart    = $this->expenseService->monthlyChartData($user->id, $month);
        $weeklyChart     = $this->expenseService->weeklyChartData($user->id);
        $salary          = $this->salaryService->currentMonthSalary($user->id, $month);
        $remainingBalance = $this->salaryService->remainingBalance($user->id, $monthlyTotal, $month);

        return Inertia::render('Dashboard', [
            'stats' => [
                'monthly_total'     => $monthlyTotal,
                'weekly_total'      => $weeklyTotal,
                'salary'            => $salary ? (float) $salary->amount : 0,
                'remaining_balance' => $remainingBalance,
            ],
            'category_breakdown' => $categoryData,
            'monthly_chart'      => $monthlyChart,
            'weekly_chart'       => $weeklyChart,
            'current_month'      => $month,
        ]);
    }

    /**
     * JSON endpoint for AJAX dashboard refresh.
     */
    public function data(Request $request)
    {
        $user  = $request->user();
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $monthlyTotal     = $this->expenseService->monthlyTotal($user->id, $month);
        $weeklyTotal      = $this->expenseService->weeklyTotal($user->id);
        $categoryData     = $this->expenseService->categoryBreakdown($user->id, $month);
        $monthlyChart     = $this->expenseService->monthlyChartData($user->id, $month);
        $weeklyChart      = $this->expenseService->weeklyChartData($user->id);
        $salary           = $this->salaryService->currentMonthSalary($user->id, $month);
        $remainingBalance = $this->salaryService->remainingBalance($user->id, $monthlyTotal, $month);

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'monthly_total'     => $monthlyTotal,
                    'weekly_total'      => $weeklyTotal,
                    'salary'            => $salary ? (float) $salary->amount : 0,
                    'remaining_balance' => $remainingBalance,
                ],
                'category_breakdown' => $categoryData,
                'monthly_chart'      => $monthlyChart,
                'weekly_chart'       => $weeklyChart,
                'current_month'      => $month,
            ],
        ]);
    }
}
