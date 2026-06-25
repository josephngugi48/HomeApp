<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use function PHPUnit\Framework\isNull;

class EnsureMFAEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle($request, Closure $next)
    {
        $user = $request->user();

        // Only check logged-in users
        if ($user) {
            $systemSettings = \App\Models\SystemSetting::current();
            
            // If global MFA is disabled, skip checking
            if (!$systemSettings->is_mfa_enabled) {
                return $next($request);
            }

            $mfaEnabled = !is_null($user->two_factor_confirmed_at);
            $skipped = session('mfa_skipped', false);

            // If MFA is NOT enabled and the user has NOT skipped
            if (!$mfaEnabled && !$skipped && !$request->routeIs('tfa_prompt')) {
                return redirect()->route('tfa_prompt');
            }
        }

        return $next($request);
    }
}
