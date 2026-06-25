<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Broadcast extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'title', 'body', 'channel', 'audience_filter',
        'scheduled_at', 'sent_at', 'sent_count', 'delivered_count',
        'status', 'created_by',
    ];

    protected $casts = [
        'audience_filter' => 'json',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}