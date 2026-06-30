<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Issue extends Model
{
    use SoftDeletes, BelongsToCompany, LogsActivity;

    public const CATEGORIES = ['general', 'security', 'utility', 'property'];
    public const STATUSES = ['open', 'assigned', 'in_progress', 'closed'];

    protected $fillable = [
        'company_id', 'lease_id', 'tenant_id', 'unit_id',
        'category', 'title', 'body', 'status', 'assignee_id', 'raised_at',
    ];

    protected $casts = [
        'raised_at' => 'datetime',
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

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}