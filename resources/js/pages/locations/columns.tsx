// resources/js/pages/locations/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Edit, Trash2 } from "lucide-react"
import { Location } from "@/types"

export const locationColumns: ColumnDef<Location>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue("name")}</span>
        ),
    },
    {
        accessorKey: "code",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {row.getValue("code")}
            </code>
        ),
    },
    {
        accessorKey: "apartments_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Apartments" serverSide={false} />
        ),
        cell: ({ row }: any) => row.original.apartments_count ?? 0,
    },
    {
        accessorKey: "units_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Units" serverSide={false} />
        ),
        cell: ({ row }: any) => row.original.units_count ?? 0,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "Active" ? "default" : "secondary"}>
                    {status}
                </Badge>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const location = row.original as any

            const actions = [
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (data: Location) => {
                        router.get(`/locations/${data.id}/edit`)
                    },
                    show: location.can?.update !== false,
                    shortcut: "⌘E",
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Location) => {
                        if (confirm(`Are you sure you want to delete "${data.name}"?`)) {
                            router.delete(`/locations/${data.id}`, {
                                preserveScroll: true,
                            })
                        }
                    },
                    show: location.can?.delete !== false,
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]