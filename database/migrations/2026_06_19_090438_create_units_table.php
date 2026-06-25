<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('apartment_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('unit_no');
            $table->smallInteger('floor')->default(0);
            $table->smallInteger('bedrooms')->default(0);
            $table->decimal('rent', 12, 2);
            $table->decimal('service_charge', 12, 2)->default(0);
            $table->string('status')->default('vacant');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['apartment_id', 'unit_no']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('units');
    }
};