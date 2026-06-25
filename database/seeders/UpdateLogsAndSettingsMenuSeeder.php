<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Status;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UpdateLogsAndSettingsMenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure permissions exist
        Permission::findOrCreate('module logs');
        Permission::findOrCreate('view logs');
        
        // 2. Assign to admin role
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo(['module logs', 'view logs']);
        }

        $activeStatus = Status::where('slug', 'active')->first();
        if (!$activeStatus) {
            $activeStatus = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => 'green']);
        }

        // 3. Update Activity Log Menu
        Menu::updateOrCreate(
            ['route' => '/admin/activity-log'],
            [
                'title' => 'Activity Log',
                'icon' => 'Activity',
                'permission' => 'module logs',
                'order' => 9,
                'status_id' => $activeStatus->id,
            ]
        );

        // 4. Ensure System Settings Children are present
        $settingsMenu = Menu::where('title', 'System Settings')->first();
        if ($settingsMenu) {
            $children = [
                [
                    'title' => 'General',
                    'icon' => 'Sliders',
                    'route' => '/admin/settings/general',
                    'permission' => 'module settings',
                    'order' => 5,
                    'status_id' => $activeStatus->id,
                ],
                [
                    'title' => 'Email',
                    'icon' => 'Mail',
                    'route' => '/admin/settings/email',
                    'permission' => 'module settings',
                    'order' => 6,
                    'status_id' => $activeStatus->id,
                ],
                [
                    'title' => 'SMS',
                    'icon' => 'Phone',
                    'route' => '/admin/settings/sms',
                    'permission' => 'module settings',
                    'order' => 7,
                    'status_id' => $activeStatus->id,
                ],
                [
                    'title' => 'WhatsApp',
                    'icon' => 'MessageCircle',
                    'route' => '/admin/settings/whatsapp',
                    'permission' => 'module settings',
                    'order' => 8,
                    'status_id' => $activeStatus->id,
                ],
            ];

            foreach ($children as $childData) {
                $childData['parent_id'] = $settingsMenu->id;
                Menu::updateOrCreate(
                    ['route' => $childData['route'], 'parent_id' => $settingsMenu->id],
                    $childData
                );
            }
        }
    }
}
