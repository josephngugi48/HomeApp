<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('number');
            $table->foreignId('lease_id')->constrained()->restrictOnDelete();
            $table->foreignId('tenant_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total', 12, 2);
            $table->decimal('balance', 12, 2);
            $table->string('status')->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'number']);
            $table->index(['company_id', 'status']);
            $table->index(['due_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
    }
};