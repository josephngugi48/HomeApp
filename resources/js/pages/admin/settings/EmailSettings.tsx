import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordInput } from './PasswordInput';

interface EmailSettingsProps {
    settings: {
        mailer?: string;
        host?: string;
        port?: string;
        username?: string;
        password?: string;
        from_address?: string;
        from_name?: string;
        encryption?: string;
    };
    onSuccess: (message: string) => void;
}

export function EmailSettings({ settings, onSuccess }: EmailSettingsProps) {
    const form = useForm({
        mailer: settings.mailer || 'smtp',
        host: settings.host || '',
        port: settings.port || '587',
        username: settings.username || '',
        password: '', // Always empty for security, only updated if not empty
        from_address: settings.from_address || '',
        from_name: settings.from_name || '',
        encryption: settings.encryption || 'tls',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings/email', {
            preserveScroll: true,
            onSuccess: () => onSuccess('Email settings saved!'),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                        Configure SMTP and mail delivery settings for application notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mailer">Mail Mailer</Label>
                            <Select
                                value={form.data.mailer}
                                onValueChange={(value) => form.setData('mailer', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mailer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smtp">SMTP</SelectItem>
                                    <SelectItem value="mailgun">Mailgun</SelectItem>
                                    <SelectItem value="postmark">Postmark</SelectItem>
                                    <SelectItem value="ses">Amazon SES</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="encryption">Encryption</Label>
                            <Select
                                value={form.data.encryption}
                                onValueChange={(value) => form.setData('encryption', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select encryption" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tls">TLS</SelectItem>
                                    <SelectItem value="ssl">SSL</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="host">SMTP Host</Label>
                            <Input
                                id="host"
                                value={form.data.host}
                                onChange={(e) => form.setData('host', e.target.value)}
                                placeholder="smtp.mailtrap.io"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">SMTP Port</Label>
                            <Input
                                id="port"
                                value={form.data.port}
                                onChange={(e) => form.setData('port', e.target.value)}
                                placeholder="587"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">SMTP Username</Label>
                            <Input
                                id="username"
                                value={form.data.username}
                                onChange={(e) => form.setData('username', e.target.value)}
                                placeholder="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">SMTP Password</Label>
                            <PasswordInput
                                id="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                    </div>

                    <hr className="my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from_address">From Email Address</Label>
                            <Input
                                id="from_address"
                                type="email"
                                value={form.data.from_address}
                                onChange={(e) => form.setData('from_address', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                                id="from_name"
                                value={form.data.from_name}
                                onChange={(e) => form.setData('from_name', e.target.value)}
                                placeholder="My App Support"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Save Email Settings'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
