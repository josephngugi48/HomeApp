<?php

namespace Database\Seeders;

use App\Models\Status;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => 'Active', 'slug' => 'active', 'color' => 'green'],
            ['name' => 'Inactive', 'slug' => 'inactive', 'color' => 'gray'],
            ['name' => 'Pending', 'slug' => 'pending', 'color' => 'yellow'],
            ['name' => 'Approved', 'slug' => 'approved', 'color' => 'blue'],
            ['name' => 'Rejected', 'slug' => 'rejected', 'color' => 'red'],
        ];

        foreach ($statuses as $status) {
            Status::firstOrCreate(['slug' => $status['slug']], $status);
        }



    }
}
