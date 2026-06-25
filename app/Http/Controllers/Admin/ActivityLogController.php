<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the activity logs.
     */
    public function index(Request $request)
    {
        $activities = Activity::with(['causer', 'subject'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/activities/Index', [
            'activities' => $activities,
            'telescope_url' => config('telescope.enabled') ? url(config('telescope.path', 'telescope')) : null,
            'log_viewer_url' => config('log-viewer.enabled') ? url(config('log-viewer.route_path', 'log-viewer')) : null,
        ]);
    }
}
