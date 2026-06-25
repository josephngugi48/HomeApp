import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function TFAPrompt() {
    const handleEnable = () => {
        // Redirect to your MFA setup route (e.g. Google2FA page)
        router.visit('/settings/two-factor');
    };

    const handleSkip = () => {
        router.post('/mfa/skip');
    };


    return (
        <AuthLayout
            title="Enable Multi-Factor Authentication"
            description="For better security, we recommend enabling MFA on your account."
        >
            <Head title="Enable Multi-Factor Authentication" />
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleEnable}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Setup Multi-Factor Authentication
                </button>
                <button
                    onClick={handleSkip}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                    Skip for now
                </button>
            </div>
        </AuthLayout >
    );
}
