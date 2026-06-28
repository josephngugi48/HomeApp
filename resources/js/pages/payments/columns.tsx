// resources/js/pages/payments/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Undo2 } from "lucide-react"
import { PaymentRecord } from "@/types"

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(value))

const methodVariant: Record<string, "default" | "secondary" | "outline"> = {
    mpesa: "default",
    bank: "secondary",
    cash: "secondary",
    wallet: "outline",
    adjustment: "outline",
}

export const paymentColumns: ColumnDef<PaymentRecord>[] = [
    {
        accessorKey: "ref",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Receipt" />
        ),
        cell: ({ row }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {row.getValue("ref")}
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
                {row.original.invoice && (
                    <span className="text-xs text-muted-foreground">
                        {row.original.invoice.number}
                    </span>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{formatKES(row.getValue("amount"))}</span>
        ),
    },
    {
        accessorKey: "method",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Method" />
        ),
        cell: ({ row }) => {
            const method = row.getValue("method") as string
            return (
                <Badge variant={methodVariant[method] ?? "outline"} className="capitalize">
                    {method === "mpesa" ? "M-Pesa" : method}
                </Badge>
            )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "external_ref",
        accessorKey: "external_ref",
        header: "Reference",
        cell: ({ row }) => {
            const value = row.getValue("external_ref") as string | null
            return value ? <code className="text-xs text-muted-foreground">{value}</code> : "—"
        },
        enableSorting: false,
    },
    {
        accessorKey: "paid_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => new Date(row.getValue("paid_at")).toLocaleDateString("en-GB"),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
            row.original.reversed_at ? (
                <Badge variant="destructive">Reversed</Badge>
            ) : (
                <Badge variant="default">Active</Badge>
            ),
        enableSorting: false,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original as any

            const actions = [
                {
                    label: "Reverse",
                    icon: Undo2,
                    variant: "destructive" as const,
                    onClick: (data: PaymentRecord) => {
                        if (confirm(`Reverse payment ${data.ref}? This will re-open the linked invoice's balance.`)) {
                            router.post(`/payments/${data.id}/reverse`, {}, { preserveScroll: true })
                        }
                    },
                    show: payment.can?.reverse === true,
                },
            ]

            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]