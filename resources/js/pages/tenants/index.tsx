// resources/js/pages/tenants/index.tsx
import { DataTable } from "@/components/table/data-table"
import { tenantColumns } from "@/pages/tenants/columns"
import { Tenant, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    tenants: DataTableResponse<Tenant>
    can: { create: boolean }
}

export default function TenantsIndexPage({ tenants, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Tenants", href: "/tenants" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-muted-foreground">
                            Manage tenant accounts across your properties
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/tenants/create')}>
                            <Plus className="h-4 w-4" />
                            New Tenant
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={tenantColumns}
                    data={tenants}
                    searchColumn="name"
                    searchPlaceholder="Search by name, email, or national ID..."
                />
            </div>
        </AppLayout>
    )
}