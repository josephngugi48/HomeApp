<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tracks an upload event so the UI can show "this CSV was used
        // on broadcast X" and so re-using the same uploaded list across
        // multiple broadcasts is possible without re-uploading.
        Schema::create('broadcast_contact_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Estate AGM Attendees - May 2026"
            $table->string('original_filename')->nullable();
            $table->unsignedInteger('contact_count')->default(0);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('broadcast_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_list_id')->constrained('broadcast_contact_lists')->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broadcast_contacts');
        Schema::dropIfExists('broadcast_contact_lists');
    }
};
