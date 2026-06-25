<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mpesa_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->string('checkout_request_id')->unique();
            $table->string('merchant_request_id')->nullable();
            $table->string('phone');
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending');
            $table->json('result_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mpesa_requests');
    }
};