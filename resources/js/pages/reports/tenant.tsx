// resources/js/pages/reports/tenant.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { TenantReportRow } from "@/types"

interface Props {
    breakdown: { name: string; value: number }[]
    tenants: TenantReportRow[]
}

const tabs = [
    { value: "financial", label: "Financial" },
    { value: "occupancy", label: "Occupancy" },
    { value: "tenant", label: "Tenant" },
    { value: "maintenance", label: "Maintenance" },
]

const formatKES = (n: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n)

const pieColors = ["#10b981", "#94a3b8"]

export default function TenantReportPage({ breakdown, tenants }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: "Reports", href: "/reports/financial" }, { title: "Tenant", href: "/reports/tenant" }]}>
            <Head title="Tenant Report" />

            <div className="flex flex-col gap-6 p-8 max-w-[1400px]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Financial, occupancy, tenant, and maintenance insights</p>
                </div>

                <Tabs value="tenant" onValueChange={(v) => router.get(`/reports/${v}`)}>
                    <TabsList>
                        {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
                    </TabsList>
                </Tabs>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="p-5 lg:col-span-1">
                        <h3 className="font-semibold mb-1">Lease Status Breakdown</h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                                        {breakdown.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">Tenants — Detailed</h3>
                            <div className="max-h-[480px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead><TableHead>Unit</TableHead>
                                            <TableHead>Lease Status</TableHead><TableHead>Move-in</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium">{t.name}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {t.unit ? `${t.unit} — ${t.apartment}` : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {t.lease_status ? (
                                                        <Badge variant={t.lease_status === "active" ? "default" : "secondary"} className="capitalize">
                                                            {t.lease_status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">No lease</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {t.move_in ? new Date(t.move_in).toLocaleDateString("en-GB") : "—"}
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${t.balance > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                                    {formatKES(t.balance)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}