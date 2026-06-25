<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lease_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->string('category');
            $table->string('title');
            $table->text('body');
            $table->string('status')->default('open');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('raised_at');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('issues');
    }
};