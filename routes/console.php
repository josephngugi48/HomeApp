<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;


use Illuminate\Support\Facades\Schedule;
Schedule::command('event:send-reminders')->dailyAt('23:18');
