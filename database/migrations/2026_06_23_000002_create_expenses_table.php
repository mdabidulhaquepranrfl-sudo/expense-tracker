<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expense_type_id')->constrained()->restrictOnDelete();
            $table->string('title', 200);
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->text('note')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'expense_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
