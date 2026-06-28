<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\DocumentCounter;
use App\Models\Invoice;
use App\Models\MpesaRequest;
use App\Models\Payment;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class MpesaController extends Controller
{
    public function __construct(private readonly MpesaService $mpesa)
    {
    }

    /**
     * Initiate an STK push for a given invoice. Called by an authenticated
     * tenant (or admin on their behalf) from the invoice/pay screen.
     */
    public function stkPush(Request $request)
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

        $invoice = Invoice::query()->where('company_id', $companyId)->findOrFail($validated['invoice_id']);

        Gate::authorize('view', $invoice); // tenant can only pay invoices they can view

        try {
            $response = $this->mpesa->stkPush(
                $validated['phone'],
                $validated['amount'],
                $invoice->number,
                "Payment for invoice {$invoice->number}"
            );
        } catch (\RuntimeException $e) {
            Log::error('STK push initiation failed', ['invoice_id' => $invoice->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Could not initiate M-Pesa payment. Please try again or use another method.');
        }

        if (! isset($response['CheckoutRequestID'])) {
            Log::error('STK push response missing CheckoutRequestID', ['response' => $response]);
            return back()->with('error', 'M-Pesa did not return a valid request. Please try again.');
        }

        MpesaRequest::create([
            'company_id' => $companyId,
            'tenant_id' => $invoice->tenant_id,
            'invoice_id' => $invoice->id,
            'checkout_request_id' => $response['CheckoutRequestID'],
            'merchant_request_id' => $response['MerchantRequestID'] ?? null,
            'phone' => $validated['phone'],
            'amount' => $validated['amount'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Check your phone to complete the M-Pesa payment.');
    }

    /**
     * Public webhook — Safaricom posts here once the customer completes
     * (or cancels/fails) the STK push prompt. NOT behind auth middleware;
     * see routes/web.php for the public registration of this route.
     *
     * IMPORTANT: the exact shape of $request here is per Daraja's
     * published callback format. Log the raw payload on first real
     * test and adjust parsing if Safaricom's actual response differs.
     */
    public function callback(Request $request)
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

        if (! $mpesaRequest) {
            Log::warning('M-Pesa callback for unknown CheckoutRequestID', ['checkout_request_id' => $stkCallback['CheckoutRequestID']]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if (! $mpesaRequest->isPending()) {
            // Already processed — Safaricom can retry callbacks; this
            // makes the handler idempotent rather than double-applying
            // a payment on a duplicate delivery.
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $resultCode = $stkCallback['ResultCode'] ?? null;

        DB::transaction(function () use ($mpesaRequest, $stkCallback, $resultCode) {
            $mpesaRequest->result_payload = $stkCallback;

            if ($resultCode === 0) {
                // Success — extract the M-Pesa receipt number from
                // CallbackMetadata.Item (Daraja's slightly awkward
                // array-of-{Name,Value} structure).
                $items = $stkCallback['CallbackMetadata']['Item'] ?? [];
                $metadata = collect($items)->pluck('Value', 'Name');

                $mpesaRequest->status = 'success';
                $mpesaRequest->save();

                $invoice = Invoice::query()->lockForUpdate()->findOrFail($mpesaRequest->invoice_id);

                $companyId = $invoice->company_id;
                $ref = sprintf(
                    'ACC-PAY-%d-%05d',
                    now()->year,
                    DocumentCounter::nextNumber($companyId, 'payment')
                );

                Payment::create([
                    'company_id' => $companyId,
                    'ref' => $ref,
                    'tenant_id' => $mpesaRequest->tenant_id,
                    'invoice_id' => $invoice->id,
                    'amount' => $mpesaRequest->amount,
                    'method' => 'mpesa',
                    'external_ref' => $metadata->get('MpesaReceiptNumber'),
                    'paid_at' => now(),
                    'created_by' => null, // system-originated, no admin actor
                ]);

                $invoice->applyPayment((float) $mpesaRequest->amount);
            } else {
                $mpesaRequest->status = $resultCode === 1032 ? 'cancelled' : 'failed';
                $mpesaRequest->save();
            }
        });

        // Daraja expects this exact acknowledgement shape regardless of
        // what we did internally — returning anything else can cause
        // Safaricom to retry the callback repeatedly.
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }
}