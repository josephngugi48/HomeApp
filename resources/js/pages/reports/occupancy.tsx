// resources/js/pages/reports/occupancy.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { OccupancyKpis, ApartmentOccupancyRow } from "@/types"

interface OccupancyTrendPoint { m: string; pct: number }

interface Props {
    kpis: OccupancyKpis
    byApartment: ApartmentOccupancyRow[]
    occupancyTrend: OccupancyTrendPoint[]
}

const tabs = [
    { value: "financial", label: "Financial" },
    { value: "occupancy", label: "Occupancy" },
    { value: "tenant", label: "Tenant" },
    { value: "maintenance", label: "Maintenance" },
]

export default function OccupancyReportPage({ kpis, byApartment, occupancyTrend }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: "Reports", href: "/reports/financial" }, { title: "Occupancy", href: "/reports/occupancy" }]}>
            <Head title="Occupancy Report" />

            <div className="flex flex-col gap-6 p-8 max-w-[1400px]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Financial, occupancy, tenant, and maintenance insights</p>
                </div>

                <Tabs value="occupancy" onValueChange={(v) => router.get(`/reports/${v}`)}>
                    <TabsList>
                        {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
                    </TabsList>
                </Tabs>

                <div className="grid gap-3 sm:grid-cols-4">
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Total Units</div><div className="mt-1 text-xl font-semibold">{kpis.totalUnits}</div></Card>
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Occupied</div><div className="mt-1 text-xl font-semibold text-success">{kpis.occupied}</div></Card>
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Vacant</div><div className="mt-1 text-xl font-semibold text-amber-600">{kpis.vacant}</div></Card>
                    <Card className="p-4"><div className="text-xs text-muted-foreground">Occupancy %</div><div className="mt-1 text-xl font-semibold">{kpis.occupancyPct}%</div></Card>
                </div>

                <p className="text-xs text-muted-foreground -mt-2">
                    Occupancy is calculated from active leases, not the manually-set unit status field — this stays
                    accurate even if a unit's status hasn't been updated.
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Occupancy % Trend</h3>
                        <p className="text-xs text-muted-foreground mb-3">Reconstructed from lease start/end dates, last 7 months</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={occupancyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="m" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip formatter={(v: number) => `${v}%`} />
                                    <Line type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="font-semibold mb-1">Occupied vs Vacant per Apartment</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byApartment}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-15} textAnchor="end" height={50} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="occupied" stackId="a" fill="#10b981" />
                                    <Bar dataKey="vacant" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Occupancy by Apartment</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Apartment</TableHead><TableHead>Units</TableHead>
                                    <TableHead>Occupied</TableHead><TableHead>Vacant</TableHead><TableHead>%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {byApartment.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-medium">{a.name}</TableCell>
                                        <TableCell>{a.units}</TableCell>
                                        <TableCell className="text-success font-medium">{a.occupied}</TableCell>
                                        <TableCell className="text-amber-600 font-medium">{a.vacant}</TableCell>
                                        <TableCell>{a.units > 0 ? ((a.occupied / a.units) * 100).toFixed(1) : "0.0"}%</TableCell>
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