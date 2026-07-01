<?php
// app/Services/Tenant/TenantInvoiceService.php

namespace App\Services\Tenant;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TenantInvoiceService
{
    public function __construct(private readonly User $tenant)
    {
    }

    /**
     * All invoices for THIS tenant only — scoped by tenant_id,
     * never by company alone. The tenant can never reach another
     * tenant's invoices through this service.
     */
    public function paginate(?string $month = null, int $perPage = 15): LengthAwarePaginator
    {
        return Invoice::query()
            ->where('tenant_id', $this->tenant->id)
            ->with(['items', 'unit.apartment.location'])
            ->when($month && $month !== 'all', fn ($q) => $q->whereMonth('issue_date', date('m', strtotime("1 $month"))))
            ->orderByDesc('issue_date')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findForTenant(int $invoiceId): Invoice
    {
        // findOrFail scoped to this tenant — a 404 is returned to
        // any request for an invoice that doesn't belong to them,
        // not a 403, so the existence of other invoices isn't leaked.
        return Invoice::query()
            ->where('tenant_id', $this->tenant->id)
            ->with(['items', 'unit.apartment.location', 'payments'])
            ->findOrFail($invoiceId);
    }

    public function availableMonths(): array
    {
        return Invoice::query()
            ->where('tenant_id', $this->tenant->id)
            ->selectRaw('DISTINCT DATE_FORMAT(issue_date, "%M") as month, YEAR(issue_date) as year, issue_date')
            ->orderByDesc('issue_date')
            ->get()
            ->map(fn ($r) => $r->month)
            ->toArray();
    }
}