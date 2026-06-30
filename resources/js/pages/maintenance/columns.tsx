// resources/js/pages/maintenance/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Trash2 } from "lucide-react"
import { MaintenanceRequestRecord } from "@/types"

const priorityColor: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    emergency: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    open: "secondary", assigned: "secondary", in_progress: "default", completed: "outline", closed: "outline",
}

export const maintenanceColumns: ColumnDef<MaintenanceRequestRecord>[] = [
    {
        accessorKey: "number",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Request" />,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs w-fit">{row.getValue("number")}</code>
                <span className="text-xs text-muted-foreground mt-0.5">{row.original.tenant?.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <span className="capitalize">{row.getValue("category") as string}</span>,
        enableSorting: false,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityColor[priority]}`}>
                    {priority === "emergency" && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
                    {priority}
                </span>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "assignee",
        accessorFn: (row) => row.assignee?.name,
        header: "Assigned To",
        cell: ({ row }) => row.original.assignee?.name ?? <span className="text-muted-foreground italic">Unassigned</span>,
        enableSorting: false,
    },
    {
        accessorKey: "raised_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Raised" />,
        cell: ({ row }) => new Date(row.getValue("raised_at")).toLocaleDateString("en-GB"),
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <Badge variant={statusVariant[status] ?? "outline"} className="capitalize">{status.replace("_", " ")}</Badge>
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const req = row.original as any
            const actions = [
                {
                    label: "View / Update",
                    icon: undefined,
                    onClick: (data: MaintenanceRequestRecord) => router.get(`/maintenance/${data.id}`),
                    show: req.can?.update !== false,
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: MaintenanceRequestRecord) => {
                        if (confirm(`Delete request ${data.number}?`)) {
                            router.delete(`/maintenance/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: req.can?.delete !== false,
                },
            ]
            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]