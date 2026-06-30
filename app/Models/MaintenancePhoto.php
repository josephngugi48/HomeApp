<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenancePhoto extends Model
{
    public const KINDS = ['before', 'after'];

    protected $fillable = [
        'maintenance_request_id', 'path', 'kind',
    ];

    public function maintenanceRequest()
    {
        return $this->belongsTo(MaintenanceRequest::class);
    }
}