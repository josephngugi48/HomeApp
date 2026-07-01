<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\TenantInvoiceResource;
use App\Http\Resources\Tenant\TenantPaymentResource;
use App\Services\Tenant\TenantInvoiceService;
use App\Services\Tenant\TenantPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class TenantPaymentController extends Controller
{
    public function index(): Response
    {
        $service = new TenantPaymentService(auth()->user());

        return Inertia::render('tenant/payments/index', [
            'payments' => TenantPaymentResource::collection(
                $service->paginate()
            ),
        ]);
    }

    /**
     * Dedicated export route — never Inertia, always a file download.
     * Keeps index() as a pure Inertia render with no branching.
     */
    public function export(): StreamedResponse
    {
        $service = new TenantPaymentService(auth()->user());
        return $service->exportCsv();
    }

    public function pay(int $id): Response
    {
        $invoiceService = new TenantInvoiceService(auth()->user());
        $invoice        = $invoiceService->findForTenant($id);

        return Inertia::render('tenant/payments/pay', [
            'invoice'      => new TenantInvoiceResource($invoice),
            'tenantPhone'  => auth()->user()->phone,
        ]);
    }
}