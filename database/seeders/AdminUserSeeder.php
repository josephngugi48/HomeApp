<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('⚙️ Creating Admin User');

        if (app()->runningUnitTests() || app()->environment('testing') || !is_resource(STDIN) || stream_isatty(STDIN) === false) {
            $name = 'Admin';
            $email = 'admin@example.com';
            $password = 'password';
        } else {
            $name = $this->command->ask('Enter admin name', 'Admin');
            $email = $this->command->ask('Enter admin email', 'admin@example.com');
            $password = $this->command->secret('Enter admin password (input hidden)');
            $confirmPassword = $this->command->secret('Confirm password');

            while ($password !== $confirmPassword) {
                $this->command->error('❌ Passwords do not match. Please try again.');
                $password = $this->command->secret('Enter admin password (input hidden)');
                $confirmPassword = $this->command->secret('Confirm password');
            }
        }

        // Check if user already exists
        $user = User::where('email', $email)->first();

        if ($user) {
            $this->command->warn("⚠️ User with email {$email} already exists.");
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'status_id' => Status::where('slug', 'active')->first()->id,
            ]);

            $this->command->info("✅ Admin user created successfully!");
        }

        // Assign admin role
        $role = Role::where('name', 'admin')->first();

        if (!$role) {
            $this->command->warn('⚠️ Admin role not found. Creating one...');
            $role = Role::create(['name' => 'admin']);
        }

        $user->assignRole($role);

        $this->command->info("🎩 Admin role assigned to {$user->email}");
    }
}
