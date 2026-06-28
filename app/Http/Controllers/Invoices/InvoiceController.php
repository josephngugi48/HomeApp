<?php

namespace App\Http\Controllers\Invoices;

use App\Http\Controllers\Controller;
use App\Models\DocumentCounter;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lease;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class InvoiceController extends Controller
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
        Gate::authorize('viewAny', Invoice::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $companyId = $this->resolveCompanyId();

        $query = Invoice::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name,email', 'unit:id,unit_no,apartment_id', 'unit.apartment:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $allowedSorts = ['id', 'number', 'issue_date', 'due_date', 'total', 'balance', 'status', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('issue_date', 'desc');
        }

        $invoices = $query->paginate($perPage)->withQueryString();
        $invoices->getCollection()->transform(function ($invoice) {
            $invoice->can = [
                'update' => Gate::allows('update', $invoice),
                'delete' => Gate::allows('delete', $invoice),
            ];
            return $invoice;
        });

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'statusOptions' => Invoice::STATUSES,
            'can' => [
                'create' => Gate::allows('create', Invoice::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Invoice::class);

        return Inertia::render('invoices/create', [
            'leases' => Lease::query()
                ->where('status', 'active')
                ->with(['tenant:id,name,email', 'unit:id,unit_no,apartment_id', 'unit.apartment:id,name'])
                ->get(['id', 'tenant_id', 'unit_id', 'rent', 'service_charge']),
            'itemTypes' => InvoiceItem::TYPES,
            'walletBalances' => \App\Models\Wallet::query()
                ->where('company_id', app('currentCompany')->id)
                ->where('balance', '>', 0)
                ->pluck('balance', 'tenant_id'),
        ]);
    }

    
    public function store(Request $request)
    {
        Gate::authorize('create', Invoice::class);

        // 🛡️ Safely fetch the current company ID from container or fallback to authenticated context
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            $companyId = is_numeric($resolved) ? (int)$resolved : ($resolved->id ?? 1);
        } else {
            $companyId = auth()->user()->company_id ?? 1;
        }

        $validated = $request->validate([
            'lease_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('leases', 'id')->where('company_id', $companyId),
            ],
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'amount_already_paid' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.type' => ['required', \Illuminate\Validation\Rule::in(InvoiceItem::TYPES)],
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice = DB::transaction(function () use ($validated, $companyId) {
            $lease = Lease::query()
                ->where('company_id', $companyId)
                ->findOrFail($validated['lease_id']);

            $subtotal = 0;
            $itemRows = [];

            foreach ($validated['items'] as $item) {
                $amount = round($item['quantity'] * $item['unit_price'], 2);
                $subtotal += $amount;
                $itemRows[] = [
                    'type' => $item['type'],
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'amount' => $amount,
                ];
            }

            $total = $subtotal;
            $manualAlreadyPaid = min((float) ($validated['amount_already_paid'] ?? 0), $total);

            $number = sprintf(
                'ACC-SINV-%d-%05d',
                now()->year,
                DocumentCounter::nextNumber($companyId, 'invoice')
            );

            $invoice = Invoice::create([
                'company_id' => $companyId,
                'number' => $number,
                'lease_id' => $lease->id,
                'tenant_id' => $lease->tenant_id,
                'unit_id' => $lease->unit_id,
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'subtotal' => $subtotal,
                'total' => $total,
                'balance' => $total,
                'status' => 'unpaid',
                'created_by' => auth()->id(),
            ]);

            foreach ($itemRows as $row) {
                $invoice->items()->create($row);
            }

            // Manual opening adjustment (e.g. deposit collected at signing,
            // unrelated to the wallet) — recorded as a real Payment, same
            // as before.
            if ($manualAlreadyPaid > 0) {
                $paymentNumber = sprintf(
                    'ACC-PAY-%d-%05d',
                    now()->year,
                    DocumentCounter::nextNumber($companyId, 'payment')
                );

                Payment::create([
                    'company_id' => $companyId,
                    'ref' => $paymentNumber,
                    'tenant_id' => $lease->tenant_id,
                    'invoice_id' => $invoice->id,
                    'amount' => $manualAlreadyPaid,
                    'method' => 'adjustment',
                    'paid_at' => $validated['issue_date'],
                    'created_by' => auth()->id(),
                ]);

                $invoice->applyPayment($manualAlreadyPaid);
            } else {
                $invoice->refreshStatus();
                $invoice->save();
            }

            // Auto-apply any available wallet credit to whatever balance
            // remains after the manual adjustment above. This is the
            // confirmed behavior: existing wallet balance is consumed
            // automatically at invoice creation, not held back for a
            // separate manual step.
            $wallet = Wallet::forTenant($companyId, $lease->tenant_id);

            if ((float) $wallet->balance > 0 && (float) $invoice->balance > 0) {
                $autoApply = min((float) $wallet->balance, (float) $invoice->balance);

                $wallet->lockForUpdate()->refresh();
                $autoApply = min($autoApply, (float) $wallet->balance); // re-check after lock

                if ($autoApply > 0) {
                    $wallet->transactions()->create([
                        'type' => 'payment',
                        'amount' => -$autoApply,
                        'ref' => "auto-applied:{$invoice->number}",
                        'occurred_at' => now(),
                        'meta' => ['invoice_id' => $invoice->id, 'auto_applied' => true],
                    ]);
                    $wallet->decrement('balance', $autoApply);

                    $invoice->applyPayment($autoApply);
                }
            }

            return $invoice;
        });

        return redirect()->route('invoices.index')->with('success', "Invoice {$invoice->number} created successfully.");
    }

    public function show(Invoice $invoice)
    {
        Gate::authorize('view', $invoice);

        $invoice->load([
            'tenant:id,name,email',
            'unit:id,unit_no,apartment_id',
            'unit.apartment:id,name',
            'items',
            'lease:id,start_date,end_date',
        ]);
        
        $walletCreditApplied = \App\Models\WalletTransaction::query()
            ->whereJsonContains('meta->invoice_id', $invoice->id)
            ->where('type', 'payment')
            ->sum('amount');

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
            'walletCreditApplied' => abs((float) $walletCreditApplied),
        ]);

        // return Inertia::render('invoices/show', [
        //     'invoice' => $invoice,
        // ]);
    }

    public function destroy(Invoice $invoice)
    {
        Gate::authorize('delete', $invoice);

        if ($invoice->status !== 'draft' && (float) $invoice->balance < (float) $invoice->total) {
            return back()->with('error', 'Cannot delete an invoice that has received payments.');
        }

        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}