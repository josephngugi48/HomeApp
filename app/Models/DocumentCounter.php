<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DocumentCounter extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'document_type', 'year', 'last_number',
    ];

    protected $casts = [
        'last_number' => 'integer',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($counter) {
            if (! $counter->year) {
                $counter->year = now()->year;
            }
            if (! $counter->last_number) {
                $counter->last_number = 0;
            }
        });
    }

    /**
     * Atomically reserve the next sequence number for a given document
     * type within the current company and year. MUST be called inside
     * an existing DB::transaction() — this method does not open its own,
     * since the caller needs the counter increment and the document
     * creation (e.g. Invoice::create) to commit or roll back together.
     *
     * lockForUpdate() ensures two concurrent requests creating invoices
     * at the same time can't both read last_number=14982 and both try
     * to use 14983 — the second request blocks until the first commits.
     */
    public static function nextNumber(int $companyId, string $documentType): int
    {
        $year = now()->year;

        $counter = static::query()
            ->where('company_id', $companyId)
            ->where('document_type', $documentType)
            ->where('year', $year)
            ->lockForUpdate()
            ->first();

        if (! $counter) {
            // firstOrCreate isn't safe here under concurrency without its
            // own lock, so we handle the race by catching the unique
            // constraint violation and retrying the locked read once.
            try {
                $counter = static::create([
                    'company_id' => $companyId,
                    'document_type' => $documentType,
                    'year' => $year,
                    'last_number' => 0,
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                $counter = static::query()
                    ->where('company_id', $companyId)
                    ->where('document_type', $documentType)
                    ->where('year', $year)
                    ->lockForUpdate()
                    ->firstOrFail();
            }
        }

        $counter->increment('last_number');

        return $counter->last_number;
    }
}