<?php

namespace App\Http\Controllers\Wallet;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WalletController extends Controller
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
        Gate::authorize('viewAny', Wallet::class);

        $companyId = $this->resolveCompanyId();

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();

        $query = Wallet::query()
            ->where('company_id', $companyId)
            ->with('tenant:id,name,email')
            ->where('balance', '>', 0); // only tenants with an actual balance are worth listing here

        if ($search) {
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $wallets = $query->orderByDesc('balance')->paginate($perPage)->withQueryString();

        return Inertia::render('wallet/index', [
            'wallets' => $wallets,
            'filters' => ['search' => $search],
            'can' => [
                'deposit' => Gate::allows('deposit', Wallet::class),
            ],
        ]);
    }

    /**
     * Per-tenant ledger view — the actual transaction history, plus the
     * "apply to invoice" action for that tenant's outstanding invoices.
     */
    public function show(Wallet $wallet)
    {
        Gate::authorize('view', $wallet);

        $companyId = $this->resolveCompanyId();

        // Ensure the wallet requested belongs to the active tenant/company context
        if ($wallet->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $wallet->load('tenant:id,name,email');

        $transactions = $wallet->transactions()
            ->orderByDesc('occurred_at')
            ->paginate(20);

        $outstandingInvoices = Invoice::query()
            ->where('company_id', $wallet->company_id)
            ->where('tenant_id', $wallet->tenant_id)
            ->whereIn('status', ['unpaid', 'partial', 'overdue'])
            ->orderBy('due_date')
            ->get(['id', 'number', 'total', 'balance']);

        return Inertia::render('wallet/show', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'outstandingInvoices' => $outstandingInvoices,
            'can' => [
                'deposit' => Gate::allows('deposit', Wallet::class),
                'applyToInvoice' => Gate::allows('applyToInvoice', Wallet::class),
            ],
        ]);
    }

    /**
     * Manual top-up — admin records that a tenant has deposited funds
     * not tied to any specific invoice (e.g. cash handed over for
     * future rent). Distinct from a Payment, which is always invoice-
     * linked per the Payments module's locked-in design.
     */
    public function deposit(Request $request, Wallet $wallet)
    {
        Gate::authorize('deposit', Wallet::class);

        $companyId = $this->resolveCompanyId();

        if ($wallet->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
        ]);

        $wallet->recordTransaction(
            type: 'deposit',
            amount: (float) $validated['amount'],
            ref: null,
            meta: ['note' => $validated['note'] ?? null, 'recorded_by' => auth()->id()],
        );

        return back()->with('success', 'Wallet deposit recorded.');
    }

    /**
     * Explicit, admin-triggered action: apply available wallet credit
     * to a specific outstanding invoice. This is the ONLY way wallet
     * credit reduces an invoice balance — never automatic at invoice
     * creation, per design decision.
     */
    public function applyToInvoice(Request $request, Wallet $wallet)
    {
        Gate::authorize('applyToInvoice', Wallet::class);

        $companyId = $this->resolveCompanyId();

        if ($wallet->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'invoice_id' => [
                'required',
                Rule::exists('invoices', 'id')
                    ->where('company_id', $wallet->company_id)
                    ->where('tenant_id', $wallet->tenant_id),
            ],
            'amount' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($validated, $wallet, &$applyAmount, &$invoice) {
            $invoice = Invoice::query()->lockForUpdate()->findOrFail($validated['invoice_id']);
            $wallet->lockForUpdate()->refresh();

            $applyAmount = min((float) $validated['amount'], (float) $wallet->balance, (float) $invoice->balance);

            if ($applyAmount <= 0) {
                abort(422, 'Nothing to apply — check the wallet balance and invoice balance.');
            }

            $wallet->transactions()->create([
                'type' => 'payment',
                'amount' => -$applyAmount,
                'ref' => "applied:{$invoice->number}",
                'occurred_at' => now(),
                'meta' => ['invoice_id' => $invoice->id, 'applied_by' => auth()->id()],
            ]);
            $wallet->decrement('balance', $applyAmount);

            $invoice->applyPayment($applyAmount);
        });

        return back()->with('success', "Applied KES {$applyAmount} from wallet to invoice {$invoice->number}.");
    }
}