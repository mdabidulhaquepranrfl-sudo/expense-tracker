<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ExpenseType;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        if (!$user) {
            $this->command->error("No user found! Please create a user/register first.");
            return;
        }

        // More random Expense Types
        $types = [
            ['name' => 'Online Subscriptions', 'color' => '#f43f5e'],
            ['name' => 'Coffee & Snacks', 'color' => '#eab308'],
            ['name' => 'Utilities (Electric/Gas)', 'color' => '#0ea5e9'],
            ['name' => 'Healthcare', 'color' => '#10b981'],
            ['name' => 'Gifts & Donations', 'color' => '#d946ef'],
            ['name' => 'Car Maintenance', 'color' => '#8b5cf6'],
            ['name' => 'Home Maintenance', 'color' => '#f97316'],
            ['name' => 'Dining Out', 'color' => '#ec4899'],
            ['name' => 'Groceries', 'color' => '#84cc16'],
        ];

        foreach ($types as $type) {
            ExpenseType::firstOrCreate(
                ['name' => $type['name'], 'user_id' => $user->id],
                ['color' => $type['color']]
            );
        }

        $allTypes = ExpenseType::where('user_id', $user->id)->get();
        if ($allTypes->isEmpty()) {
            return;
        }

        // Insert Random Expenses for the last 6 months (about 180 days)
        $expenses = [];
        $now = Carbon::now();

        // Let's generate about 200 random expenses
        for ($i = 0; $i < 200; $i++) {
            $date = $now->copy()->subDays(rand(0, 180));
            $type = $allTypes->random();
            
            $expenses[] = [
                'user_id' => $user->id,
                'expense_type_id' => $type->id,
                'title' => 'Random: ' . $type->name . ' - ' . Str::random(4),
                'amount' => rand(50, 5000), // Random amount between 50 and 5000
                'date' => $date->format('Y-m-d'),
                'note' => 'Auto-generated dummy data',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Chunk insert to avoid sqlite limits
        foreach (array_chunk($expenses, 50) as $chunk) {
            Expense::insert($chunk);
        }

        $this->command->info("Inserted 200 dummy expenses across the last 6 months for User: {$user->name}!");
    }
}
