// resources/js/pages/leases/index.tsx
import { DataTable } from "@/components/table/data-table"
import { leaseColumns } from "@/pages/leases/columns"
import { Lease, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    leases: DataTableResponse<Lease>
    statusOptions: string[]
    can: { create: boolean }
}

export default function LeasesIndexPage({ leases, statusOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Leases", href: "/leases" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
                        <p className="text-muted-foreground">
                            Tenancy agreements linking tenants to units
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/leases/create')}>
                            <Plus className="h-4 w-4" />
                            New Lease
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={leaseColumns}
                    data={leases}
                    searchColumn="tenant"
                    searchPlaceholder="Search by tenant or unit..."
                    filters={[
                        {
                            column: "status",
                            title: "Status",
                            options: statusOptions.map((s) => ({
                                label: s.charAt(0).toUpperCase() + s.slice(1),
                                value: s,
                            })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}