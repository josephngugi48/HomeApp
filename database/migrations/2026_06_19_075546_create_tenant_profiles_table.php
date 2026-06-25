<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tenant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('national_id')->nullable();
            $table->string('kra_pin')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('next_of_kin_name')->nullable();
            $table->string('next_of_kin_phone')->nullable();
            $table->string('next_of_kin_relationship')->nullable();
            $table->text('next_of_kin_address')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tenant_profiles');
    }
};