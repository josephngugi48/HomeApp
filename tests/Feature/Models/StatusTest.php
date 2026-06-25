<?php

use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a status can be created', function () {
    $status = Status::create([
        'name' => 'Active',
        'slug' => 'active',
        'color' => '#00FF00',
    ]);

    expect($status->name)->toBe('Active')
        ->and($status->slug)->toBe('active')
        ->and($status->color)->toBe('#00FF00');

    $this->assertDatabaseHas('statuses', [
        'name' => 'Active',
        'slug' => 'active',
    ]);
});

test('a status has many users', function () {
    $status = Status::create([
        'name' => 'Active',
        'slug' => 'active',
        'color' => '#00FF00',
    ]);

    $user = User::factory()->create([
        'status_id' => $status->id,
    ]);

    expect($status->users->first()->id)->toBe($user->id);
    expect($status->users)->toHaveCount(1);
});
