<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('rent', 12, 2);
            $table->decimal('service_charge', 12, 2)->default(0);
            $table->decimal('deposit', 12, 2)->default(0);
            $table->string('status')->default('active');
            $table->date('vacate_notice_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'tenant_id']);
            $table->index(['unit_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leases');
    }
};