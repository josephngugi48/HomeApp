// resources/js/pages/tenants/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Edit, Trash2 } from "lucide-react"
import { Tenant } from "@/types"

export const tenantColumns: ColumnDef<Tenant>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue("name")}</span>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
        ),
    },
    {
        id: "national_id",
        accessorFn: (row) => row.tenant_profile?.national_id,
        header: "National ID",
        cell: ({ row }) => row.original.tenant_profile?.national_id ?? (
            <span className="text-muted-foreground italic">Not set</span>
        ),
        enableSorting: false,
    },
    {
        id: "kra_pin",
        accessorFn: (row) => row.tenant_profile?.kra_pin,
        header: "KRA PIN",
        cell: ({ row }) => row.original.tenant_profile?.kra_pin ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Added" />
        ),
        cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString("en-GB"),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const tenant = row.original as any

            const actions = [
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (data: Tenant) => router.get(`/tenants/${data.id}/edit`),
                    show: tenant.can?.update !== false,
                    shortcut: "⌘E",
                },
                {
                    label: "Remove",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Tenant) => {
                        if (confirm(`Remove "${data.name}" from this company? Their account record is kept.`)) {
                            router.delete(`/tenants/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: tenant.can?.delete !== false,
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]