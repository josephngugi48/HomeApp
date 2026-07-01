<?php
// app/Services/Tenant/TenantMaintenanceService.php

namespace App\Services\Tenant;

use App\Models\DocumentCounter;
use App\Models\MaintenanceRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TenantMaintenanceService
{
    public function __construct(private readonly User $tenant)
    {
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return MaintenanceRequest::query()
            ->where('tenant_id', $this->tenant->id)
            ->with('photos')
            ->orderByDesc('raised_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, int $companyId, array $photos = []): MaintenanceRequest
    {
        return DB::transaction(function () use ($data, $companyId, $photos) {
            $activeLease = app('tenantLease');

            $number = sprintf(
                'MNT-%d-%04d',
                now()->year,
                DocumentCounter::nextNumber($companyId, 'maintenance')
            );

            $request = MaintenanceRequest::create([
                'company_id' => $companyId,
                'number' => $number,
                'tenant_id' => $this->tenant->id,
                'lease_id' => $activeLease?->id,
                'unit_id' => $activeLease?->unit_id,
                'category' => $data['category'],
                'priority' => $data['priority'] ?? 'medium',
                'raised_at' => now(),
                'status' => 'open',
            ]);

            foreach ($photos as $photo) {
                $path = $photo->store("maintenance/{$request->id}", 'public');
                $request->photos()->create(['path' => $path, 'kind' => 'before']);
            }

            return $request;
        });
    }

    public function findForTenant(int $requestId): MaintenanceRequest
    {
        return MaintenanceRequest::query()
            ->where('tenant_id', $this->tenant->id)
            ->with('photos')
            ->findOrFail($requestId);
    }
}