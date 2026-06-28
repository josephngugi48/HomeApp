// resources/js/pages/invoices/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Eye, Trash2 } from "lucide-react"
import { Invoice } from "@/types"

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(value))

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    unpaid: "secondary",
    partial: "secondary",
    paid: "default",
    overdue: "destructive",
}

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "number",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Invoice" />
        ),
        cell: ({ row }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {row.getValue("number")}
            </code>
        ),
    },
    {
        id: "tenant",
        accessorFn: (row) => row.tenant?.name,
        header: "Tenant",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.tenant?.name}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.unit?.unit_no} — {row.original.unit?.apartment?.name}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Due" />
        ),
        cell: ({ row }) => new Date(row.getValue("due_date")).toLocaleDateString("en-GB"),
    },
    {
        accessorKey: "total",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => formatKES(row.getValue("total")),
    },
    {
        accessorKey: "balance",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Balance" />
        ),
        cell: ({ row }) => {
            const balance = Number(row.getValue("balance"))
            return (
                <span className={balance > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
                    {formatKES(balance)}
                </span>
            )
        },
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
            const invoice = row.original as any

            const actions = [
                {
                    label: "View",
                    icon: Eye,
                    onClick: (data: Invoice) => router.get(`/invoices/${data.id}`),
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Invoice) => {
                        if (confirm(`Delete invoice ${data.number}? This cannot be undone.`)) {
                            router.delete(`/invoices/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: invoice.can?.delete !== false,
                    shortcut: "⌘⌫",
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]