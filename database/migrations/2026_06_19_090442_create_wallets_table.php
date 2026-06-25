<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('balance', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'tenant_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('wallets');
    }
};