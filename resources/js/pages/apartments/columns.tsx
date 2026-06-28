// resources/js/pages/apartments/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Edit, Trash2 } from "lucide-react"
import { Apartment } from "@/types"

export const apartmentColumns: ColumnDef<Apartment>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Apartment" />
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue("name")}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.code}
                </span>
            </div>
        ),
    },
    // {
    //     accessorKey: "location",
    //     header: "Location",
    //     cell: ({ row }) => row.original.location?.name ?? "—",
    //     enableSorting: false,
    // },
    {
        id: "location_id",
        accessorFn: (row) => row.location?.id,
        header: "Location",
        cell: ({ row }) => row.original.location?.name ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "landlord",
        header: "Landlord",
        cell: ({ row }) => row.original.landlord?.name ?? (
            <span className="text-muted-foreground italic">Unassigned</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "caretaker",
        header: "Caretaker",
        cell: ({ row }) => row.original.caretaker?.name ?? (
            <span className="text-muted-foreground italic">Unassigned</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "units_count",
        header: "Units",
        cell: ({ row }) => row.original.units_count ?? 0,
        enableSorting: false,
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
            const apartment = row.original as any

            const actions = [
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (data: Apartment) => router.get(`/apartments/${data.id}/edit`),
                    show: apartment.can?.update !== false,
                    shortcut: "⌘E",
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Apartment) => {
                        if (confirm(`Are you sure you want to delete "${data.name}"?`)) {
                            router.delete(`/apartments/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: apartment.can?.delete !== false,
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]