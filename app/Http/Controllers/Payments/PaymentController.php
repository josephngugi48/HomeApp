<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\DocumentCounter;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Safely resolve the company ID from the service container or fallback options.
     */
    private function resolveCompanyId(): int
    {
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            return is_numeric($resolved) ? (int)$resolved : ($resolved->id ?? 1);
        }
        
        return auth()->user()->company_id ?? 1;
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Payment::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $method = $request->string('method')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $companyId = $this->resolveCompanyId();

        $query = Payment::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name,email', 'invoice:id,number']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ref', 'like', "%{$search}%")
                    ->orWhere('external_ref', 'like', "%{$search}%")
                    ->orWhereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($method) {
            $query->where('method', $method);
        }

        $allowedSorts = ['id', 'ref', 'amount', 'paid_at', 'method', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('paid_at', 'desc');
        }

        $payments = $query->paginate($perPage)->withQueryString();
        $payments->getCollection()->transform(function ($payment) {
            $payment->can = [
                'reverse' => Gate::allows('reverse', $payment) && ! $payment->isReversed(),
            ];
            return $payment;
        });

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'method' => $method,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'methodOptions' => Payment::METHODS,
            'can' => [
                'create' => Gate::allows('create', Payment::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Payment::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('payments/create', [
            // Only invoices with an outstanding balance are realistic
            // targets for a manual payment — fully paid/overpaid ones
            // are still listed (admin might still want to record a
            // payment that creates further credit) but we surface the
            // balance so the form can show it.
            'invoices' => Invoice::query()
                ->where('company_id', $companyId)
                ->whereIn('status', ['unpaid', 'partial', 'overdue'])
                ->with(['tenant:id,name,email', 'unit:id,unit_no'])
                ->orderBy('due_date')
                ->get(['id', 'number', 'tenant_id', 'unit_id', 'total', 'balance']),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Payment::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'invoice_id' => [
                'required',
                Rule::exists('invoices', 'id')->where('company_id', $companyId),
            ],
            'amount' => 'required|numeric|min:0.01',
            'method' => ['required', Rule::in(['bank', 'cash'])], // mpesa comes through the STK flow, not this form
            'external_ref' => 'nullable|string|max:255',
            'paid_at' => 'required|date',
        ]);

        $payment = DB::transaction(function () use ($validated, $companyId) {
            $invoice = Invoice::query()
                ->where('company_id', $companyId)
                ->lockForUpdate()
                ->findOrFail($validated['invoice_id']);

            $ref = sprintf(
                'ACC-PAY-%d-%05d',
                now()->year,
                DocumentCounter::nextNumber($companyId, 'payment')
            );

            $payment = Payment::create([
                'company_id' => $companyId,
                'ref' => $ref,
                'tenant_id' => $invoice->tenant_id,
                'invoice_id' => $invoice->id,
                'amount' => $validated['amount'],
                'method' => $validated['method'],
                'external_ref' => $validated['external_ref'] ?? null,
                'paid_at' => $validated['paid_at'],
                'created_by' => auth()->id(),
            ]);

            $invoice->applyPayment((float) $validated['amount']);

            return $payment;
        });

        return redirect()->route('payments.index')->with('success', "Payment {$payment->ref} recorded successfully.");
    }

    /**
     * Reverse a payment: marks it reversed (soft-undo, row stays for
     * audit) and re-increases the invoice's balance by the same amount.
     * Explicit action, not a delete — matches the immutability stance
     * already applied to Invoices.
     */
    public function reverse(Payment $payment)
    {
        Gate::authorize('reverse', $payment);

        $companyId = $this->resolveCompanyId();

        if ($payment->isReversed()) {
            return back()->with('error', 'This payment has already been reversed.');
        }

        DB::transaction(function () use ($payment, $companyId) {
            $invoice = Invoice::query()
                ->where('company_id', $companyId)
                ->lockForUpdate()
                ->findOrFail($payment->invoice_id);

            $payment->update([
                'reversed_at' => now(),
                'reversed_by' => auth()->id(),
            ]);

            $invoice->reversePayment((float) $payment->amount);
        });

        return redirect()->route('payments.index')->with('success', "Payment {$payment->ref} reversed.");
    }
}