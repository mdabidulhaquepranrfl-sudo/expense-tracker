<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\ExpenseTypeResource;
use App\Models\Expense;
use App\Models\ExpenseType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $user  = $request->user();
        $query = Expense::where('expenses.user_id', $user->id)
            ->with('expenseType');

        // Filters
        if ($request->filled('category')) {
            $query->where('expense_type_id', $request->input('category'));
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        if ($request->filled('month')) {
            [$year, $mon] = explode('-', $request->input('month'));
            $query->whereYear('date', $year)->whereMonth('date', $mon);
        } elseif ($request->filled('week')) {
            $start = Carbon::parse($request->input('week'))->startOfWeek();
            $end   = $start->copy()->endOfWeek();
            $query->whereBetween('date', [$start->toDateString(), $end->toDateString()]);
        } elseif ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('date', [
                $request->input('date_from'),
                $request->input('date_to'),
            ]);
        } else {
            // Default: current month
            $query->whereYear('date', now()->year)
                  ->whereMonth('date', now()->month);
        }

        $expenses = $query->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $types = ExpenseType::where('user_id', $user->id)->orderBy('name')->get();

        return Inertia::render('Expenses/Index', [
            'expenses'      => ExpenseResource::collection($expenses),
            'expense_types' => ExpenseTypeResource::collection($types),
            'filters'       => $request->only(['category', 'month', 'week', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        $types = ExpenseType::where('user_id', $request->user()->id)->orderBy('name')->get();

        return Inertia::render('Expenses/Create', [
            'expense_types' => ExpenseTypeResource::collection($types),
        ]);
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $expense = Expense::create([
            'user_id' => $request->user()->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Expense added successfully.',
            'data'    => new ExpenseResource($expense->load('expenseType')),
        ], 201);
    }

    public function edit(Request $request, Expense $expense): Response
    {
        $this->authorize('update', $expense);

        $types = ExpenseType::where('user_id', $request->user()->id)->orderBy('name')->get();

        return Inertia::render('Expenses/Edit', [
            'expense'       => new ExpenseResource($expense->load('expenseType')),
            'expense_types' => ExpenseTypeResource::collection($types),
        ]);
    }

    public function update(StoreExpenseRequest $request, Expense $expense): JsonResponse
    {
        $this->authorize('update', $expense);

        $expense->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully.',
            'data'    => new ExpenseResource($expense->fresh()->load('expenseType')),
        ]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $this->authorize('delete', $expense);

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully.',
        ]);
    }

    /**
     * JSON list for API clients.
     */
    public function list(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Expense::where('user_id', $user->id)->with('expenseType');

        if ($request->filled('category')) {
            $query->where('expense_type_id', $request->input('category'));
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }
        if ($request->filled('month')) {
            [$year, $mon] = explode('-', $request->input('month'));
            $query->whereYear('date', $year)->whereMonth('date', $mon);
        } elseif ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('date', [
                $request->input('date_from'),
                $request->input('date_to'),
            ]);
        }

        $expenses = $query->orderByDesc('date')->orderByDesc('id')->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'data'    => ExpenseResource::collection($expenses),
        ]);
    }
}
