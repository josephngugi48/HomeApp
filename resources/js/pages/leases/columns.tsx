// resources/js/pages/leases/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Edit, LogOut, Trash2 } from "lucide-react"
import { Lease } from "@/types"

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(value))

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
    active: "default",
    ended: "secondary",
    terminated: "destructive",
}

export const leaseColumns: ColumnDef<Lease>[] = [
    {
        id: "tenant",
        accessorFn: (row) => row.tenant?.name,
        header: "Tenant",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.tenant?.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.tenant?.email}</span>
            </div>
        ),
        enableSorting: false,
    },
    {
        id: "unit",
        accessorFn: (row) => row.unit?.unit_no,
        header: "Unit",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.unit?.unit_no}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.unit?.apartment?.name}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "start_date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Start Date" />
        ),
        cell: ({ row }) => new Date(row.getValue("start_date")).toLocaleDateString("en-GB"),
    },
    {
        accessorKey: "rent",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rent" />
        ),
        cell: ({ row }) => formatKES(row.getValue("rent")),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={statusVariant[status] ?? "outline"} className="capitalize">
                    {status}
                </Badge>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const lease = row.original as any

            const actions = [
                {
                    label: "Edit Terms",
                    icon: Edit,
                    onClick: (data: Lease) => router.get(`/leases/${data.id}/edit`),
                    show: lease.can?.update !== false,
                    shortcut: "⌘E",
                },
                {
                    label: "Terminate",
                    icon: LogOut,
                    onClick: (data: Lease) => {
                        if (confirm(`Terminate this lease? Unit ${data.unit?.unit_no} will be marked vacant.`)) {
                            router.post(`/leases/${data.id}/terminate`, {}, { preserveScroll: true })
                        }
                    },
                    show: lease.can?.terminate === true,
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Lease) => {
                        if (confirm(`Permanently delete this lease record?`)) {
                            router.delete(`/leases/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: lease.can?.delete !== false && lease.status !== "active",
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]