<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Notifications\StaffWelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request, $slug = null)
    {
        $this->authorize('users.view');

        $query = User::orderBy('name');

        // Only Super Admins can see other Super Admins
        if (! $request->user()->isSuperAdmin()) {
            $query->where('role', '!=', 'Super Admin');
        }

        $users = $query->get();

        return Inertia::render('Users/Index', ['users' => $users]);
    }

    public function show(User $user, $slug = null)
    {
        return redirect()->route('users.index', ['slug' => auth()->user()->slug]);
    }

    public function store(Request $request, $slug = null)
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'role' => ['required', Rule::in(['Super Admin', 'Admin', 'Manager', 'Staff'])],
        ]);

        $role = Role::where('display_name', $validated['role'])->first();
        $validated['role_id'] = $role?->id;

        $temporaryPassword = 'password123';
        $validated['password'] = Hash::make($temporaryPassword);

        $user = User::create($validated);

        $user->notify(new StaffWelcomeNotification($temporaryPassword));

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user, $slug = null)
    {
        $this->authorize('users.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role' => ['required', Rule::in(['Super Admin', 'Admin', 'Manager', 'Staff'])],
        ]);

        $role = Role::where('display_name', $validated['role'])->first();
        $validated['role_id'] = $role?->id;

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user, $slug = null)
    {
        $this->authorize('users.delete');

        if ($user->id === $request->user()->id) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        if ($user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Cannot delete a Super Admin.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
