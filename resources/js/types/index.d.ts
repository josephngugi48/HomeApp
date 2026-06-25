import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    menu: MenuItem[];
    site: {
        app_name: string;
        app_logo: string | null;
        primary_color: string;
        secondary_color: string;
        accent_color: string;
        footer_text: string | null;
        is_mfa_enabled: boolean;
    };

    [key: string]: unknown;
}
export interface MenuItem {
    title: string;
    url: string;
    icon?: string;
    children?: MenuItem[];
};
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface DataTableResponse<T> {
    current_page: number
    data: T[]
    first_page_url: string
    from: number | null
    last_page: number
    last_page_url: string
    links: {
        url: string | null
        label: string
        page: number | null
        active: boolean
    }[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number | null
    total: number
}

export interface SystemSettings {
    // General
    app_name?: string | null;
    app_logo?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    footer_text?: string | null;
    is_mfa_enabled?: boolean;
    // Email
    mail_mailer?: string | null;
    mail_host?: string | null;
    mail_port?: string | null;
    mail_username?: string | null;
    mail_password?: string | null;
    mail_from_address?: string | null;
    mail_from_name?: string | null;
    mail_encryption?: string | null;
    // SMS
    sms_provider?: string | null;
    sms_api_key?: string | null;
    sms_api_username?: string | null;
    sms_sender_id?: string | null;
    sms_enabled?: string | null;
    // WhatsApp
    whatsapp_provider?: string | null;
    whatsapp_api_key?: string | null;
    whatsapp_api_secret?: string | null;
    whatsapp_sender_number?: string | null;
    whatsapp_enabled?: string | null;
}
export interface Activity {
    id: number;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_id: number | null;
    causer?: User;
    subject?: any;
    properties: any;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: number;
    uuid: string;
    name: string;
    code: string;
    status: "Active" | "Inactive";
    apartments_count?: number;
    units_count?: number;
    created_at: string;
    can?: { update?: boolean; delete?: boolean };
}
