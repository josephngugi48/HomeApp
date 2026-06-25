<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // deposit, payment, refund, adjustment
            $table->decimal('amount', 12, 2);
            $table->string('ref');
            $table->timestamp('occurred_at');
            $table->json('meta')->nullable();
            $table->timestamps(); // only created_at is meaningful, but we keep updated_at for consistency
        });
    }

    public function down()
    {
        Schema::dropIfExists('wallet_transactions');
    }
};