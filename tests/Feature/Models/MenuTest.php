<?php

use App\Models\Menu;
use App\Models\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a menu item can be created', function () {
    $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);

    $menu = Menu::create([
        'title' => 'Dashboard',
        'icon' => 'home',
        'route' => 'dashboard',
        'order' => 1,
        'status_id' => $status->id,
    ]);

    expect($menu->title)->toBe('Dashboard')
        ->and($menu->route)->toBe('dashboard')
        ->and($menu->order)->toBe(1);

    $this->assertDatabaseHas('menus', [
        'title' => 'Dashboard',
        'route' => 'dashboard',
    ]);
});

test('a menu item can have children and a parent', function () {
    $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);

    $parentMenu = Menu::create([
        'title' => 'Settings',
        'route' => 'settings',
        'order' => 2,
        'status_id' => $status->id,
    ]);

    $childMenu = Menu::create([
        'title' => 'System Settings',
        'route' => 'settings.system',
        'parent_id' => $parentMenu->id,
        'order' => 1,
        'status_id' => $status->id,
    ]);

    expect($parentMenu->children->first()->id)->toBe($childMenu->id);
    expect($childMenu->parent->id)->toBe($parentMenu->id);
    expect($parentMenu->children)->toHaveCount(1);
});

test('a menu item belongs to a status', function () {
    $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);

    $menu = Menu::create([
        'title' => 'Dashboard',
        'route' => 'dashboard',
        'order' => 1,
        'status_id' => $status->id,
    ]);

    expect($menu->status->id)->toBe($status->id);
});
