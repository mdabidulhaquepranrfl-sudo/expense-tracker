<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expense_type_id' => ['required', 'integer', 'exists:expense_types,id'],
            'title'           => ['required', 'string', 'max:200'],
            'amount'          => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'date'            => ['required', 'date'],
            'note'            => ['nullable', 'string', 'max:2000'],
        ];
    }
}
