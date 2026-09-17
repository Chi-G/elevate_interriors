<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Pre-auth check for timed-access user
        $user = User::where('email', $request->email)->first();
        if ($user && $user->can_login_after && Carbon::now()->lt($user->can_login_after)) {
            $waitMinutes = Carbon::now()->diffInMinutes($user->can_login_after);
            $waitText = $waitMinutes > 60
                ? round($waitMinutes / 60, 1).' hours'
                : $waitMinutes.' minutes';

            return back()->with('lockout', [
                'email' => $user->email,
                'unlock_at' => $user->can_login_after->toIso8601String(),
                'wait_text' => $waitText,
                'message' => "Security Policy Account Lockout. Access is restricted until {$user->can_login_after->format('g:i A')}.",
            ])->withErrors([
                'email' => "This account is currently in a mandatory 12-hour lockout period post-session. Please try again in {$waitText}.",
            ]);
        }

        $request->authenticate();

        $request->session()->regenerate();

        // 2. Set expiry for timed-access user
        if (in_array($request->user()->email, ['drmally@elevateinteriors.space', 'drmanley@elevateinteriors.space', 'drmally@elevate.com', 'drmanley@elevate.com'], true)) {
            $request->user()->update([
                'access_expires_at' => Carbon::now()->addHours((int) env('TIMED_ADMIN_SESSION_HOURS', User::TIMED_ACCESS_HOURS)),
                'can_login_after' => null, // Clear any previous blocks
            ]);
        }

        return redirect()->intended(route('dashboard.index', ['slug' => $request->user()->slug], absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Set lockout for timed-access user upon logout
        if ($user && in_array($user->email, ['drmally@elevateinteriors.space', 'drmanley@elevateinteriors.space', 'drmally@elevate.com', 'drmanley@elevate.com'], true)) {
            $user->update([
                'access_expires_at' => null,
                'can_login_after' => Carbon::now()->addHours((int) env('TIMED_ADMIN_LOCKOUT_HOURS', User::LOCKOUT_HOURS)),
            ]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
