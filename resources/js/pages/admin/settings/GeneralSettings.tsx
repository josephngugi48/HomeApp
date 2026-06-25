import { FormEvent, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check, Upload } from 'lucide-react';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

interface GeneralSettingsProps {
    settings: {
        app_name?: string;
        app_logo?: string;
        primary_color?: string;
        secondary_color?: string;
        accent_color?: string;
        footer_text?: string;
        is_mfa_enabled?: boolean;
    };
    onSuccess: (message: string) => void;
}

export function GeneralSettings({ settings, onSuccess }: GeneralSettingsProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.app_logo ? `/storage/${settings.app_logo}` : null
    );

    const form = useForm({
        app_name: settings.app_name || '',
        primary_color: settings.primary_color || '#006738',
        secondary_color: settings.secondary_color || '#FDB913',
        accent_color: settings.accent_color || '#FDB913',
        footer_text: settings.footer_text || '',
        is_mfa_enabled: settings.is_mfa_enabled || false,
    });

    const logoForm = useForm<{ logo: File | null }>({ logo: null });

    useDynamicTheme({
        primary_color: form.data.primary_color,
        secondary_color: form.data.secondary_color,
        accent_color: form.data.accent_color,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings/general', {
            preserveScroll: true,
            onSuccess: () => onSuccess('General settings saved!'),
        });
    };

    const handleLogoUpload = (e: FormEvent) => {
        e.preventDefault();
        if (!logoForm.data.logo) return;

        logoForm.post('/admin/settings/logo', {
            preserveScroll: true,
            onSuccess: () => onSuccess('Logo uploaded successfully!'),
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            logoForm.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Customize your application's basic information and appearance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="app_name">Application Name</Label>
                            <Input
                                id="app_name"
                                value={form.data.app_name}
                                onChange={(e) => form.setData('app_name', e.target.value)}
                                placeholder="My Portal"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primary_color">Primary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primary_color"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        value={form.data.primary_color}
                                        onChange={(e) => form.setData('primary_color', e.target.value)}
                                    />
                                    <Input
                                        value={form.data.primary_color}
                                        onChange={(e) => form.setData('primary_color', e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secondary_color">Secondary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secondary_color"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        value={form.data.secondary_color}
                                        onChange={(e) => form.setData('secondary_color', e.target.value)}
                                    />
                                    <Input
                                        value={form.data.secondary_color}
                                        onChange={(e) => form.setData('secondary_color', e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accent_color">Accent Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="accent_color"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        value={form.data.accent_color}
                                        onChange={(e) => form.setData('accent_color', e.target.value)}
                                    />
                                    <Input
                                        value={form.data.accent_color}
                                        onChange={(e) => form.setData('accent_color', e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="footer_text">Footer Text</Label>
                            <Textarea
                                id="footer_text"
                                value={form.data.footer_text}
                                onChange={(e) => form.setData('footer_text', e.target.value)}
                                placeholder="&copy; 2024 Your Company. All rights reserved."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-t pt-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="mfa_toggle" className="text-base">Multi-Factor Authentication (MFA)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enforce MFA for all users of the system.
                                </p>
                            </div>
                            <Switch
                                id="mfa_toggle"
                                checked={form.data.is_mfa_enabled}
                                onCheckedChange={(checked) => form.setData('is_mfa_enabled', checked)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save General Settings'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <Card>
                <CardHeader>
                    <CardTitle>Application Logo</CardTitle>
                    <CardDescription>
                        Upload a custom logo for your application's header and sidebar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                        {logoPreview ? (
                            <div className="relative group">
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="max-w-[200px] max-h-[80px] object-contain rounded-md border p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                    <p className="text-white text-xs font-medium">Preview</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-[200px] h-[80px] border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                                <p className="text-muted-foreground text-xs text-center px-4">No logo uploaded. Default icons will be used.</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Label
                                htmlFor="logo-upload"
                                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Logo
                            </Label>
                            <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            {logoForm.data.logo && (
                                <Button
                                    onClick={handleLogoUpload}
                                    disabled={logoForm.processing}
                                    className="gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Upload
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recommended: PNG or SVG with transparent background. Max size 2MB.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
