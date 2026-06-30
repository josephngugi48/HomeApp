<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Notice extends Model
{
    use BelongsToCompany, LogsActivity;

    public const TYPES = ['vacating', 'lease_renewal', 'lease_termination'];
    public const STATUSES = ['open', 'acknowledged', 'closed'];

    protected $fillable = [
        'company_id', 'lease_id', 'tenant_id', 'unit_id',
        'type', 'submitted_at', 'effective_at', 'status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'effective_at' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
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

    /**
     * True when this is a Vacating notice whose effective date has
     * arrived (or passed) and the linked lease is still active —
     * meaning staff have a pending decision to make. This is a query
     * helper, NOT a trigger; nothing reads this and acts automatically.
     * See Notice::actionNeeded() scope and the dashboard surface in
     * NoticeController::index().
     */
    public function needsAction(): bool
    {
        return $this->type === 'vacating'
            && $this->status !== 'closed'
            && $this->effective_at !== null
            && $this->effective_at->isPast()
            && $this->lease?->status === 'active';
    }

    public function scopeActionNeeded($query)
    {
        return $query->where('type', 'vacating')
            ->where('status', '!=', 'closed')
            ->whereDate('effective_at', '<=', now())
            ->whereHas('lease', fn ($q) => $q->where('status', 'active'));
    }
}