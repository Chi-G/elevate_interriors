<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    /**
     * Display the Role-Permission Matrix
     */
    public function index(Request $request, $slug = null)
    {
        if (! $request->user() || (! in_array($request->user()->role, ['Super Admin', 'Admin', 'Manager'], true) && ! $request->user()->hasPermission('users.permissions'))) {
            abort(403, 'Unauthorized access to permissions.');
        }

        // Fetch roles we want to manage (strictly exclude super-admin for safety)
        $roles = Role::whereNotIn('name', ['super-admin', 'Super Admin'])
            ->whereNotIn('display_name', ['super-admin', 'Super Admin'])
            ->get();

        // Fetch all permissions grouped by their module
        $permissionsByModule = Permission::all()->groupBy('module');

        // Get the current mapping
        $matrix = [];
        foreach ($roles as $role) {
            $matrix[$role->id] = $role->permissions()->pluck('permission_id')->toArray();
        }

        return Inertia::render('Admin/Permissions/Index', [
            'roles' => $roles,
            'permissionsByModule' => $permissionsByModule,
            'matrix' => $matrix,
        ]);
    }

    /**
     * Update the permissions for a specific role
     */
    public function update(Request $request, $slug = null)
    {
        if (! $request->user() || (! in_array($request->user()->role, ['Super Admin', 'Admin', 'Manager'], true) && ! $request->user()->hasPermission('users.permissions'))) {
            abort(403, 'Unauthorized access to update permissions.');
        }

        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_id' => 'required|exists:permissions,id',
            'value' => 'required|boolean',
        ]);

        $role = Role::findOrFail($request->role_id);

        if (in_array(strtolower($role->name), ['super-admin', 'super admin'], true) || in_array(strtolower($role->display_name), ['super-admin', 'super admin'], true)) {
            abort(403, 'Unauthorized modification of Super Admin role.');
        }

        if ($request->value) {
            $role->permissions()->attach($request->permission_id);
        } else {
            $role->permissions()->detach($request->permission_id);
        }

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}
