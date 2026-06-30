<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

class DashboardRouterController extends Controller
{
    public function index()
    {
        if (auth()->user()->hasRole('tenant')) {
            return app(TenantDashboardController::class)->index();
        }

        return app(DashboardController::class)->index();
    }
}