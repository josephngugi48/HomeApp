<?php
// app/Http/Resources/Tenant/TenantMaintenanceResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantMaintenanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'category' => $this->category,
            'priority' => $this->priority,
            'status' => $this->status,
            'raised_at' => $this->raised_at?->toDateString(),
            'photos' => $this->whenLoaded('photos', fn () =>
                $this->photos->map(fn ($p) => [
                    'id' => $p->id,
                    'url' => asset('storage/'.$p->path),
                    'kind' => $p->kind,
                ])
            ),
        ];
    }
}