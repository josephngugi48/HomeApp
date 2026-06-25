<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TestingDatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for testing.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            StatusSeeder::class,
            MenuSeeder::class,
            // Exclude interactive AdminUserSeeder or use non-interactive version
            // AdminUserSeeder::class, 
        ]);
    }
}
