import * as React from "react"
import { DataTable } from "@/components/table/data-table"
import { usersColumns } from "@/pages/users/columns"
import { DataTableResponse, Role } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Shield, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { User } from "@/types/user"

interface PageProps {
    users: DataTableResponse<User>
    filters?: {
        search?: string
        guard_name?: string | string[]
        sort_by?: string
        sort_direction?: 'asc' | 'desc'
    }
    can: any
}

export default function UsersPage({ users, can }: PageProps) {
    console.log("users data:", users);
    const handleBulkDelete = (selectedusers: User[]) => {
        const ids = selectedusers.map(user => user.id)

        router.delete('/users-and-permissions/bulk-delete', {
            data: { ids },
            preserveScroll: true,
            onSuccess: () => {
                console.log('users deleted successfully')
            },
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Users", href: "/users" },
            ]}
        >
            <div className="flex flex-col gap-8 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">users</h1>
                        <p className="text-muted-foreground">
                            Manage users
                        </p>
                    </div>
                    {can.create && (

                        <Button onClick={() => router.get('/users/create')} className="bg-primary">
                            <Plus className="h-4 w-4" />
                            Create Users
                        </Button>
                    )}
                </div>

                {/* Data Table */}
                <DataTable
                    columns={usersColumns}
                    data={users}
                    searchColumn="name"
                    searchPlaceholder="Search users..."
                    filters={[
                        {
                            column: "status",
                            title: "Status",
                            options: [
                                { label: "Active", value: "active" },
                                { label: "Suspended", value: "suspended" },
                            ],
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}