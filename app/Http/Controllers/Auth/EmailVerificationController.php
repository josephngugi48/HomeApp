<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class EmailVerificationController extends Controller
{
    //

    public function verify_email_link($id, $hash, Request $request)
    {
        // Find the user by ID
        $user = User::findOrFail($id);

        // Validate the signature and hash 
        if (!URL::hasValidSignature($request) || !hash_equals((string) $hash, sha1($user->email))) {
            abort(403, 'Invalid or expired verification link.');
        }

        // Mark as verified if not already
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }
        //Auth::login($user);
        // Redirect to login — Fortify will handle 2FA if enabled
        return redirect()->route('dashboard');
    }

    public function get_verification_notice()
    {
        //fetch authenticated user
        $user = auth()->user();

        //if user has verified email, redirect to dashboard
        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        //else show the email verification notice
        return Inertia::render('auth/verify-email');
    }

    public function send_verification_email(Request $request)
    {
        //if user has verified email, redirect to dashboard
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        //send the email verification notification
        $request->user()->sendEmailVerificationNotification();

        //return back with status
        return back()->with('status', 'verification-link-sent');
    }
}
