<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'title',
        'icon',
        'route',
        'permission',
        'parent_id',
        'order',
        'status_id',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id');
    }


    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }


    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
