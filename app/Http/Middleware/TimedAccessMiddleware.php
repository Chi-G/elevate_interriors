<?php

namespace App\Http\Middleware;

use App\Models\User;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TimedAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Target timed-access user: drmally / drmanley
        if ($user && in_array($user->email, ['drmally@elevateinteriors.space', 'drmanley@elevateinteriors.space', 'drmally@elevate.com', 'drmanley@elevate.com'], true)) {

            // 1. Check if the session has expired (1 hour limit)
            if ($user->access_expires_at && Carbon::now()->gt($user->access_expires_at)) {
                // Set the lockout (using configured hours)
                $user->update([
                    'access_expires_at' => null,
                    'can_login_after' => Carbon::now()->addHours((int) env('TIMED_ADMIN_LOCKOUT_HOURS', User::LOCKOUT_HOURS)),
                ]);

                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                $lockoutHours = (int) env('TIMED_ADMIN_LOCKOUT_HOURS', User::LOCKOUT_HOURS);

                return redirect()->route('login')->with('error', 'Your session has expired. You can log in again in '.$lockoutHours.' hours.');
            }
        }

        return $next($request);
    }
}
