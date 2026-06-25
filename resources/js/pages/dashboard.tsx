import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    Users,
    ShieldCheck,
    Settings,
    LayoutDashboard,
    ArrowRight,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const { auth, site: settings } = usePage<SharedData>().props;

    const quickLinks = [
        {
            title: 'User Management',
            description: 'Create, edit, and manage user accounts',
            icon: Users,
            href: '/users',
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-500/20',
        },
        {
            title: 'Roles & Permissions',
            description: 'Configure access control and security',
            icon: ShieldCheck,
            href: '/roles',
            gradient: 'from-violet-500 to-purple-500',
            shadow: 'shadow-violet-500/20',
        },
        {
            title: 'Settings',
            description: 'Manage your profile and preferences',
            icon: Settings,
            href: '/settings/profile',
            gradient: 'from-amber-500 to-orange-500',
            shadow: 'shadow-amber-500/20',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6 md:p-8">
                {/* Welcome Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-10 text-white">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <LayoutDashboard className="w-7 h-7 opacity-80" />
                            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Dashboard</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, {auth.user.name}
                        </h1>
                        <p className="text-white/70 text-lg max-w-xl">
                            Your {settings?.app_name} is ready. Start building something amazing.
                        </p>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-lg ${link.shadow} transition-all duration-300 hover:-translate-y-0.5`}
                            >
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${link.gradient} mb-4`}>
                                    <link.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-card-foreground mb-1">{link.title}</h3>
                                <p className="text-sm text-muted-foreground">{link.description}</p>
                                <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-card-foreground mb-3">What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>Authentication with email verification & 2FA</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>Role-based access control (Spatie Permissions)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>User management with CRUD operations</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>Dynamic sidebar menu system</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>Reusable data table components</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <span>Dark mode & appearance settings</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}