<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class BroadcastContactList extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'name', 'original_filename', 'contact_count', 'uploaded_by',
    ];

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function contacts()
    {
        return $this->hasMany(BroadcastContact::class, 'contact_list_id');
    }
}