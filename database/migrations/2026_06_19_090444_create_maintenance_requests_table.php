<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('number')->unique();
            $table->foreignId('lease_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->string('category');
            $table->string('priority');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('raised_at');
            $table->string('status')->default('open');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('maintenance_requests');
    }
};