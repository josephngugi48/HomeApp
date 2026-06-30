<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Wallet;
use App\Models\Lease;
use Inertia\Inertia;

class TenantDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $tenantId = $user->id;

        // Total outstanding balance
        $totalBalance = Invoice::where('tenant_id', $tenantId)
            ->where('balance', '>', 0)
            ->sum('balance');

        // Next due date of any unpaid invoice
        $nextDue = Invoice::where('tenant_id', $tenantId)
            ->where('balance', '>', 0)
            ->min('due_date');

        // Current invoice: the one with the earliest due date among unpaid
        $currentInvoice = Invoice::where('tenant_id', $tenantId)
            ->where('balance', '>', 0)
            ->orderBy('due_date')
            ->first();
        $currentInvoiceAmount = $currentInvoice ? $currentInvoice->balance : 0;

        // Outstanding (same as total balance for consistency)
        $outstanding = $totalBalance;

        // Wallet balance
        $walletBalance = Wallet::where('tenant_id', $tenantId)->sum('balance');

        // Active lease unit/apartment/location
        $activeLease = Lease::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('unit.apartment.location')
            ->first();
        $accountName = '';
        if ($activeLease) {
            $unit = $activeLease->unit;
            $apartment = $unit->apartment;
            $location = $apartment->location;
            $accountName = $apartment->name . ' — ' . $location->name;
        }

        // Recent 4 invoices
        $recentInvoices = Invoice::where('tenant_id', $tenantId)
            ->orderBy('issue_date', 'desc')
            ->limit(4)
            ->get(['id', 'issue_date', 'total', 'balance'])
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'date' => $invoice->issue_date->format('F j, Y'),
                    'amount' => (float) $invoice->total,
                    'status' => $invoice->balance > 0 ? 'Unpaid' : 'Paid',
                ];
            });

        return Inertia::render('tenant-dashboard', [
            'user' => [
                'name' => $user->name,
            ],
            'totalBalance' => (float) $totalBalance,
            'nextDue' => $nextDue ? $nextDue->format('j F Y') : null,
            'currentInvoiceAmount' => (float) $currentInvoiceAmount,
            'outstanding' => (float) $outstanding,
            'walletBalance' => (float) $walletBalance,
            'accountName' => $accountName,
            'recentInvoices' => $recentInvoices,
        ]);
    }
}