import { deriveTheme } from '@/lib/colors';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface ThemeConfig {
    primary_color: string;
    secondary_color: string;
    accent_color?: string;
}

export function useDynamicTheme(previewColors?: ThemeConfig) {
    const { site } = usePage<SharedData>().props;
    const settings = (site as any) || {};

    const primary = previewColors?.primary_color || settings.primary_color || '#006738';
    const secondary = previewColors?.secondary_color || settings.secondary_color || '#FDB913';
    const accent = previewColors?.accent_color || settings.accent_color || settings.secondary_color;

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initial check
        setIsDark(document.documentElement.classList.contains('dark'));

        // Observe class changes on html element
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const themeVariables = useMemo(() => {
        return deriveTheme(primary, secondary, isDark, accent);
    }, [primary, secondary, accent, isDark]);

    useEffect(() => {
        const root = document.documentElement;
        Object.entries(themeVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [themeVariables]);

    return themeVariables;
}
