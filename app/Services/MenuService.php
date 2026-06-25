<?php

namespace App\Services;

use App\Models\Menu;

class MenuService
{
    public static function getUserMenu($user)
    {
        $menus = Menu::with('children')
            ->whereNull('parent_id')
            // ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return self::filterMenus($menus, $user);
    }

    protected static function filterMenus($menus, $user)
    {
        return $menus->filter(function ($menu) use ($user) {

            if (!$menu->permission || $user->can($menu->permission)) {

                $menu->children = self::filterMenus($menu->children, $user);
                return true;
            }
            return false;
        })->values();
    }
}
