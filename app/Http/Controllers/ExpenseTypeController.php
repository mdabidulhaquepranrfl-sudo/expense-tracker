<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseTypeRequest;
use App\Http\Resources\ExpenseTypeResource;
use App\Models\ExpenseType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $types = ExpenseType::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('ExpenseTypes/Index', [
            'expense_types' => ExpenseTypeResource::collection($types),
        ]);
    }

    public function store(StoreExpenseTypeRequest $request): JsonResponse
    {
        $type = ExpenseType::create([
            'user_id' => $request->user()->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => new ExpenseTypeResource($type),
        ], 201);
    }

    public function update(StoreExpenseTypeRequest $request, ExpenseType $expenseType): JsonResponse
    {
        $this->authorize('update', $expenseType);

        $expenseType->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => new ExpenseTypeResource($expenseType->fresh()),
        ]);
    }

    public function destroy(Request $request, ExpenseType $expenseType): JsonResponse
    {
        $this->authorize('delete', $expenseType);

        // Check if category has expenses
        if ($expenseType->expenses()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with existing expenses.',
            ], 422);
        }

        $expenseType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
