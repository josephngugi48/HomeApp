import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type SharedData,
    type DashboardKpis,
    type NeedsAttention,
    type DashboardCharts,
} from '@/types';
import {
    Users,
    ShieldCheck,
    Building2,
    DoorOpen,
    Wallet,
    TrendingUp,
    AlertTriangle,
    Wrench,
    FileWarning,
    ArrowRight,
    MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

interface Props {
    kpis?: DashboardKpis;
    needsAttention?: NeedsAttention;
    can?: { viewFinancial: boolean; viewOccupancy: boolean; viewMaintenance: boolean };
    charts?: DashboardCharts;
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

// Safe fallback shapes
const EMPTY_KPIS: DashboardKpis = {
    totalLocations: 0,
    totalApartments: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyPct: 0,
    activeTenants: 0,
    monthlyBilling: 0,
    collectedThisMonth: 0,
    outstandingDebt: 0,
    walletBalance: 0,
    openMaintenance: 0,
    inProgressMaintenance: 0,
    resolvedMaintenance: 0,
};

const EMPTY_ATTENTION: NeedsAttention = {
    items: [],
    totalOverdueInvoices: 0,
    totalPendingNotices: 0,
    totalUrgentMaintenance: 0,
};

function isValidAttention(data: any): data is NeedsAttention {
    return data && typeof data === 'object' && 'items' in data && Array.isArray(data.items);
}

export default function Dashboard({ kpis, needsAttention, can, charts }: Props) {
    const { auth } = usePage<SharedData>().props;

    const safeKpis = kpis ?? EMPTY_KPIS;
    const safeAttention = isValidAttention(needsAttention) ? needsAttention : EMPTY_ATTENTION;
    const safeCan = can ?? { viewFinancial: false, viewOccupancy: false, viewMaintenance: false };
    const safeCharts = charts ?? {
        revenueTrend: [],
        paymentMethods: [],
        occupancyTrend: [],
        maintenanceStatus: [],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6 md:p-8">
                {/* Welcome Header */}
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

                {!kpis && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                        Dashboard data didn't load correctly. Try refreshing — if this persists, check that the
                        dashboard route is pointing at the current DashboardController.
                    </div>
                )}

                {/* Needs Attention */}
                {safeAttention.items.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Needs Attention
                            </h2>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                {safeAttention.totalOverdueInvoices > 0 && (
                                    <Badge variant="destructive">{safeAttention.totalOverdueInvoices} overdue</Badge>
                                )}
                                {safeAttention.totalPendingNotices > 0 && (
                                    <Badge variant="secondary">{safeAttention.totalPendingNotices} notices</Badge>
                                )}
                                {safeAttention.totalUrgentMaintenance > 0 && (
                                    <Badge variant="secondary">{safeAttention.totalUrgentMaintenance} maintenance</Badge>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            {safeAttention.items.map((item, i) => {
                                const Icon = typeIcon[item.type] || AlertTriangle;
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
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Properties & Occupancy */}
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Properties &amp; Occupancy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiTile
                            icon={MapPin}
                            label="Locations"
                            value={safeKpis.totalLocations}
                            sub={`${safeKpis.totalApartments} apartments`}
                        />
                        <KpiTile
                            icon={DoorOpen}
                            label="Total Units"
                            value={safeKpis.totalUnits}
                            sub={`${safeKpis.vacantUnits} vacant`}
                        />
                        <KpiTile
                            icon={Building2}
                            label="Occupancy"
                            value={`${safeKpis.occupancyPct}%`}
                            sub={`${safeKpis.occupiedUnits}/${safeKpis.totalUnits} occupied`}
                            tone="success"
                        />
                        <KpiTile icon={Users} label="Active Tenants" value={safeKpis.activeTenants} />
                    </div>
                </div>

                {/* Finance */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Finance — This Month</h2>
                        {safeCan.viewFinancial && (
                            <Link href="/reports/financial" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Full report <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiTile icon={TrendingUp} label="Billed" value={formatKES(safeKpis.monthlyBilling)} />
                        <KpiTile
                            icon={Wallet}
                            label="Collected"
                            value={formatKES(safeKpis.collectedThisMonth)}
                            tone="success"
                        />
                        <KpiTile
                            icon={AlertTriangle}
                            label="Outstanding Debt"
                            value={formatKES(safeKpis.outstandingDebt)}
                            tone="destructive"
                        />
                        <KpiTile
                            icon={Wallet}
                            label="Wallet Balances"
                            value={formatKES(safeKpis.walletBalance)}
                            tone="accent"
                        />
                    </div>
                </div>

                {/* Maintenance */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Maintenance</h2>
                        {safeCan.viewMaintenance && (
                            <Link href="/maintenance" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View all <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiTile icon={Wrench} label="Open" value={safeKpis.openMaintenance} tone="warning" />
                        <KpiTile icon={Wrench} label="In Progress" value={safeKpis.inProgressMaintenance} />
                        <KpiTile icon={ShieldCheck} label="Resolved" value={safeKpis.resolvedMaintenance} tone="success" />
                    </div>
                </div>

                {/* Charts Section */}
                <ChartsSection charts={safeCharts} />
            </div>
        </AppLayout>
    );
}

// ---- KpiTile Component ----
function KpiTile({
    icon: Icon,
    label,
    value,
    sub,
    tone = 'primary',
}: {
    icon: any;
    label: string;
    value: string | number;
    sub?: string;
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

// ---- ChartsSection Component ----
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

function ChartsSection({ charts }: { charts: DashboardCharts }) {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenue Trend</h3>
                    <p className="text-xs text-muted-foreground mb-4">Billed vs collected, last 7 months</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={charts.revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tickFormatter={(v) => `${v / 1000000}M`} tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar dataKey="billed" fill="#3b82f6" name="Billed" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Methods */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Methods</h3>
                    <p className="text-xs text-muted-foreground mb-4">Share of collections this month</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={charts.paymentMethods}
                                dataKey="total"
                                nameKey="method"
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {charts.paymentMethods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Occupancy Trend */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Occupancy Trend</h3>
                    <p className="text-xs text-muted-foreground mb-4">Portfolio-wide occupancy %</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={charts.occupancyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v: number) => `${v}%`} />
                            <Line type="monotone" dataKey="occupancy" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Maintenance Status */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Maintenance Status</h3>
                    <p className="text-xs text-muted-foreground mb-4">Breakdown across all properties</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart layout="vertical" data={charts.maintenanceStatus} margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}