<?php
// app/Http/Resources/Tenant/TenantPaymentResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ref' => $this->ref,
            'amount' => (float) $this->amount,
            'method' => strtoupper($this->method),
            'external_ref' => $this->external_ref,
            'paid_at' => $this->paid_at?->toDateString(),
            'invoice_number' => $this->invoice?->number,
        ];
    }
}