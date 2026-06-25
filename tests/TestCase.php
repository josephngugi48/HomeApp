<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use AllowDynamicProperties;

#[AllowDynamicProperties]
abstract class TestCase extends BaseTestCase
{
    /**
     * @var \App\Models\User
     */
    public $admin;
}
