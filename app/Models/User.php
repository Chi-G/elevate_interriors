<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Constants for timed access restrictions
     */
    /**
     * Constants for timed access restrictions (loaded from .env)
     */
    const TIMED_ACCESS_HOURS = 1;      // Default if not in .env

    const LOCKOUT_HOURS = 12;         // Default if not in .env

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'uuid',
        'role_id',
        'access_expires_at',
        'can_login_after',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['slug'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'access_expires_at' => 'datetime',
            'can_login_after' => 'datetime',
        ];
    }

    /**
     * Check if user is Super Admin
     */
    public function isSuperAdmin()
    {
        return $this->role === 'Super Admin';
    }

    /**
     * Scope users visible to the given viewer.
     * Super Admin accounts are only visible to other Super Admins.
     */
    public function scopeVisibleTo($query, ?User $viewer)
    {
        if (! $viewer || ! $viewer->isSuperAdmin()) {
            return $query->where('role', '!=', 'Super Admin')
                ->where('email', '!=', 'chijindu.nwokeohuru@gmail.com');
        }

        return $query;
    }

    /**
     * Check if user has administrative powers
     */
    public function isAdmin()
    {
        return in_array($this->role, ['Super Admin', 'Admin']);
    }

    /**
     * Check if user is at least a Manager
     */
    public function isManager()
    {
        return in_array($this->role, ['Super Admin', 'Admin', 'Manager']);
    }

    /**
     * Boot the model to auto-generate UUID on creation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (! $user->uuid) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the role-based URL slug
     */
    public function getSlugAttribute()
    {
        return Str::slug($this->role).'-'.$this->uuid;
    }

    /**
     * Get the user's role relationship
     */
    public function role_relation(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionName): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->role_relation && $this->role_relation->permissions->contains('name', $permissionName);
    }
}
