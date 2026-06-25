<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'user_id', 'kind', 'path', 'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}