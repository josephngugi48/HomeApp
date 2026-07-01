<?php
// app/Http/Resources/Tenant/TenantWalletResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantWalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'balance' => (float) $this->balance,
            'transactions' => TenantWalletTransactionResource::collection(
                $this->whenLoaded('transactions')
            ),
        ];
    }
}