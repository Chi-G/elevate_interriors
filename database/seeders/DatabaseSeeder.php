<?php

namespace Database\Seeders;

use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Super Admin
        User::updateOrCreate(
            ['email' => 'chijindu.nwokeohuru@gmail.com'],
            [
                'name' => 'Super Admin',
                'role' => 'Super Admin',
                'password' => bcrypt('chibuike4u@EI'),
            ]
        );

        // 2. General Admin
        User::updateOrCreate(
            ['email' => 'admin@elevateinteriors.space'],
            [
                'name' => 'General Admin',
                'role' => 'Admin',
                'password' => bcrypt('admin@elevateinteriors$space'),
            ]
        );

        // 3. Manager
        User::updateOrCreate(
            ['email' => 'drmally@elevateinteriors.space'],
            [
                'name' => 'Manager',
                'role' => 'Manager',
                'password' => bcrypt('admin@elevateinteriors$space'),
            ]
        );

        // Remove all other users from the database
        $retainedEmails = [
            'chijindu.nwokeohuru@gmail.com',
            'admin@elevateinteriors.space',
            'drmally@elevateinteriors.space',
            'drmanley@elevateinteriors.space',
        ];

        // Reassign any stock movements from orphaned users before deletion to prevent cascade loss
        $superAdmin = User::where('email', 'chijindu.nwokeohuru@gmail.com')->first();
        if ($superAdmin) {
            StockMovement::whereNotIn('user_id', User::whereIn('email', $retainedEmails)->pluck('id'))
                ->update(['user_id' => $superAdmin->id]);
        }

        User::whereNotIn('email', $retainedEmails)->delete();

        // 2. Catalog & Products
        $this->call([
            CatalogSeeder::class,
            ProductSeeder::class,
        ]);

        // 3. Permissions & Roles (and link all users)
        $this->call(AuthorizationSeeder::class);
    }
}
