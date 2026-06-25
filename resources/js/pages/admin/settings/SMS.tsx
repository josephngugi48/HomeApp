import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem, SystemSettings } from '@/types';
import Heading from '@/components/heading';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { SMSSettings } from './SMSSettings';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/admin/settings/general',
    },
    {
        title: 'SMS',
        href: '/admin/settings/sms',
    },
];

export default function SMSSettingsPage({ settings }: { settings: SystemSettings }) {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings - SMS" />

            <div className="px-4 py-6">
                <Heading
                    title="SMS Settings"
                    description="Configure SMS gateways for sending text notifications and alerts"
                />

                {/* Success Toast */}
                {successMessage && (
                    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </div>
                )}

                <div className="mt-6 max-w-3xl">
                    <SMSSettings settings={settings as any} onSuccess={handleSuccess} />
                </div>
            </div>
        </AppLayout>
    );
}
