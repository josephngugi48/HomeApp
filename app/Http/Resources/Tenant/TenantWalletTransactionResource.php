<?php
// app/Http/Resources/Tenant/TenantWalletTransactionResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantWalletTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'ref' => $this->ref,
            'occurred_at' => $this->occurred_at?->toDateString(),
            'meta' => $this->meta,
        ];
    }
}