<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Broadcast extends Model
{
    use BelongsToCompany, LogsActivity;

    public const CHANNELS = ['sms', 'email', 'whatsapp'];
    public const STATUSES = ['draft', 'sending', 'sent', 'failed'];

    protected $fillable = [
        'company_id', 'title', 'body', 'channels', 'audience_filter',
        'scheduled_at', 'sent_at', 'sent_count', 'delivered_count',
        'status', 'created_by',
    ];

    protected $casts = [
        'channels' => 'array',
        'audience_filter' => 'json',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients()
    {
        return $this->hasMany(BroadcastRecipient::class);
    }

    public function usesChannel(string $channel): bool
    {
        return in_array($channel, $this->channels ?? [], true);
    }

    /**
     * Recompute the rollup counters from the actual recipient records —
     * the same "derived from real rows, not trusted as a standalone
     * number" discipline applied to Invoice::balance and Wallet::balance.
     * Call after any bulk status update (e.g. after a delivery webhook).
     */
    public function refreshCounts(): void
    {
        $this->sent_count = $this->recipients()
            ->get()
            ->filter(fn ($r) => $r->hasAnyChannelStatus(['sent', 'delivered', 'failed']))
            ->count();

        $this->delivered_count = $this->recipients()
            ->get()
            ->filter(fn ($r) => $r->hasAnyChannelStatus(['delivered']))
            ->count();

        $this->saveQuietly(); // avoid spamming activity log on every webhook tick
    }
}