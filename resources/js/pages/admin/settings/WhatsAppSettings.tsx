import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PasswordInput } from './PasswordInput';

interface WhatsAppSettingsProps {
    settings: {
        provider?: string;
        api_key?: string;
        api_secret?: string;
        sender_number?: string;
        is_enabled?: boolean;
    };
    onSuccess: (message: string) => void;
}

export function WhatsAppSettings({ settings, onSuccess }: WhatsAppSettingsProps) {
    const form = useForm({
        provider: settings.provider || 'beem',
        api_key: '', // Sensitive
        api_secret: '', // Sensitive
        sender_number: settings.sender_number || '',
        is_enabled: settings.is_enabled || false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings/whatsapp', {
            preserveScroll: true,
            onSuccess: () => onSuccess('WhatsApp settings saved!'),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Settings</CardTitle>
                    <CardDescription>
                        Integrate WhatsApp messaging for real-time customer communication
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_enabled">Enable WhatsApp Service</Label>
                            <p className="text-sm text-muted-foreground">
                                Turn on/off all outgoing WhatsApp messages
                            </p>
                        </div>
                        <Switch
                            id="is_enabled"
                            checked={form.data.is_enabled}
                            onCheckedChange={(checked) => form.setData('is_enabled', checked)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider">WhatsApp Provider</Label>
                            <Select
                                value={form.data.provider}
                                onValueChange={(value) => form.setData('provider', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beem">Beem Solutions</SelectItem>
                                    <SelectItem value="twilio">Twilio</SelectItem>
                                    <SelectItem value="meta">Meta Graph API</SelectItem>
                                    <SelectItem value="wati">WATI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sender_number">Sender Number / ID</Label>
                            <Input
                                id="sender_number"
                                value={form.data.sender_number}
                                onChange={(e) => form.setData('sender_number', e.target.value)}
                                placeholder="+255..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="api_key">API Key</Label>
                            <PasswordInput
                                id="api_key"
                                value={form.data.api_key}
                                onChange={(e) => form.setData('api_key', e.target.value)}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_secret">API Secret / Auth Token</Label>
                            <PasswordInput
                                id="api_secret"
                                value={form.data.api_secret}
                                onChange={(e) => form.setData('api_secret', e.target.value)}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Save WhatsApp Settings'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
