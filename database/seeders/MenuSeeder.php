<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Status;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing menus
        Menu::truncate();

        $activeStatus = Status::where('slug', 'active')->first() ?? Status::create(['name' => 'Active', 'slug' => 'active', 'color' => 'green']);

        $menus = [
            [
                'title' => 'Dashboard',
                'icon' => 'LayoutDashboard',
                'route' => '/dashboard',
                'permission' => 'module dashboard',
                'order' => 1,
                'status_id' => $activeStatus->id,
            ],
            [
                'title' => 'Users',
                'icon' => 'Users',
                'route' => '/users',
                'permission' => 'module users',
                'order' => 2,
                'status_id' => $activeStatus->id,
            ],
            [
                'title' => 'Roles',
                'icon' => 'Shield',
                'route' => '/roles',
                'permission' => 'module roles',
                'order' => 3,
                'status_id' => $activeStatus->id,
            ],
            [
                'title' => 'System Settings',
                'icon' => 'Settings2',
                'route' => '/admin/settings/general',
                'permission' => 'module settings',
                'order' => 4,
                'status_id' => $activeStatus->id,
                'children' => [
                    [
                        'title' => 'General',
                        'icon' => 'Sliders',
                        'route' => '/admin/settings/general',
                        'permission' => 'view general settings',
                        'order' => 5,
                        'status_id' => $activeStatus->id,
                    ],
                    [
                        'title' => 'Email',
                        'icon' => 'Mail',
                        'route' => '/admin/settings/email',
                        'permission' => 'view email settings',
                        'order' => 6,
                        'status_id' => $activeStatus->id,
                    ],
                    [
                        'title' => 'SMS',
                        'icon' => 'Phone',
                        'route' => '/admin/settings/sms',
                        'permission' => 'view sms settings',
                        'order' => 7,
                        'status_id' => $activeStatus->id,
                    ],
                    [
                        'title' => 'WhatsApp',
                        'icon' => 'MessageCircle',
                        'route' => '/admin/settings/whatsapp',
                        'permission' => 'view whatsapp settings',
                        'order' => 8,
                        'status_id' => $activeStatus->id,
                    ],
                ]
            ],
            [
                'title' => 'Activity Log',
                'icon' => 'Activity',
                'route' => '/admin/activity-log',
                'permission' => 'module logs',
                'order' => 9,
                'status_id' => $activeStatus->id,
            ],
        ];

        foreach ($menus as $menuData) {
            $children = $menuData['children'] ?? null;
            unset($menuData['children']);
            
            $menu = Menu::create($menuData);

            if ($children) {
                foreach ($children as $childData) {
                    $childData['parent_id'] = $menu->id;
                    Menu::create($childData);
                }
            }
        }
    }
}
