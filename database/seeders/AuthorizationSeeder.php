<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuthorizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define Permissions
        $permissionsList = [
            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'module' => 'Dashboard'],

            // Products
            ['name' => 'products.view', 'display_name' => 'View Products', 'module' => 'Products'],
            ['name' => 'products.create', 'display_name' => 'Create Products', 'module' => 'Products'],
            ['name' => 'products.edit', 'display_name' => 'Edit Products', 'module' => 'Products'],
            ['name' => 'products.delete', 'display_name' => 'Delete Products', 'module' => 'Products'],
            ['name' => 'products.export', 'display_name' => 'Export Products', 'module' => 'Products'],
            ['name' => 'products.barcode', 'display_name' => 'Generate Barcodes', 'module' => 'Products'],

            // Categories
            ['name' => 'categories.view', 'display_name' => 'View Categories', 'module' => 'Categories'],
            ['name' => 'categories.create', 'display_name' => 'Create Categories', 'module' => 'Categories'],
            ['name' => 'categories.edit', 'display_name' => 'Edit Categories', 'module' => 'Categories'],
            ['name' => 'categories.delete', 'display_name' => 'Delete Categories', 'module' => 'Categories'],

            // Suppliers
            ['name' => 'suppliers.view', 'display_name' => 'View Suppliers', 'module' => 'Suppliers'],
            ['name' => 'suppliers.create', 'display_name' => 'Create Suppliers', 'module' => 'Suppliers'],
            ['name' => 'suppliers.edit', 'display_name' => 'Edit Suppliers', 'module' => 'Suppliers'],
            ['name' => 'suppliers.delete', 'display_name' => 'Delete Suppliers', 'module' => 'Suppliers'],

            // Inventory
            ['name' => 'inventory.view', 'display_name' => 'View Inventory Logs', 'module' => 'Inventory'],
            ['name' => 'inventory.adjust', 'display_name' => 'Adjust Stock Levels', 'module' => 'Inventory'],
            ['name' => 'inventory.export', 'display_name' => 'Export Audit Logs', 'module' => 'Inventory'],

            // Security & Settings
            ['name' => 'users.view', 'display_name' => 'View System Users', 'module' => 'Security'],
            ['name' => 'users.create', 'display_name' => 'Create New Users', 'module' => 'Security'],
            ['name' => 'users.edit', 'display_name' => 'Edit User Details', 'module' => 'Security'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'module' => 'Security'],
            ['name' => 'users.permissions', 'display_name' => 'Manage Role Permissions', 'module' => 'Security'],
        ];

        foreach ($permissionsList as $perm) {
            Permission::updateOrCreate(['name' => $perm['name']], $perm);
        }

        // 2. Define Roles
        $rolesData = [
            ['name' => 'super-admin', 'display_name' => 'Super Admin'],
            ['name' => 'admin', 'display_name' => 'Admin'],
            ['name' => 'manager', 'display_name' => 'Manager'],
            ['name' => 'staff', 'display_name' => 'Staff'],
        ];

        $roles = [];
        foreach ($rolesData as $roleData) {
            $roles[$roleData['display_name']] = Role::updateOrCreate(['name' => $roleData['name']], $roleData);
        }

        // 3. Assign Permissions to Roles
        $allPermissions = Permission::all();

        // Super Admin & Admin get everything
        $roles['Super Admin']->permissions()->sync($allPermissions->pluck('id'));
        $roles['Admin']->permissions()->sync($allPermissions->pluck('id'));

        // Manager - Everything except deleting users
        $managerPerms = Permission::where('name', '!=', 'users.delete')->get();
        $roles['Manager']->permissions()->sync($managerPerms->pluck('id'));

        // Staff - View everything, create products, adjust inventory
        $staffPermNames = [
            'dashboard.view', 'products.view', 'products.create', 'categories.view',
            'suppliers.view', 'inventory.view', 'inventory.adjust',
        ];
        $staffPerms = Permission::whereIn('name', $staffPermNames)->get();
        $roles['Staff']->permissions()->sync($staffPerms->pluck('id'));

        // 4. Data Migration: Link existing users to Role IDs
        User::all()->each(function ($user) use ($roles) {
            if (isset($roles[$user->role])) {
                $user->update(['role_id' => $roles[$user->role]->id]);
            }
        });
    }
}
