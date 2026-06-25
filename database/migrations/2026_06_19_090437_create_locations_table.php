<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('code');
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('locations');
    }
};