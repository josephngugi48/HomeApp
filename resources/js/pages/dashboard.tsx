// resources/js/pages/dashboard.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, DashboardKpis, NeedsAttention } from '@/types';
import {
    Users, ShieldCheck, Building2, DoorOpen, Wallet, TrendingUp,
    AlertTriangle, Wrench, FileWarning, ArrowRight, MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

interface Props {
    kpis: DashboardKpis;
    needsAttention: NeedsAttention;
    can: { viewFinancial: boolean; viewOccupancy: boolean; viewMaintenance: boolean };
}

const severityStyle: Record<string, string> = {
    high: 'border-l-destructive bg-destructive/5',
    medium: 'border-l-amber-500 bg-amber-500/5',
};

const typeIcon: Record<string, any> = {
    overdue_invoice: TrendingUp,
    vacating_notice: FileWarning,
    maintenance: Wrench,
};

export default function Dashboard({ kpis, needsAttention, can }: Props) {
    const { auth, site: settings } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6 md:p-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-10 text-white">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {auth.user.name}</h1>
                        <p className="text-white/70 text-lg max-w-xl">
                            A live snapshot of properties, occupancy, finance, and operations across all locations.
                        </p>
                    </div>
                </div>

                {needsAttention.items.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Needs Attention
                            </h2>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                {needsAttention.totalOverdueInvoices > 0 && (
                                    <Badge variant="destructive">{needsAttention.totalOverdueInvoices} overdue</Badge>
                                )}
                                {needsAttention.totalPendingNotices > 0 && (
                                    <Badge variant="secondary">{needsAttention.totalPendingNotices} notices</Badge>
                                )}
                                {needsAttention.totalUrgentMaintenance > 0 && (
                                    <Badge variant="secondary">{needsAttention.totalUrgentMaintenance} maintenance</Badge>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            {needsAttention.items.map((item, i) => {
                                const Icon = typeIcon[item.type]
                                return (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg border-l-4 border p-3 transition-colors hover:bg-accent/50 ${severityStyle[item.severity]}`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Properties &amp; Occupancy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiTile icon={MapPin} label="Locations" value={kpis.totalLocations} sub={`${kpis.totalApartments} apartments`} />
                        <KpiTile icon={DoorOpen} label="Total Units" value={kpis.totalUnits} sub={`${kpis.vacantUnits} vacant`} />
                        <KpiTile icon={Building2} label="Occupancy" value={`${kpis.occupancyPct}%`} sub={`${kpis.occupiedUnits}/${kpis.totalUnits} occupied`} tone="success" />
                        <KpiTile icon={Users} label="Active Tenants" value={kpis.activeTenants} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Finance — This Month</h2>
                        {can.viewFinancial && (
                            <Link href="/reports/financial" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Full report <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiTile icon={TrendingUp} label="Billed" value={formatKES(kpis.monthlyBilling)} />
                        <KpiTile icon={Wallet} label="Collected" value={formatKES(kpis.collectedThisMonth)} tone="success" />
                        <KpiTile icon={AlertTriangle} label="Outstanding Debt" value={formatKES(kpis.outstandingDebt)} tone="destructive" />
                        <KpiTile icon={Wallet} label="Wallet Balances" value={formatKES(kpis.walletBalance)} tone="accent" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Maintenance</h2>
                        {can.viewMaintenance && (
                            <Link href="/maintenance" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View all <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiTile icon={Wrench} label="Open" value={kpis.openMaintenance} tone="warning" />
                        <KpiTile icon={Wrench} label="In Progress" value={kpis.inProgressMaintenance} />
                        <KpiTile icon={ShieldCheck} label="Resolved" value={kpis.resolvedMaintenance} tone="success" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function KpiTile({ icon: Icon, label, value, sub, tone = 'primary' }: {
    icon: any; label: string; value: string | number; sub?: string;
    tone?: 'primary' | 'success' | 'destructive' | 'warning' | 'accent';
}) {
    const toneMap: Record<string, string> = {
        primary: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-600',
        destructive: 'bg-destructive/10 text-destructive',
        warning: 'bg-amber-500/10 text-amber-600',
        accent: 'bg-violet-500/10 text-violet-600',
    };
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneMap[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}