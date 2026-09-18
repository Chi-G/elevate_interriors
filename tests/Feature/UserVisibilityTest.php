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
            'email' => 'elevateinteriors.space@gmail.com',
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
            'email' => 'elevateinteriors.space@gmail.com',
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
            ->where('users.0.email', 'elevateinteriors.space@gmail.com')
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
            'email' => 'elevateinteriors.space@gmail.com',
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
            'email' => 'elevateinteriors.space@gmail.com',
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

    public function test_dashboard_stock_health_does_not_count_super_admin(): void
    {
        $superAdminRole = Role::where('display_name', 'Super Admin')->first();
        $adminRole = Role::where('display_name', 'Admin')->first();
        $managerRole = Role::where('display_name', 'Manager')->first();

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'chijindu.nwokeohuru@gmail.com',
            'password' => bcrypt('chibuike4u@EI'),
            'role' => 'Super Admin',
            'role_id' => $superAdminRole->id,
        ]);

        User::create([
            'name' => 'General Admin',
            'email' => 'elevateinteriors.space@gmail.com',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        User::create([
            'name' => 'Manager',
            'email' => 'drmanley@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Manager',
            'role_id' => $managerRole->id,
        ]);

        // When Super Admin views the dashboard
        $response = $this->actingAs($superAdmin)
            ->get(route('dashboard.index', ['slug' => $superAdmin->slug]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.total_users', 2)
        );
    }

    public function test_manager_and_admin_can_view_permissions_page_without_super_admin_role(): void
    {
        $adminRole = Role::where('display_name', 'Admin')->first();
        $managerRole = Role::where('display_name', 'Manager')->first();

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'elevateinteriors.space@gmail.com',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $manager = User::create([
            'name' => 'Manager',
            'email' => 'drmanley@elevateinteriors.space',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Manager',
            'role_id' => $managerRole->id,
        ]);

        // Manager can view permissions
        $managerResponse = $this->actingAs($manager)
            ->get(route('permissions.index', ['slug' => $manager->slug]));

        $managerResponse->assertOk();
        $managerResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Permissions/Index')
            ->where('roles', fn ($roles) => ! collect($roles)->pluck('name')->contains('super-admin'))
        );

        // Admin can view permissions
        $adminResponse = $this->actingAs($admin)
            ->get(route('permissions.index', ['slug' => $admin->slug]));

        $adminResponse->assertOk();
        $adminResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Permissions/Index')
            ->where('roles', fn ($roles) => ! collect($roles)->pluck('name')->contains('super-admin'))
        );
    }

    public function test_cannot_update_super_admin_role_permissions(): void
    {
        $adminRole = Role::where('display_name', 'Admin')->first();
        $superAdminRole = Role::where('display_name', 'Super Admin')->first();
        $permission = Permission::first();

        $admin = User::create([
            'name' => 'General Admin',
            'email' => 'elevateinteriors.space@gmail.com',
            'password' => bcrypt('admin@elevateinteriors$space'),
            'role' => 'Admin',
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('permissions.update', ['slug' => $admin->slug]), [
                'role_id' => $superAdminRole->id,
                'permission_id' => $permission->id,
                'value' => false,
            ]);

        $response->assertStatus(403);
    }
}
