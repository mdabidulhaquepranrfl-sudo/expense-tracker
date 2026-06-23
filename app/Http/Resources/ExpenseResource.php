<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'expense_type_id' => $this->expense_type_id,
            'expense_type'    => new ExpenseTypeResource($this->whenLoaded('expenseType')),
            'title'           => $this->title,
            'amount'          => (float) $this->amount,
            'date'            => $this->date?->toDateString(),
            'note'            => $this->note,
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
