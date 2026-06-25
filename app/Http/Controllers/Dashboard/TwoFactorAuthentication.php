<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TwoFactorAuthentication extends Controller
{

    public function tfa_notice()
    {
        // Show the TFA prompt view
        return Inertia::render('auth/tfa-prompt');
    }

    public function skip_tfa()
    {
        // Mark in session that MFA has been skipped
        session(['mfa_skipped' => true]);

        // Redirect to dashboard
        return redirect()->route('dashboard');
    }
}