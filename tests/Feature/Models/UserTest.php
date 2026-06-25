<?php

use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('a user can be created via factory', function () {
    $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);
    
    $user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'status_id' => $status->id,
    ]);

    expect($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com');

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

test('a user belongs to a status', function () {
    $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);
    
    $user = User::factory()->create([
        'status_id' => $status->id,
    ]);

    expect($user->status->id)->toBe($status->id)
        ->and($user->status->name)->toBe('Active');
});



test('two factor fields are fillable', function () {
    try {
        $status = Status::create(['name' => 'Active', 'slug' => 'active', 'color' => '#00FF00']);
        
        $user = User::factory()->create([
            'status_id' => $status->id,
            'intial_two_factor' => true,
            'two_factor_secret' => 'secret123',
        ]);
        expect($user->intial_two_factor)->toBeTruthy();
        
        // We can't access secret directly if it's hidden from serialization, but we can verify it's persisted
        $dbUser = User::find($user->id);
        expect($dbUser->intial_two_factor)->toBeTruthy();
    } catch (\Illuminate\Database\QueryException $e) {
        file_put_contents(base_path('debug_err.txt'), $e->getMessage());
        throw $e;
    }
});
