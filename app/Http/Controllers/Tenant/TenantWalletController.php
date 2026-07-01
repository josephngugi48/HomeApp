
<?php
// app/Http/Controllers/Tenant/TenantWalletController.php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\TenantWalletResource;
use App\Services\Tenant\TenantWalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantWalletController extends Controller
{
    // 
    public function index(): Response
    {
        $companyId = app('currentCompany')->id;
        $service   = new TenantWalletService(auth()->user());

        return Inertia::render('tenant/wallet/index', [
            'wallet' => new TenantWalletResource(
                $service->getWithTransactions($companyId)
            ),
        ]);
    }

}