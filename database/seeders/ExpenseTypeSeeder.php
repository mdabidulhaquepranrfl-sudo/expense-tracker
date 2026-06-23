<?php

namespace Database\Seeders;

use App\Models\ExpenseType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExpenseTypeSeeder extends Seeder
{
    private array $defaultTypes = [
        ['name' => 'Food & Dining',    'color' => '#f59e0b', 'icon' => 'utensils'],
        ['name' => 'Transport',        'color' => '#3b82f6', 'icon' => 'car'],
        ['name' => 'Shopping',         'color' => '#ec4899', 'icon' => 'shopping-bag'],
        ['name' => 'Entertainment',    'color' => '#8b5cf6', 'icon' => 'film'],
        ['name' => 'Health',           'color' => '#10b981', 'icon' => 'heart'],
        ['name' => 'Education',        'color' => '#06b6d4', 'icon' => 'book'],
        ['name' => 'Utilities',        'color' => '#f97316', 'icon' => 'zap'],
        ['name' => 'Housing',          'color' => '#64748b', 'icon' => 'home'],
        ['name' => 'Travel',           'color' => '#84cc16', 'icon' => 'plane'],
        ['name' => 'Other',            'color' => '#6b7280', 'icon' => 'more-horizontal'],
    ];

    public function run(): void
    {
        // Create demo user if none exist
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name'     => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );

        foreach ($this->defaultTypes as $type) {
            ExpenseType::firstOrCreate(
                ['user_id' => $user->id, 'name' => $type['name']],
                ['color' => $type['color'], 'icon' => $type['icon']]
            );
        }
    }
}
