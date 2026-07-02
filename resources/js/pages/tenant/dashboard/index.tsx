// resources/js/pages/tenant/dashboard/index.tsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Props {
    user: { name: string };
    totalBalance: number;
    nextDue: string | null;
    currentInvoiceAmount: number;
    outstanding: number;
    walletBalance: number;
    accountName: string;
    recentInvoices: Array<{ id: number; date: string; amount: number; status: string }>;
}

export default function TenantDashboard({
    user,
    totalBalance,
    nextDue,
    currentInvoiceAmount,
    outstanding,
    walletBalance,
    accountName,
    recentInvoices,
}: Props) {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const formatKES = (n: number) =>
        new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Greeting & Total Balance */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Welcome back to your portal</p>
                        <h1 className="text-2xl font-bold">{greeting}, {user.name}</h1>
                        <p className="text-sm text-muted-foreground">Here's a snapshot of your account today.</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 min-w-[200px] text-center">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Balance • All Accounts</p>
                        <p className="text-3xl font-bold">{formatKES(totalBalance)}</p>
                        {nextDue && <p className="text-xs text-muted-foreground mt-1">Due {nextDue}</p>}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                        { label: 'Pay Now', href: '/payments/create' },
                        { label: 'Current Invoice', href: '/invoices/current' },
                        { label: 'Account Statement', href: '/statements' },
                        { label: 'Top Up Wallet', href: '/wallet/topup' },
                        { label: 'Report an Issue', href: '/issues/create' },
                        { label: 'Vacating Request', href: '/notices/create' },
                    ].map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="flex flex-col items-center justify-center p-3 bg-card border rounded-xl hover:bg-accent transition text-center"
                        >
                            <span className="text-sm font-medium">{action.label}</span>
                        </Link>
                    ))}
                </div>

                {/* My Accounts & Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border rounded-xl p-4">
                        <h2 className="font-semibold text-lg">My Accounts</h2>
                        {accountName ? (
                            <p className="text-sm text-muted-foreground mt-1">{accountName}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">No active lease</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card border rounded-xl p-4">
                            <p className="text-xs uppercase text-muted-foreground">Amount Due</p>
                            <p className="text-xl font-bold">{formatKES(totalBalance)}</p>
                        </div>
                        <div className="bg-card border rounded-xl p-4">
                            <p className="text-xs uppercase text-muted-foreground">Current Invoice</p>
                            <p className="text-xl font-bold">{formatKES(currentInvoiceAmount)}</p>
                        </div>
                        <div className="bg-card border rounded-xl p-4">
                            <p className="text-xs uppercase text-muted-foreground">Outstanding</p>
                            <p className="text-xl font-bold">{formatKES(outstanding)}</p>
                        </div>
                        <div className="bg-card border rounded-xl p-4">
                            <p className="text-xs uppercase text-muted-foreground">Wallet Balance</p>
                            <p className="text-xl font-bold">{formatKES(walletBalance)}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-card border rounded-xl p-4">
                    <h2 className="font-semibold text-lg mb-3">Recent Invoices</h2>
                    <div className="space-y-2">
                        {recentInvoices.length > 0 ? (
                            recentInvoices.map((inv) => (
                                <div key={inv.id} className="flex justify-between items-center border-b last:border-0 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{inv.date}</p>
                                        <p className="text-xs text-muted-foreground">{inv.status}</p>
                                    </div>
                                    <p className="text-sm font-semibold">{formatKES(inv.amount)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No invoices found.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}