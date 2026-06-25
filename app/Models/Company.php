<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'phone', 'email', 'address', 'logo_path',
        'primary_color', 'secondary_color', 'accent_color', 'status',
        'trial_ends_at', 'created_by',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($company) {
            if (empty($company->uuid)) {
                $company->uuid = (string) Str::uuid();
            }
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
        });
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'company_user')
            ->withPivot('status', 'joined_at', 'invited_by')
            ->withTimestamps();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relationships to other company-scoped models
    public function locations() { return $this->hasMany(Location::class); }
    public function apartments() { return $this->hasMany(Apartment::class); }
    public function units() { return $this->hasMany(Unit::class); }
    public function leases() { return $this->hasMany(Lease::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
    public function payments() { return $this->hasMany(Payment::class); }
    public function wallets() { return $this->hasMany(Wallet::class); }
    public function issues() { return $this->hasMany(Issue::class); }
    public function maintenanceRequests() { return $this->hasMany(MaintenanceRequest::class); }
    public function broadcasts() { return $this->hasMany(Broadcast::class); }
    public function documents() { return $this->hasMany(Document::class); }
    public function documentCounters() { return $this->hasMany(DocumentCounter::class); }
}