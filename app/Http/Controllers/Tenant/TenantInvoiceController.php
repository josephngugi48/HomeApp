<?php
// app/Http/Controllers/Tenant/TenantInvoiceController.php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\TenantInvoiceResource;
use App\Services\Tenant\TenantInvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantInvoiceController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $service = new TenantInvoiceService(auth()->user());

        return Inertia::render('tenant/invoices/index', [
            'invoices' => TenantInvoiceResource::collection(
                $service->paginate($request->string('month')->toString())
            ),
            'availableMonths' => $service->availableMonths(),
            'filters' => ['month' => $request->string('month')->toString()],
        ]);
    }

    public function show(int $id): \Inertia\Response
    {
        $service = new TenantInvoiceService(auth()->user());
        $invoice = $service->findForTenant($id);

        return Inertia::render('tenant/invoices/show', [
            'invoice' => new TenantInvoiceResource($invoice),
        ]);
    }
}