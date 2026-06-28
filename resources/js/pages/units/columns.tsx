// resources/js/pages/units/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Edit, Trash2 } from "lucide-react"
import { Unit } from "@/types"

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(value))

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    Occupied: "default",
    Vacant: "secondary",
    Reserved: "outline",
}

export const unitColumns: ColumnDef<Unit>[] = [
    {
        id: "unit_no",
        accessorKey: "unit_no",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Unit" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("unit_no")}</span>,
    },
    {
        id: "apartment_id",
        accessorFn: (row) => row.apartment?.id,
        header: "Apartment",
        cell: ({ row }) => row.original.apartment?.name ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "floor",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Floor" />
        ),
        cell: ({ row }) => row.getValue("floor") ?? "—",
    },
    {
        accessorKey: "bedrooms",
        header: "Bedrooms",
        cell: ({ row }) => row.getValue("bedrooms") ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "rent",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rent" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{formatKES(row.getValue("rent"))}</span>
        ),
    },
    {
        accessorKey: "service_charge",
        header: "Service Charge",
        cell: ({ row }) => {
            const value = row.getValue("service_charge") as string | null
            return value ? formatKES(value) : "—"
        },
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <Badge variant={statusVariant[status] ?? "outline"}>{status}</Badge>
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const unit = row.original as any

            const actions = [
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (data: Unit) => router.get(`/units/${data.id}/edit`),
                    show: unit.can?.update !== false,
                    shortcut: "⌘E",
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Unit) => {
                        if (confirm(`Are you sure you want to delete unit "${data.unit_no}"?`)) {
                            router.delete(`/units/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: unit.can?.delete !== false,
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]