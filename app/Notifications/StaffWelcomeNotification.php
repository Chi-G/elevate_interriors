<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StaffWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $temporaryPassword = 'password123'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $name = $notifiable->name ?? 'Team Member';
        $role = $notifiable->role ?? 'Staff';
        $email = $notifiable->email ?? ($notifiable->routes['mail'] ?? 'your registered email');
        $loginUrl = route('login');

        return (new MailMessage)
            ->subject('Welcome to Elevate Interiors - Your Account Credentials')
            ->greeting("Hello {$name},")
            ->line('Your account has been created on the Elevate Interiors management platform.')
            ->line("**Role:** {$role}")
            ->line("**Login Email:** {$email}")
            ->line("**Temporary Password:** `{$this->temporaryPassword}`")
            ->action('Log In to Elevate Interiors', $loginUrl)
            ->line('For security, please sign in and change your password immediately after your initial login.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'role' => $notifiable->role,
            'email' => $notifiable->email,
        ];
    }
}
