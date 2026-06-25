import AppLogoIcon from '@/components/app-logo-icon';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { site: settings } = usePage<SharedData>().props;
    const { home } = usePage<SharedData>().props as any; // Fallback for route helper if needed, but home() is imported
    const homeUrl = "/"; // home() usually returns "/"
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                {settings.app_logo ? (
                                    <img src={settings.app_logo} alt={settings.app_name} className="size-9 object-contain" />
                                ) : (
                                    <AppLogoIcon className="size-9 fill-current text-white dark:text-black" />
                                )}
                            </div>
                            <span className="sr-only">{settings.app_name}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
