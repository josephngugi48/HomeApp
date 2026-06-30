// resources/js/pages/notices/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { CheckCircle2, Trash2 } from "lucide-react"
import { NoticeRecord } from "@/types"

const typeLabel: Record<string, string> = {
    vacating: "Vacating",
    lease_renewal: "Lease Renewal",
    lease_termination: "Lease Termination",
}

const typeColor: Record<string, string> = {
    vacating: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    lease_renewal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    lease_termination: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    open: "secondary", acknowledged: "default", closed: "outline",
}

export const noticeColumns: ColumnDef<NoticeRecord>[] = [
    {
        id: "tenant",
        accessorFn: (row) => row.tenant?.name,
        header: "Tenant",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.tenant?.name}</span>
                <span className="text-xs text-muted-foreground">Unit {row.original.unit?.unit_no}</span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeColor[type]}`}>
                    {typeLabel[type]}
                </span>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "submitted_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => new Date(row.getValue("submitted_at")).toLocaleDateString("en-GB"),
    },
    {
        accessorKey: "effective_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Effective" />,
        cell: ({ row }) => {
            const date = row.getValue("effective_at") as string
            const needsAction = row.original.needs_action
            return (
                <span className={needsAction ? "font-semibold text-amber-700 dark:text-amber-400" : ""}>
                    {new Date(date).toLocaleDateString("en-GB")}
                </span>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <Badge variant={statusVariant[status] ?? "outline"} className="capitalize">{status}</Badge>
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const notice = row.original
            const actions = [
                {
                    label: "Terminate Lease & Close",
                    icon: CheckCircle2,
                    onClick: (data: NoticeRecord) => {
                        if (confirm(`Terminate the lease for ${data.tenant?.name}'s unit and close this notice? This frees up the unit immediately.`)) {
                            router.post(`/notices/${data.id}/act`, {}, { preserveScroll: true })
                        }
                    },
                    show: notice.needs_action === true,
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: NoticeRecord) => {
                        if (confirm("Delete this notice?")) {
                            router.delete(`/notices/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: notice.can?.delete !== false,
                },
            ]
            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]