import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { site: settings } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent">
                {settings.app_logo ? (
                    <img src={settings.app_logo} alt={settings.app_name} className="size-6 object-contain" />
                ) : (
                    <AppLogoIcon className="size-6 fill-current text-primary" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {settings.app_name}
                </span>
            </div>
        </>
    );
}
