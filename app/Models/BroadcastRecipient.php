<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BroadcastRecipient extends Model
{
    public const CHANNEL_STATUSES = ['pending', 'sent', 'delivered', 'failed'];

    protected $fillable = [
        'broadcast_id', 'user_id', 'ad_hoc_name', 'ad_hoc_email', 'ad_hoc_phone',
        'resolved_name', 'resolved_email', 'resolved_phone', 'channel_statuses',
    ];

    protected $casts = [
        'channel_statuses' => 'array',
    ];

    public function broadcast()
    {
        return $this->belongsTo(Broadcast::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isAdHoc(): bool
    {
        return $this->user_id === null;
    }

    public function statusFor(string $channel): ?string
    {
        return $this->channel_statuses[$channel]['status'] ?? null;
    }

    public function hasAnyChannelStatus(array $statuses): bool
    {
        foreach ($this->channel_statuses ?? [] as $channelData) {
            if (in_array($channelData['status'] ?? null, $statuses, true)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Update the status for one channel on this recipient. The single
     * chokepoint for writing channel_statuses — same discipline as
     * Invoice::applyPayment() and Wallet::recordTransaction().
     */
    public function setChannelStatus(string $channel, string $status, array $extra = []): void
    {
        $statuses = $this->channel_statuses ?? [];
        $statuses[$channel] = array_merge($statuses[$channel] ?? [], [
            'status' => $status,
            ...$extra,
        ]);
        $this->channel_statuses = $statuses;
        $this->save();
    }

    /**
     * The dedup key used to detect overlapping recipients within one
     * broadcast — by email if present, else by normalized phone.
     * This is what makes "tenant also appears in the uploaded list"
     * detectable before sending.
     */
    public function dedupeKey(): string
    {
        return strtolower(trim($this->resolved_email ?: $this->resolved_phone ?: ''));
    }
}