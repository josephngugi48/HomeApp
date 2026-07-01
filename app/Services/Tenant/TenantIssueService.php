<?php
// app/Services/Tenant/TenantIssueService.php

namespace App\Services\Tenant;

use App\Models\Issue;
use App\Models\Lease;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TenantIssueService
{
    public function __construct(private readonly User $tenant)
    {
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Issue::query()
            ->where('tenant_id', $this->tenant->id)
            ->orderByDesc('raised_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, int $companyId): Issue
    {
        $activeLease = app('tenantLease');

        return Issue::create([
            'company_id' => $companyId,
            'tenant_id' => $this->tenant->id,
            'lease_id' => $activeLease?->id,
            'unit_id' => $activeLease?->unit_id,
            'title' => $data['title'],
            'body' => $data['body'],
            'category' => $data['category'],
            'status' => 'open',
            'raised_at' => now(),
        ]);
    }

    public function findForTenant(int $issueId): Issue
    {
        return Issue::query()
            ->where('tenant_id', $this->tenant->id)
            ->findOrFail($issueId);
    }
}