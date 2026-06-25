<?php

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it can set and get a setting', function () {
    Setting::set('test_key', 'test_value');
    
    expect(Setting::get('test_key'))->toBe('test_value');
    
    $this->assertDatabaseHas('settings', [
        'key' => 'test_key',
        'value' => 'test_value'
    ]);
});

test('it returns default value if setting does not exist', function () {
    expect(Setting::get('non_existent', 'default'))->toBe('default');
});

test('it caches the setting value', function () {
    Setting::set('cached_key', 'initial_value');
    
    // Prime the cache with a fake object
    $fakeSetting = new Setting(['key' => 'cached_key', 'value' => 'fake_value']);
    Cache::forever('setting.cached_key', $fakeSetting);
    
    // Should return 'fake_value' from cache, not 'initial_value' from DB
    expect(Setting::get('cached_key'))->toBe('fake_value');
});

test('it clears cache when setting is updated', function () {
    Setting::set('update_key', 'original');
    Setting::get('update_key'); // Cache it
    
    expect(Cache::has('setting.update_key'))->toBeTrue();
    
    Setting::set('update_key', 'updated');
    
    expect(Cache::has('setting.update_key'))->toBeFalse();
    expect(Setting::get('update_key'))->toBe('updated');
});
