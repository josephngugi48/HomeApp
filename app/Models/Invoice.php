<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany, LogsActivity;

    public const STATUSES = ['draft', 'unpaid', 'partial', 'paid', 'overdue'];

    protected $fillable = [
        'company_id', 'uuid', 'number', 'lease_id', 'tenant_id', 'unit_id',
        'issue_date', 'due_date', 'subtotal', 'total', 'balance', 'status',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = (string) Str::uuid();
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Recompute status from balance vs total. Called after balance
     * changes (e.g. by the Payments module later) — not invoked by
     * this Invoicing module itself beyond initial creation, since at
     * creation time the status is always known outright (paid if the
     * pre-payment adjustment covers it in full, otherwise unpaid).
     */
    public function refreshStatus(): void
    {
        if ((float) $this->balance <= 0) {
            $this->status = 'paid';
        } elseif ((float) $this->balance < (float) $this->total) {
            $this->status = 'partial';
        } elseif ($this->due_date && $this->due_date->isPast()) {
            $this->status = 'overdue';
        } else {
            $this->status = 'unpaid';
        }
    }

    /**
     * Apply a payment amount against this invoice's balance and recompute
     * status accordingly. Does NOT create the Payment row itself — callers
     * (Invoice::store's opening-payment branch, and the future Payments
     * module) are responsible for creating the Payment record and should
     * call this immediately after, inside the same transaction.
     */
    // public function applyPayment(float $amount): void
    // {
    //     $this->balance = max(0, round((float) $this->balance - $amount, 2));
    //     $this->refreshStatus();
    //     $this->save();
    // }

    // Replace the version on Invoice from the Payments slice:

    /**
     * Apply a payment amount against this invoice's balance. If the
     * payment exceeds the remaining balance, the excess is converted
     * into a real Wallet deposit for this invoice's tenant — the
     * invoice itself never carries a negative balance. This closes the
     * gap where overpayment used to leave a credit with no ledger entry
     * backing it (see Payments module decision).
     */
    public function applyPayment(float $amount): void
    {
        $newBalance = round((float) $this->balance - $amount, 2);

        if ($newBalance < 0) {
            $excess = abs($newBalance);
            $newBalance = 0;

            $wallet = Wallet::forTenant($this->company_id, $this->tenant_id);
            $wallet->recordTransaction(
                type: 'deposit',
                amount: $excess,
                ref: "overpayment:{$this->number}",
                meta: ['source_invoice_id' => $this->id, 'reason' => 'overpayment_credit'],
            );
        }

        $this->balance = $newBalance;
        $this->refreshStatus();
        $this->save();
    }


    /**
     * Reverse a previously applied payment amount — re-increases balance
     * and recomputes status. Called when a Payment is reversed, inside
     * the same transaction as marking that Payment's reversed_at/reversed_by.
     */
    public function reversePayment(float $amount): void
    {
        $this->balance = round((float) $this->balance + $amount, 2);
        $this->refreshStatus();
        $this->save();
    }
}