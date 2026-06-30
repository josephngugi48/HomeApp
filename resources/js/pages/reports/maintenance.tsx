// resources/js/pages/reports/maintenance.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { MaintenanceReportRow, DataTableResponse } from "@/types"

interface Props {
    statusBreakdown: { name: string; value: number }[]
    categoryBreakdown: { name: string; value: number }[]
    requests: DataTableResponse<MaintenanceReportRow>
}

const tabs = [
    { value: "financial", label: "Financial" },
    { value: "occupancy", label: "Occupancy" },
    { value: "tenant", label: "Tenant" },
    { value: "maintenance", label: "Maintenance" },
]

const pieColors = ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"]

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline", medium: "secondary", high: "secondary", emergency: "destructive",
}

export default function MaintenanceReportPage({ statusBreakdown, categoryBreakdown, requests }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: "Reports", href: "/reports/financial" }, { title: "Maintenance", href: "/reports/maintenance" }]}>
            <Head title="Maintenance Report" />

            <div className="flex flex-col gap-6 p-8 max-w-[1400px]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Financial, occupancy, tenant, and maintenance insights</p>
                </div>

                <Tabs value="maintenance" onValueChange={(v) => router.get(`/reports/${v}`)}>
                    <TabsList>
                        {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
                    </TabsList>
                </Tabs>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Status Breakdown</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Requests by Category</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                                        {categoryBreakdown.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Requests — Detailed</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request</TableHead><TableHead>Tenant</TableHead><TableHead>Category</TableHead>
                                    <TableHead>Priority</TableHead><TableHead>Assignee</TableHead><TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.data.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell><code className="text-xs">{r.number}</code></TableCell>
                                        <TableCell>{r.tenant?.name}</TableCell>
                                        <TableCell className="capitalize">{r.category}</TableCell>
                                        <TableCell>
                                            <Badge variant={priorityVariant[r.priority] ?? "outline"} className="capitalize">{r.priority}</Badge>
                                        </TableCell>
                                        <TableCell>{r.assignee?.name ?? <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                                        <TableCell className="capitalize">{r.status.replace("_", " ")}</TableCell>
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