<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSalaryRequest;
use App\Http\Resources\SalaryResource;
use App\Models\Salary;
use App\Services\ExpenseService;
use App\Services\SalaryService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryController extends Controller
{
    public function __construct(
        private SalaryService  $salaryService,
        private ExpenseService $expenseService,
    ) {}

    public function index(Request $request): Response
    {
        $user  = $request->user();
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $salary  = $this->salaryService->currentMonthSalary($user->id, $month);
        $monthly = $this->expenseService->monthlyTotal($user->id, $month);
        $balance = $this->salaryService->remainingBalance($user->id, $monthly, $month);

        // Last 6 months salary history
        $history = Salary::where('user_id', $user->id)
            ->orderByDesc('month')
            ->limit(12)
            ->get();

        return Inertia::render('Salary/Index', [
            'salary'           => $salary ? new SalaryResource($salary) : null,
            'monthly_expense'  => $monthly,
            'remaining_balance' => $balance,
            'salary_history'   => SalaryResource::collection($history),
            'current_month'    => $month,
        ]);
    }

    public function store(StoreSalaryRequest $request): JsonResponse
    {
        $data   = $request->validated();
        $salary = $this->salaryService->upsert(
            $request->user()->id,
            $data['amount'],
            $data['month'],
            $data['note'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Salary saved successfully.',
            'data'    => new SalaryResource($salary),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $month  = $request->input('month', Carbon::now()->format('Y-m'));
        $salary = $this->salaryService->currentMonthSalary($request->user()->id, $month);

        return response()->json([
            'success' => true,
            'data'    => $salary ? new SalaryResource($salary) : null,
        ]);
    }
}
