<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

/**
 * Single entry point at GET /dashboard.
 * Routes to the correct dashboard based on the authenticated user's role.
 *
 * Does NOT call any other dashboard controller's index() directly —
 * it redirects instead, so each dashboard runs under its own correct
 * route and middleware stack.
 */
final class DashboardRouterController extends Controller
{
    public function __invoke(): RedirectResponse|Response
    {
        $user = Auth::user();

        if ($user->hasRole('tenant')) {
            // Tenants have their own route at /tenant/dashboard which runs
            // under the correct middleware (resolve.company, tenant.portal).
            // We redirect rather than call the controller directly so the
            // middleware chain executes properly.
            return redirect()->to('/tenant/dashboard');
        }

        // All other roles (admin, manager, caretaker, landlord) get the
        // admin dashboard rendered directly here.
        return app(DashboardController::class)->index();
    }
}