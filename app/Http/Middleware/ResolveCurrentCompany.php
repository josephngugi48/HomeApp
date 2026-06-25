<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\PermissionRegistrar;

/**
 * ResolveCurrentCompany
 *
 * Determines the active company for the authenticated user and stores it
 * in the service container so downstream middleware / code can rely on it.
 *
 * Outcomes:
 *  - Guest                       → pass through (no company context needed)
 *  - super-admin                 → pass through (operates across companies)
 *  - 1 company                   → auto-select and continue
 *  - multiple companies, none in session → redirect to company selector
 *  - company resolved but user not a member → 403
 */
class ResolveCurrentCompany
{
    public function handle(Request $request, Closure $next)
    {
        // Guests have no company context.
        if (! auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();

        // Super-admins bypass multi-tenancy entirely.
        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        $companyId = session('current_company_id');

        if (! $companyId) {
            $companyIds = $user->companies()->pluck('companies.id');

            if ($companyIds->count() === 1) {
                // Auto-select the single company.
                $companyId = $companyIds->first();
                session(['current_company_id' => $companyId]);

            } elseif ($companyIds->count() > 1) {
                // Let the user pick — avoid redirect loops on the selector route.
                if (! $request->routeIs('company.select')) {
                    return redirect()->route('company.select');
                }
                return $next($request);

            } else {
                abort(403, 'You are not associated with any company.');
            }
        }

        // Verify the resolved company actually belongs to the user.
        if (! $user->companies()->where('companies.id', $companyId)->exists()) {
            // Clear the stale session value and let them pick again.
            session()->forget('current_company_id');
            abort(403, 'You do not have access to this company.');
        }

        $company = Company::findOrFail($companyId);

        // Bind into the container as a named instance so other middleware
        // can check app()->has('currentCompany').
        app()->instance('currentCompany', $company);

        // Scope Spatie permissions to this company (team support).
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        // Share with all Inertia responses.
        Inertia::share('currentCompany', $company);

        return $next($request);
    }
}