import * as React from "react"
import { DataTable } from "@/components/table/data-table"
import { roleColumns } from "@/pages/roles/columns"
import { DataTableResponse, Role } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Shield, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    roles: DataTableResponse<Role>
    filters?: {
        search?: string
        guard_name?: string | string[]
        sort_by?: string
        sort_direction?: 'asc' | 'desc'
    }
}

export default function RoleAndPermissionsPage({ roles, filters }: PageProps) {
    const handleBulkDelete = (selectedRoles: Role[]) => {
        const ids = selectedRoles.map(role => role.id)

        router.delete('/roles-and-permissions/bulk-delete', {
            data: { ids },
            preserveScroll: true,
            onSuccess: () => {
                console.log('Roles deleted successfully')
            },
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Roles & Permissions", href: "/roles-and-permissions" },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage roles and their permissions
                        </p>
                    </div>
                    <Button onClick={() => router.get('/roles/create')}>
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={roleColumns}
                    data={roles}
                    searchColumn="name"
                    searchPlaceholder="Search roles..."
                    filters={[
                        {
                            column: "guard_name",
                            title: "Guard",
                            options: [
                                { label: "Web", value: "web", icon: Shield },
                                { label: "API", value: "api", icon: Shield },
                            ],
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}