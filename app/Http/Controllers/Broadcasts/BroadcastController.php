<?php

namespace App\Http\Controllers\Broadcasts;

use App\Http\Controllers\Controller;
use App\Jobs\SendBroadcastToRecipient;
use App\Models\Apartment;
use App\Models\Broadcast;
use App\Models\BroadcastContactList;
use App\Services\BroadcastRecipientResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    public function __construct(private readonly BroadcastRecipientResolver $resolver)
    {
    }

    /**
     * Safely resolve the company ID from the service container or fallback options.
     */
    private function resolveCompanyId(): int
    {
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            return is_numeric($resolved) ? (int)$resolved : ($resolved->id ?? 1);
        }
        
        return auth()->user()->company_id ?? 1;
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Broadcast::class);

        $companyId = $this->resolveCompanyId();

        $broadcasts = Broadcast::query()
            ->where('company_id', $companyId)
            ->with('createdBy:id,name')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        $broadcasts->getCollection()->transform(function ($b) {
            $b->can = ['delete' => Gate::allows('delete', $b)];
            return $b;
        });

        return Inertia::render('broadcasts/index', [
            'broadcasts' => $broadcasts,
            'can' => ['create' => Gate::allows('create', Broadcast::class)],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Broadcast::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('broadcasts/create', [
            'apartments' => Apartment::query()->where('company_id', $companyId)->orderBy('name')->get(['id', 'name']),
            'contactLists' => BroadcastContactList::query()->where('company_id', $companyId)->orderByDesc('created_at')->get(['id', 'name', 'contact_count']),
            'channelOptions' => Broadcast::CHANNELS,
        ]);
    }

    /**
     * Preview the resolved, deduplicated recipient count before
     * actually sending — lets the admin see "this will reach 142
     * people" and catch an empty/wrong audience before committing.
     */
    public function preview(Request $request)
    {
        Gate::authorize('create', Broadcast::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'apartment_ids' => 'nullable|array',
            'apartment_ids.*' => Rule::exists('apartments', 'id')->where('company_id', $companyId),
            'contact_list_ids' => 'nullable|array',
            'contact_list_ids.*' => Rule::exists('broadcast_contact_lists', 'id')->where('company_id', $companyId),
        ]);

        $recipients = $this->resolver->resolve($validated, $companyId);

        return response()->json([
            'count' => count($recipients),
            'sample' => array_slice($recipients, 0, 5),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Broadcast::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:2000',
            'channels' => 'required|array|min:1',
            'channels.*' => Rule::in(Broadcast::CHANNELS),
            'apartment_ids' => 'nullable|array',
            'apartment_ids.*' => Rule::exists('apartments', 'id')->where('company_id', $companyId),
            'contact_list_ids' => 'nullable|array',
            'contact_list_ids.*' => Rule::exists('broadcast_contact_lists', 'id')->where('company_id', $companyId),
        ]);

        $audienceFilter = [
            'apartment_ids' => $validated['apartment_ids'] ?? [],
            'contact_list_ids' => $validated['contact_list_ids'] ?? [],
        ];

        $recipients = $this->resolver->resolve($audienceFilter, $companyId);

        if (empty($recipients)) {
            return back()->withErrors(['apartment_ids' => 'No recipients matched this audience. Select at least one building or contact list.']);
        }

        $broadcast = DB::transaction(function () use ($validated, $audienceFilter, $companyId, $recipients) {
            $broadcast = Broadcast::create([
                'company_id' => $companyId,
                'title' => $validated['title'],
                'body' => $validated['body'],
                'channels' => $validated['channels'],
                'audience_filter' => $audienceFilter,
                'sent_at' => now(),
                'sent_count' => 0,
                'delivered_count' => 0,
                'status' => 'sending',
                'created_by' => auth()->id(),
            ]);

            foreach ($recipients as $r) {
                $broadcast->recipients()->create([
                    'user_id' => $r['user_id'],
                    'resolved_name' => $r['name'],
                    'resolved_email' => $r['email'],
                    'resolved_phone' => $r['phone'],
                    'channel_statuses' => array_fill_keys($validated['channels'], ['status' => 'pending']),
                ]);
            }

            return $broadcast;
        });

        // Queue the actual sends OUTSIDE the transaction — dispatching
        // jobs that reference rows from a transaction that might still
        // roll back is a classic race condition; by the time we get
        // here the transaction has already committed.
        foreach ($broadcast->recipients as $recipient) {
            foreach ($broadcast->channels as $channel) {
                SendBroadcastToRecipient::dispatch($recipient, $channel);
            }
        }

        return redirect()->route('broadcasts.index')->with('success', "Broadcast queued for {$broadcast->recipients()->count()} recipients.");
    }

    public function show(Broadcast $broadcast)
    {
        Gate::authorize('view', $broadcast);

        $companyId = $this->resolveCompanyId();

        if ($broadcast->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $recipients = $broadcast->recipients()->paginate(25);

        return Inertia::render('broadcasts/show', [
            'broadcast' => $broadcast,
            'recipients' => $recipients,
        ]);
    }

    public function uploadContactList(Request $request)
    {
        Gate::authorize('create', Broadcast::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $rows = array_map('str_getcsv', file($request->file('file')->getRealPath()));
        $header = array_map('strtolower', array_shift($rows));

        $nameIdx = array_search('name', $header);
        $emailIdx = array_search('email', $header);
        $phoneIdx = array_search('phone', $header) ?: array_search('mobile', $header) ?: array_search('mobile number', $header);

        if ($nameIdx === false) {
            return back()->withErrors(['file' => 'CSV must include a "Name" column.']);
        }

        $list = BroadcastContactList::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'original_filename' => $request->file('file')->getClientOriginalName(),
            'contact_count' => 0,
            'uploaded_by' => auth()->id(),
        ]);

        $count = 0;
        foreach ($rows as $row) {
            $name = trim($row[$nameIdx] ?? '');
            if (! $name) {
                continue;
            }
            $list->contacts()->create([
                'name' => $name,
                'email' => $emailIdx !== false ? trim($row[$emailIdx] ?? '') ?: null : null,
                'phone' => $phoneIdx !== false ? trim($row[$phoneIdx] ?? '') ?: null : null,
            ]);
            $count++;
        }

        $list->update(['contact_count' => $count]);

        return back()->with('success', "Uploaded {$count} contacts.");
    }
}