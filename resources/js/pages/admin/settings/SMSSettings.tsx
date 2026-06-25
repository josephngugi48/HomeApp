import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PasswordInput } from './PasswordInput';

interface SMSSettingsProps {
    settings: {
        provider?: string;
        api_key?: string;
        api_username?: string;
        sender_id?: string;
        is_enabled?: boolean;
    };
    onSuccess: (message: string) => void;
}

export function SMSSettings({ settings, onSuccess }: SMSSettingsProps) {
    const form = useForm({
        provider: settings.provider || 'africastalking',
        api_key: '', // Sensitive, only updated if not empty
        api_username: settings.api_username || '',
        sender_id: settings.sender_id || '',
        is_enabled: settings.is_enabled || false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings/sms', {
            preserveScroll: true,
            onSuccess: () => onSuccess('SMS settings saved!'),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>SMS Settings</CardTitle>
                    <CardDescription>
                        Configure SMS gateways for sending text notifications and alerts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_enabled">Enable SMS Service</Label>
                            <p className="text-sm text-muted-foreground">
                                Turn on/off all outgoing SMS notifications
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
                            <Label htmlFor="provider">SMS Provider</Label>
                            <Select
                                value={form.data.provider}
                                onValueChange={(value) => form.setData('provider', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="africastalking">Africa's Talking</SelectItem>
                                    <SelectItem value="twilio">Twilio</SelectItem>
                                    <SelectItem value="beem">Beem Solutions</SelectItem>
                                    <SelectItem value="infobip">Infobip</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sender_id">Sender ID / From Number</Label>
                            <Input
                                id="sender_id"
                                value={form.data.sender_id}
                                onChange={(e) => form.setData('sender_id', e.target.value)}
                                placeholder="APP_SMS"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="api_username">API Username / Account SID</Label>
                            <Input
                                id="api_username"
                                value={form.data.api_username}
                                onChange={(e) => form.setData('api_username', e.target.value)}
                                placeholder="Enter username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_key">API Key / Auth Token</Label>
                            <PasswordInput
                                id="api_key"
                                value={form.data.api_key}
                                onChange={(e) => form.setData('api_key', e.target.value)}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Save SMS Settings'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
