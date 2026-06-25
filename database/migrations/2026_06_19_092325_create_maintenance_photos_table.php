<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('maintenance_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_request_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('kind')->nullable(); // before, after
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('maintenance_photos');
    }
};