<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::findOrCreate('module users');
        Permission::findOrCreate('view users');
        Permission::findOrCreate('edit users');
        Permission::findOrCreate('delete users');
        Permission::findOrCreate('create users');

        Permission::findOrCreate('module roles');
        Permission::findOrCreate('view roles');
        Permission::findOrCreate('edit roles');
        Permission::findOrCreate('delete roles');
        Permission::findOrCreate('create roles');

        Permission::findOrCreate('module dashboard');

        Permission::findOrCreate('module settings');

        Permission::findOrCreate('module logs');
        Permission::findOrCreate('view logs');

        Permission::findOrCreate('view general settings');
        Permission::findOrCreate('view email settings');
        Permission::findOrCreate('view sms settings');
        Permission::findOrCreate('view whatsapp settings');

        Permission::findOrCreate('edit general settings');
        Permission::findOrCreate('edit email settings');
        Permission::findOrCreate('edit sms settings');
        Permission::findOrCreate('edit whatsapp settings');


        // Create roles and assign existing permissions
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions(['view users', 'edit users']);

        $user = Role::firstOrCreate(['name' => 'user']);

    }
}
