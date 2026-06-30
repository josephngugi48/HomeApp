<?php

namespace App\Services;

use App\Models\BroadcastContactList;
use App\Models\User;
use Illuminate\Support\Collection;

class BroadcastRecipientResolver
{
    /**
     * Resolve the final, deduplicated recipient list for a broadcast
     * from its audience configuration. Tenant-sourced and ad-hoc-sourced
     * recipients are merged here; if the same email or phone appears
     * from both sources, only the first occurrence is kept — this is
     * the enforcement point for "duplicate recipient" validation.
     *
     * @return array<int, array{user_id: ?int, name: string, email: ?string, phone: ?string, source: string}>
     */
    public function resolve(array $audienceFilter, int $companyId): array
    {
        $resolved = collect();
        $seenKeys = [];

        if (! empty($audienceFilter['apartment_ids'])) {
            $this->resolveTenants($audienceFilter['apartment_ids'], $companyId)
                ->each(function ($tenant) use (&$resolved, &$seenKeys) {
                    $key = $this->dedupeKeyFor($tenant['email'], $tenant['phone']);
                    if ($key && isset($seenKeys[$key])) {
                        return; // duplicate — already added from an earlier source
                    }
                    if ($key) {
                        $seenKeys[$key] = true;
                    }
                    $resolved->push($tenant);
                });
        }

        foreach ($audienceFilter['contact_list_ids'] ?? [] as $listId) {
            $list = BroadcastContactList::query()->where('company_id', $companyId)->find($listId);
            if (! $list) {
                continue;
            }

            $list->contacts->each(function ($contact) use (&$resolved, &$seenKeys) {
                $key = $this->dedupeKeyFor($contact->email, $contact->phone);
                if ($key && isset($seenKeys[$key])) {
                    return;
                }
                if ($key) {
                    $seenKeys[$key] = true;
                }
                $resolved->push([
                    'user_id' => null,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'source' => 'uploaded_list',
                ]);
            });
        }

        return $resolved->values()->all();
    }

    private function resolveTenants(array $apartmentIds, int $companyId): Collection
    {
        return User::query()
            ->role('tenant')
            ->whereHas('companies', fn ($q) => $q->where('companies.id', $companyId))
            ->whereHas('leases', function ($q) use ($apartmentIds) {
                $q->where('status', 'active')
                    ->whereHas('unit', fn ($q) => $q->whereIn('apartment_id', $apartmentIds));
            })
            ->with('tenantProfile')
            ->get()
            ->map(fn ($user) => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => null, // User model has no native phone column today — see flag below
                'source' => 'tenant',
            ]);
    }

    private function dedupeKeyFor(?string $email, ?string $phone): ?string
    {
        if ($email) {
            return 'email:'.strtolower(trim($email));
        }
        if ($phone) {
            return 'phone:'.preg_replace('/\D/', '', $phone);
        }
        return null;
    }
}