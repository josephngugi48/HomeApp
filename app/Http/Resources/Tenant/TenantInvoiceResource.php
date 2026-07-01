<?php
// app/Http/Resources/Tenant/TenantInvoiceResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantInvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'billing_month' => $this->issue_date?->format('F'),
            'billing_year' => $this->issue_date?->format('Y'),
            'issue_date' => $this->issue_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'subtotal' => (float) $this->subtotal,
            'total' => (float) $this->total,
            'balance' => (float) $this->balance,
            'status' => $this->status,
            'items' => TenantInvoiceItemResource::collection($this->whenLoaded('items')),
            'payments' => TenantPaymentResource::collection($this->whenLoaded('payments')),
            'unit' => $this->whenLoaded('unit', fn () => [
                'unit_no' => $this->unit->unit_no,
                'apartment_name' => $this->unit->apartment?->name,
                'location_name' => $this->unit->apartment?->location?->name,
            ]),
        ];
    }
}
