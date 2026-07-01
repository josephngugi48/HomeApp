<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\DocumentCounter;
use App\Models\Invoice;
use App\Models\MpesaRequest;
use App\Models\Payment;
use App\Models\Wallet;
use App\Services\MpesaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

final class MpesaController extends Controller
{
    public function __construct(private readonly MpesaService $mpesa)
    {
    }

    /**
     * Initiate STK push for an invoice payment.
     *
     * Authorization: the authenticated user must be the invoice's tenant
     * OR an admin who can view the invoice. This replaces the old Spatie
     * 'module invoices' gate check which excluded tenants entirely.
     */
    public function stkPush(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = app('currentCompany')->id;

        $validated = $request->validate([
            'invoice_id' => [
                'required',
                Rule::exists('invoices', 'id')->where('company_id', $companyId),
            ],
            'phone' => 'required|string|max:15',
            'amount' => 'required|numeric|min:1',
        ]);

        $invoice = Invoice::query()
            ->where('company_id', $companyId)
            ->findOrFail($validated['invoice_id']);

        // Authorization: either the invoice's own tenant, or an admin
        // who can view invoices via the Spatie permission gate.
        $user = $request->user();
        $isInvoiceTenant = $user->id === $invoice->tenant_id;
        $isAdmin = $user->can('module invoices');

        if (! $isInvoiceTenant && ! $isAdmin) {
            abort(403, 'You can only pay your own invoices.');
        }

        try {
            $response = $this->mpesa->stkPush(
                $validated['phone'],
                (float) $validated['amount'],
                $invoice->number,
                "Payment for {$invoice->number}"
            );
        } catch (\RuntimeException $e) {
            Log::error('STK push failed', ['invoice_id' => $invoice->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Could not initiate M-Pesa payment. Please try again.');
        }

        if (! isset($response['CheckoutRequestID'])) {
            return back()->with('error', 'M-Pesa did not return a valid request ID. Please try again.');
        }

        MpesaRequest::create([
            'company_id'         => $companyId,
            'tenant_id'          => $invoice->tenant_id,
            'invoice_id'         => $invoice->id,   // NON-NULL → invoice payment path
            'checkout_request_id' => $response['CheckoutRequestID'],
            'merchant_request_id' => $response['MerchantRequestID'] ?? null,
            'phone'              => $validated['phone'],
            'amount'             => $validated['amount'],
            'status'             => 'pending',
        ]);

        return back()->with('success', 'Check your phone to complete the M-Pesa payment.');
    }

    /**
     * Initiate STK push for a wallet top-up.
     * Separated from stkPush() because the intent is different:
     * no invoice is being paid — funds go to the tenant's wallet.
     */
    public function walletTopUp(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = app('currentCompany')->id;
        $user      = $request->user();

        $validated = $request->validate([
            'phone'  => 'required|string|max:15',
            'amount' => 'required|numeric|min:1',
        ]);

        try {
            $response = $this->mpesa->stkPush(
                $validated['phone'],
                (float) $validated['amount'],
                'WALLET-TOPUP',
                'Wallet top-up'
            );
        } catch (\RuntimeException $e) {
            Log::error('Wallet top-up STK push failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Could not initiate M-Pesa top-up. Please try again.');
        }

        if (! isset($response['CheckoutRequestID'])) {
            return back()->with('error', 'M-Pesa did not return a valid request. Please try again.');
        }

        MpesaRequest::create([
            'company_id'          => $companyId,
            'tenant_id'           => $user->id,
            'invoice_id'          => null,          // NULL → wallet top-up path
            'checkout_request_id' => $response['CheckoutRequestID'],
            'merchant_request_id' => $response['MerchantRequestID'] ?? null,
            'phone'               => $validated['phone'],
            'amount'              => $validated['amount'],
            'status'              => 'pending',
        ]);

        return back()->with('success', 'Check your phone to complete the wallet top-up.');
    }

    /**
     * Public Safaricom webhook — no auth, no CSRF.
     * Bifurcates on invoice_id presence:
     *   invoice_id set   → apply payment to invoice (+ wallet credit if overpayment)
     *   invoice_id null  → deposit directly into tenant wallet
     */
    public function callback(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('M-Pesa callback received', ['payload' => $payload]);

        $stkCallback = $payload['Body']['stkCallback'] ?? null;

        if (! $stkCallback || ! isset($stkCallback['CheckoutRequestID'])) {
            Log::warning('M-Pesa callback missing expected structure', ['payload' => $payload]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $mpesaRequest = MpesaRequest::query()
            ->where('checkout_request_id', $stkCallback['CheckoutRequestID'])
            ->first();

        if (! $mpesaRequest || ! $mpesaRequest->isPending()) {
            // Unknown or already processed — idempotent acknowledgement.
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $resultCode = $stkCallback['ResultCode'] ?? null;

        DB::transaction(function () use ($mpesaRequest, $stkCallback, $resultCode): void {
            $mpesaRequest->result_payload = $stkCallback;

            if ($resultCode === 0) {
                $items    = $stkCallback['CallbackMetadata']['Item'] ?? [];
                $metadata = collect($items)->pluck('Value', 'Name');
                $mpesaRef = $metadata->get('MpesaReceiptNumber');

                $mpesaRequest->status = 'success';
                $mpesaRequest->save();

                if ($mpesaRequest->invoice_id !== null) {
                    $this->handleInvoicePayment($mpesaRequest, $mpesaRef);
                } else {
                    $this->handleWalletTopUp($mpesaRequest, $mpesaRef);
                }
            } else {
                $mpesaRequest->status = ($resultCode === 1032) ? 'cancelled' : 'failed';
                $mpesaRequest->save();
            }
        });

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    private function handleInvoicePayment(MpesaRequest $mpesaRequest, ?string $mpesaRef): void
    {
        $invoice = Invoice::query()
            ->lockForUpdate()
            ->findOrFail($mpesaRequest->invoice_id);

        $companyId = $invoice->company_id;

        $ref = sprintf(
            'ACC-PAY-%d-%05d',
            now()->year,
            DocumentCounter::nextNumber($companyId, 'payment')
        );

        Payment::create([
            'company_id'   => $companyId,
            'ref'          => $ref,
            'tenant_id'    => $mpesaRequest->tenant_id,
            'invoice_id'   => $invoice->id,
            'amount'       => $mpesaRequest->amount,
            'method'       => 'mpesa',
            'external_ref' => $mpesaRef,
            'paid_at'      => now(),
            'created_by'   => null, // system-originated
        ]);

        // applyPayment() handles overpayment → wallet credit automatically.
        $invoice->applyPayment((float) $mpesaRequest->amount);
    }

    private function handleWalletTopUp(MpesaRequest $mpesaRequest, ?string $mpesaRef): void
    {
        $wallet = Wallet::forTenant(
            $mpesaRequest->company_id,
            $mpesaRequest->tenant_id
        );

        $wallet->recordTransaction(
            type: 'deposit',
            amount: (float) $mpesaRequest->amount,
            ref: "MPESA-{$mpesaRef}",
            meta: [
                'mpesa_ref'         => $mpesaRef,
                'mpesa_request_id'  => $mpesaRequest->id,
                'phone'             => $mpesaRequest->phone,
            ]
        );
    }
}