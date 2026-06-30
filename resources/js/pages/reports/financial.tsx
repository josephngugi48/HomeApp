// resources/js/pages/reports/financial.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    FinancialKpis, RevenueTrendPoint, AgeingBucket, DataTableResponse,
} from "@/types"

const formatKES = (n: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n)

const pieColors = ["#2563eb", "#7c3aed", "#f59e0b", "#10b981"]

interface PaymentRow {
    id: number; ref: string; amount: string; method: string; paid_at: string;
    tenant?: { name: string }; invoice?: { number: string } | null;
}

interface Props {
    kpis: FinancialKpis
    revenueTrend: RevenueTrendPoint[]
    paymentMethods: Record<string, number>
    ageing: AgeingBucket[]
    payments: DataTableResponse<PaymentRow>
    filters: { date_from?: string; date_to?: string; method?: string }
}

const tabs = [
    { value: "financial", label: "Financial" },
    { value: "occupancy", label: "Occupancy" },
    { value: "tenant", label: "Tenant" },
    { value: "maintenance", label: "Maintenance" },
]

export default function FinancialReportPage({ kpis, revenueTrend, paymentMethods, ageing, payments, filters }: Props) {
    const methodData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }))

    const setDateRange = (key: "date_from" | "date_to", value: string) => {
        router.get("/reports/financial", { ...filters, [key]: value }, { preserveState: true, replace: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Reports", href: "/reports/financial" }, { title: "Financial", href: "/reports/financial" }]}>
            <Head title="Financial Report" />

            <div className="flex flex-col gap-6 p-8 max-w-[1400px]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Financial, occupancy, tenant, and maintenance insights</p>
                </div>

                <Tabs value="financial" onValueChange={(v) => router.get(`/reports/${v}`)}>
                    <TabsList>
                        {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
                    </TabsList>
                </Tabs>

                <div className="flex items-end gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">From</Label>
                        <Input type="date" defaultValue={filters.date_from} onChange={e => setDateRange("date_from", e.target.value)} className="w-40" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">To</Label>
                        <Input type="date" defaultValue={filters.date_to} onChange={e => setDateRange("date_to", e.target.value)} className="w-40" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Billed</div><div className="mt-1 text-xl font-semibold">{formatKES(kpis.billed)}</div></Card>
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Collected</div><div className="mt-1 text-xl font-semibold text-success">{formatKES(kpis.collected)}</div></Card>
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Outstanding</div><div className="mt-1 text-xl font-semibold text-destructive">{formatKES(kpis.outstanding)}</div></Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Revenue Trend</h3>
                        <p className="text-xs text-muted-foreground mb-3">Billed vs collected</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="m" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: number) => formatKES(v)} />
                                    <Area dataKey="billed" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
                                    <Area dataKey="collected" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Payment Methods</h3>
                        <p className="text-xs text-muted-foreground mb-3">Count by method, selected period</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={methodData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                                        {methodData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-5 lg:col-span-2">
                        <h3 className="font-semibold mb-1">Debt Ageing</h3>
                        <p className="text-xs text-muted-foreground mb-3">Outstanding balance by days overdue</p>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageing}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="bucket" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: number) => formatKES(v)} />
                                    <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Payments — Detailed</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt</TableHead><TableHead>Tenant</TableHead><TableHead>Invoice</TableHead>
                                    <TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell><code className="text-xs">{p.ref}</code></TableCell>
                                        <TableCell>{p.tenant?.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{p.invoice?.number ?? "—"}</TableCell>
                                        <TableCell className="capitalize">{p.method}</TableCell>
                                        <TableCell className="text-right font-medium">{formatKES(Number(p.amount))}</TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(p.paid_at).toLocaleDateString("en-GB")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}