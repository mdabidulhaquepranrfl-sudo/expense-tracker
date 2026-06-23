<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExpenseTypeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalaryController;
use Illuminate\Support\Facades\Route;

// Public routes are handled by auth.php (login, register, etc.)

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.page');

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::get('/expenses/create', [ExpenseController::class, 'create'])->name('expenses.create');
    Route::get('/expenses/{expense}/edit', [ExpenseController::class, 'edit'])->name('expenses.edit');

    // Expense Types
    Route::get('/expense-types', [ExpenseTypeController::class, 'index'])->name('expense-types.index');

    // Salary
    Route::get('/salary', [SalaryController::class, 'index'])->name('salary.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // API JSON Endpoints (using session auth)
    Route::prefix('api')->group(function () {
        // Dashboard analytics (JSON)
        Route::get('/dashboard', [DashboardController::class, 'data']);

        // Expense Types API
        Route::apiResource('expense-types', ExpenseTypeController::class)
            ->only(['store', 'update', 'destroy']);

        // Expenses API
        Route::get('/expenses', [ExpenseController::class, 'list']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);

        // Salary API
        Route::get('/salary', [SalaryController::class, 'show']);
        Route::post('/salary', [SalaryController::class, 'store']);
    });
});

require __DIR__.'/auth.php';
