// resources/js/pages/maintenance/index.tsx
import { DataTable } from "@/components/table/data-table"
import { maintenanceColumns } from "@/pages/maintenance/columns"
import { MaintenanceRequestRecord, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Plus, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    requests: DataTableResponse<MaintenanceRequestRecord>
    categoryOptions: string[]
    priorityOptions: string[]
    statusOptions: string[]
    can: { create: boolean }
}

export default function MaintenanceIndexPage({ requests, categoryOptions, priorityOptions, statusOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Maintenance", href: "/maintenance" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
                        <p className="text-muted-foreground">
                            Repairs and operational tasks, sorted by urgency
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/maintenance/create')}>
                            <Plus className="h-4 w-4" /> Log Request
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={maintenanceColumns}
                    data={requests}
                    searchColumn="number"
                    searchPlaceholder="Search by request number or tenant..."
                    filters={[
                        {
                            column: "category",
                            title: "Category",
                            options: categoryOptions.map((c) => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c })),
                        },
                        {
                            column: "priority",
                            title: "Priority",
                            options: priorityOptions.map((p) => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p, icon: Wrench })),
                        },
                        {
                            column: "status",
                            title: "Status",
                            options: statusOptions.map((s) => ({ label: s.replace("_", " "), value: s })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}