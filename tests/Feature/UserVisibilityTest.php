<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class UserVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions for testing
        $this->seed(AuthorizationSeeder::class);

        foreach (Permission::all() as $permission) {
            Gate::define($permission->name, function ($user) use ($permission) {
                return $user->hasPermission($permission->name);
            });
        }
    }

    public function test_super_admin_can_see_all_users_including_super_admin(): void
    {
        $superAdminRole = Role::where('display_name', 'Super Admin')->first();
        $adminRole = Role::where('display_name', 'Admin')->first();

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'chijindu.nwokeohuru@gmail.com',
            'password' => bcrypt('chibuike4u@EI'),
            'role' => 'Super Admin',
            'role_id' => $superAdminRole->id,
        ]);

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'admin@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('users.index', ['slug' => $superAdmin->slug]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Index')
            ->has('users', 2)
            ->where('users.0.email', fn ($email) => in_array($email, [$superAdmin->email, $admin->email]))
        );
    }

    public function test_non_super_admin_cannot_see_super_admin_on_users_page(): void
    {
        $superAdminRole = Role::where('display_name', 'Super Admin')->first();
        $adminRole = Role::where('display_name', 'Admin')->first();

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'chijindu.nwokeohuru@gmail.com',
            'password' => bcrypt('chibuike4u@EI'),
            'role' => 'Super Admin',
            'role_id' => $superAdminRole->id,
        ]);

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'admin@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('users.index', ['slug' => $admin->slug]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Index')
            ->has('users', 1)
            ->where('users.0.email', 'admin@elevateinteriors.space')
        );
    }

    public function test_non_super_admin_cannot_update_super_admin(): void
    {
        $superAdminRole = Role::where('display_name', 'Super Admin')->first();
        $adminRole = Role::where('display_name', 'Admin')->first();

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'chijindu.nwokeohuru@gmail.com',
            'password' => bcrypt('chibuike4u@EI'),
            'role' => 'Super Admin',
            'role_id' => $superAdminRole->id,
        ]);

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'admin@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($admin)
            ->put(route('users.update', ['slug' => $admin->slug, 'user' => $superAdmin->id]), [
                'name' => 'Hacked Admin',
                'email' => 'hacked@example.com',
                'role' => 'Admin',
            ]);

        $response->assertStatus(403);
    }

    public function test_non_super_admin_cannot_create_super_admin(): void
    {
        $adminRole = Role::where('display_name', 'Admin')->first();

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'admin@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('users.store', ['slug' => $admin->slug]), [
                'name' => 'Malicious Super Admin',
                'email' => 'malicious@example.com',
                'role' => 'Super Admin',
            ]);

        $response->assertStatus(403);
    }
}
