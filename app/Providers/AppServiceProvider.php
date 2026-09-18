<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (config('app.env') === 'production') {
            // Use the URL from the environment configuration (Laravel Cloud or Hostinger .env)
            $url = config('app.url');

            // Fix for host detection in potential subdirectory deployments
            $this->app->bind('path.public', function () {
                return base_path('public');
            });

            // Ensure HTTPS and standard Root URL usage
            if ($url) {
                URL::forceRootUrl($url);
            }
            URL::forceScheme('https');
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (config('app.env') === 'production') {
            $url = config('app.url');

            // Force the configured Root URL and Scheme
            if ($url) {
                URL::forceRootUrl($url);
            }
            URL::forceScheme('https');

            // Inject asset URL for Vite manifest resolution
            if ($url) {
                putenv("VITE_ASSET_URL=$url");
                $_ENV['VITE_ASSET_URL'] = $url;
            }
        }

        // --- DYNAMIC PERMISSION SYSTEM ---

        // 1. Super Admin Bypass (God Mode)
        Gate::before(function ($user, $ability) {
            return $user->role === 'Super Admin' ? true : null;
        });

        // 2. Register all permissions as Gates
        try {
            if (Schema::hasTable('permissions')) {
                $permissions = Permission::all();
                foreach ($permissions as $permission) {
                    Gate::define($permission->name, function ($user) use ($permission) {
                        return $user->hasPermission($permission->name);
                    });
                }
            }
        } catch (\Exception $e) {
            // Silently fail if DB is not ready (e.g., during build or migrations)
        }

        // 3. Custom branded Password Reset Email
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Reset Your Password - Elevate Interiors')
                ->view('emails.reset-password', [
                    'notifiable' => $notifiable,
                    'resetUrl' => $resetUrl,
                    'token' => $token,
                ]);
        });
    }
}
