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

export interface Apartment {
    id: number;
    uuid: string;
    name: string;
    code: string;
    status: "Active" | "Inactive";
    location_id: number;
    landlord_id: number | null;
    caretaker_id: number | null;
    location?: { id: number; name: string; code: string };
    landlord?: { id: number; name: string } | null;
    caretaker?: { id: number; name: string } | null;
    units_count?: number;
    created_at: string;
    can?: { update?: boolean; delete?: boolean };
}

export interface Unit {
    id: number;
    uuid: string;
    apartment_id: number;
    unit_no: string;
    floor: number | null;
    bedrooms: number | null;
    rent: string; // decimal cast returns string from Eloquent/JSON
    service_charge: string | null;
    status: "Occupied" | "Vacant" | "Reserved";
    apartment?: { id: number; name: string; code: string };
    created_at: string;
    can?: { update?: boolean; delete?: boolean };
}

export interface TenantProfile {
    id: number;
    user_id: number;
    national_id: string;
    kra_pin: string | null;
    date_of_birth: string | null;
    marital_status: string | null;
    photo_path: string | null;
    next_of_kin_name: string | null;
    next_of_kin_phone: string | null;
    next_of_kin_relationship: string | null;
    next_of_kin_address: string | null;
}

export interface Tenant {
    id: number;
    name: string;
    email: string;
    created_at: string;
    tenant_profile?: TenantProfile | null;
    can?: { update?: boolean; delete?: boolean };
}

export interface Lease {
    id: number;
    uuid: string;
    tenant_id: number;
    unit_id: number;
    start_date: string;
    end_date: string | null;
    rent: string;
    service_charge: string | null;
    deposit: string | null;
    status: "active" | "ended" | "terminated";
    vacate_notice_at: string | null;
    tenant?: { id: number; name: string; email: string };
    unit?: {
        id: number;
        unit_no: string;
        apartment_id: number;
        apartment?: { id: number; name: string };
        rent?: string;
        service_charge?: string | null;
    };
    created_at: string;
    can?: { update?: boolean; terminate?: boolean; delete?: boolean };
}

export interface InvoiceItem {
    id: number;
    type: "rent" | "service" | "water" | "electricity" | "penalty" | "misc";
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
}

export interface Invoice {
    id: number;
    uuid: string;
    number: string;
    lease_id: number;
    tenant_id: number;
    unit_id: number;
    issue_date: string;
    due_date: string;
    subtotal: string;
    total: string;
    balance: string;
    status: "draft" | "unpaid" | "partial" | "paid" | "overdue";
    tenant?: { id: number; name: string; email: string };
    unit?: { id: number; unit_no: string; apartment?: { id: number; name: string } };
    lease?: { id: number; start_date: string; end_date: string | null };
    items?: InvoiceItem[];
    created_at: string;
    can?: { update?: boolean; delete?: boolean };
}

export interface PaymentRecord {
    id: number;
    uuid: string;
    ref: string;
    tenant_id: number;
    invoice_id: number | null;
    amount: string;
    method: "mpesa" | "bank" | "cash" | "wallet" | "adjustment";
    external_ref: string | null;
    paid_at: string;
    reversed_at: string | null;
    tenant?: { id: number; name: string; email: string };
    invoice?: { id: number; number: string } | null;
    created_at: string;
    can?: { reverse?: boolean };
}

export interface PayableInvoice {
    id: number;
    number: string;
    tenant_id: number;
    unit_id: number;
    total: string;
    balance: string;
    tenant?: { id: number; name: string; email: string };
    unit?: { id: number; unit_no: string };
}

export interface WalletRecord {
    id: number;
    tenant_id: number;
    balance: string;
    tenant?: { id: number; name: string; email: string };
}

export interface WalletTransactionRecord {
    id: number;
    type: "deposit" | "payment" | "refund" | "adjustment";
    amount: string; // signed
    ref: string;
    occurred_at: string;
    meta: Record<string, any> | null;
}