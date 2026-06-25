<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lease_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->string('type');
            $table->timestamp('submitted_at');
            $table->date('effective_at');
            $table->string('status')->default('open');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notices');
    }
};