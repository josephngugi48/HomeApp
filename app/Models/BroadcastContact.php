<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BroadcastContact extends Model
{
    protected $fillable = ['contact_list_id', 'name', 'email', 'phone'];

    public function contactList()
    {
        return $this->belongsTo(BroadcastContactList::class, 'contact_list_id');
    }
}