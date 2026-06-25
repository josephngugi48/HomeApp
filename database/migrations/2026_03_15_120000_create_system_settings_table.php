<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('app_name')->nullable();
            $table->string('app_logo')->nullable();
            $table->string('primary_color')->default('#006738');
            $table->string('secondary_color')->default('#FDB913');
            $table->string('accent_color')->default('#FDB913');
            $table->string('footer_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};