<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('apartments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->foreignId('location_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('code');
            $table->foreignId('landlord_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('caretaker_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('apartments');
    }
};