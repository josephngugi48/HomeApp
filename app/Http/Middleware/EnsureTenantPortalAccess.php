<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Lease;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards all /tenant/* routes.
 *
 * Assumes ResolveCurrentCompany has already run and bound
 * app('currentCompany') — enforced by middleware order in bootstrap/app.php.
 *
 * Responsibilities:
 *  1. Hard-reject any non-tenant-role user (admin, caretaker, etc.)
 *  2. Resolve the tenant's active lease into app('tenantLease') for use
 *     by downstream controllers/services without re-querying.
 */
final class EnsureTenantPortalAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Guard 1: must be authenticated with the 'tenant' role.
        // hasRole() is team-scoped when Spatie teams mode is on,
        // but 'tenant' is a global role assignment so this works regardless.
        if (! $user || ! $user->hasRole('tenant')) {
            abort(403, 'This area is restricted to tenants only.');
        }

        // Guard 2: must belong to the resolved company.
        $company = app('currentCompany');

        if (! $company) {
            abort(403, 'No active company context resolved.');
        }

        $isMember = $user->companies()
            ->where('companies.id', $company->id)
            ->exists();

        if (! $isMember) {
            abort(403, 'You are not a member of this company.');
        }

        // Bind active lease — nullable (tenant may have moved out but still
        // has historical invoices/payments to view). Controllers must handle
        // app('tenantLease') === null gracefully.
        $activeLease = Lease::query()
            ->where('tenant_id', $user->id)
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->with(['unit:id,unit_no,apartment_id', 'unit.apartment:id,name,location_id', 'unit.apartment.location:id,name'])
            ->first();

        app()->instance('tenantLease', $activeLease);

        return $next($request);
    }
}