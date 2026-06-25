<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('ref');
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('method'); // mpesa, bank, cash, wallet
            $table->string('external_ref')->nullable();
            $table->timestamp('paid_at');
            $table->timestamp('reversed_at')->nullable();
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['company_id', 'ref']);
            $table->index(['company_id', 'method']);
            $table->index(['paid_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};