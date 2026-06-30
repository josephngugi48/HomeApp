<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        
        Schema::create('broadcast_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('broadcast_id')->constrained()->cascadeOnDelete();

            // Source: either a real tenant (user_id set, ad_hoc_* null)
            // or an ad-hoc uploaded contact (user_id null, ad_hoc_* set).
            // Never both, never neither — enforced in the model/service,
            // not the DB, since Laravel lacks a clean native XOR constraint
            // across engines.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ad_hoc_name')->nullable();
            $table->string('ad_hoc_email')->nullable();
            $table->string('ad_hoc_phone')->nullable();

            // Resolved contact details at send time — captured here
            // rather than always joining back to users/tenant_profiles,
            // so a broadcast's recipient list is a frozen historical
            // record even if the tenant's email changes later.
            $table->string('resolved_name');
            $table->string('resolved_email')->nullable();
            $table->string('resolved_phone')->nullable();

            $table->timestamps();

            // The actual per-channel-per-recipient delivery facts live
            // here, not as separate rows — a recipient on a 3-channel
            // broadcast has 3 statuses, not 3 broadcast_recipients rows.
            $table->json('channel_statuses')->nullable();
            // shape: {"sms": {"status": "delivered", "provider_ref": "...", "sent_at": "...", "delivered_at": "...", "error": null}, "email": {...}, "whatsapp": {...}}
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcast_recipients');
    }
};
