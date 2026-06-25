/**
 * Utility to convert hex color to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse r, g, b
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Format HSL object to Tailwind-compatible string: "h s% l%"
 */
export function hslToString(hsl: { h: number; s: number; l: number }): string {
    return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
}

/**
 * Check if a color is light or dark to determine foreground color
 */
export function getContrastColor(hex: string): string {
    const hsl = hexToHsl(hex);
    return hsl.l > 60 ? 'hsl(0 0% 0%)' : 'hsl(0 0% 100%)';
}

/**
 * Derive theme variables from primary, secondary, and optional accent colors
 */
export function deriveTheme(primaryHex: string, secondaryHex: string, isDark: boolean, accentHex?: string | null) {
    const primaryHsl = hexToHsl(primaryHex);
    const secondaryHsl = hexToHsl(secondaryHex);
    
    // Use accentHex if provided, otherwise derive it
    const accentHsl = accentHex 
        ? hexToHsl(accentHex) 
        : (isDark 
            ? { ...primaryHsl, l: Math.max(15, primaryHsl.l - 20) } 
            : { ...primaryHsl, l: Math.min(95, primaryHsl.l + 40) });

    const accentContrast = accentHex 
        ? getContrastColor(accentHex) 
        : (isDark ? '#ffffff' : '#000000');

    if (isDark) {
        const sidebarBase = { ...primaryHsl, s: 15, l: 7 };
        return {
            '--primary': hslToString(primaryHsl),
            '--primary-foreground': getContrastColor(primaryHex),
            '--secondary': hslToString(secondaryHsl),
            '--secondary-foreground': getContrastColor(secondaryHex),
            '--accent': hslToString(accentHsl),
            '--accent-foreground': accentContrast,
            '--muted': hslToString({ ...primaryHsl, s: 10, l: 15 }),
            '--ring': hslToString(primaryHsl),
            '--border': hslToString({ ...primaryHsl, s: 15, l: 20 }),
            
            // Sidebar
            '--sidebar': hslToString(sidebarBase),
            '--sidebar-foreground': hslToString({ ...primaryHsl, s: 10, l: 90 }),
            '--sidebar-primary': hslToString(primaryHsl),
            '--sidebar-primary-foreground': getContrastColor(primaryHex),
            '--sidebar-accent': hslToString(accentHsl),
            '--sidebar-accent-foreground': accentContrast,
            '--sidebar-border': hslToString({ ...primaryHsl, s: 15, l: 15 }),
            '--sidebar-ring': hslToString(primaryHsl),
        };
    }

    const sidebarBase = { ...primaryHsl, s: 15, l: 98 };
    return {
        '--primary': hslToString(primaryHsl),
        '--primary-foreground': getContrastColor(primaryHex),
        '--secondary': hslToString(secondaryHsl),
        '--secondary-foreground': getContrastColor(secondaryHex),
        '--accent': hslToString(accentHsl),
        '--accent-foreground': accentContrast,
        '--muted': hslToString({ ...primaryHsl, s: 10, l: 96 }),
        '--ring': hslToString(primaryHsl),
        '--border': hslToString({ ...primaryHsl, s: 15, l: 90 }),

        // Sidebar
        '--sidebar': hslToString(sidebarBase),
        '--sidebar-foreground': hslToString({ ...primaryHsl, s: 20, l: 20 }),
        '--sidebar-primary': hslToString(primaryHsl),
        '--sidebar-primary-foreground': getContrastColor(primaryHex),
        '--sidebar-accent': hslToString({ ...accentHsl, l: Math.min(95, accentHsl.l + 15) }), // More visible golden tint
        '--sidebar-accent-foreground': hslToString({ ...primaryHsl, s: 40, l: 15 }), // Clear contrast
        '--sidebar-border': hslToString({ ...primaryHsl, s: 15, l: 92 }),
        '--sidebar-ring': hslToString(primaryHsl),
    };
}
