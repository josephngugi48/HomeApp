<?php
// app/Http/Resources/Tenant/TenantIssueResource.php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'category' => $this->category,
            'status' => $this->status,
            'raised_at' => $this->raised_at?->toDateString(),
        ];
    }
}
