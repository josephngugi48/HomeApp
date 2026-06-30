// resources/js/pages/broadcasts/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Eye, MessageSquare, Mail, Phone, Trash2 } from "lucide-react"
import { BroadcastRecord } from "@/types"

const channelIcon: Record<string, any> = { sms: MessageSquare, email: Mail, whatsapp: Phone }
const channelLabel: Record<string, string> = { sms: "SMS", email: "Email", whatsapp: "WhatsApp" }

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline", sending: "secondary", sent: "default", failed: "destructive",
}

export const broadcastColumns: ColumnDef<BroadcastRecord>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
    },
    {
        id: "channels",
        header: "Channels",
        cell: ({ row }) => (
            <div className="flex gap-1.5">
                {row.original.channels.map((c) => {
                    const Icon = channelIcon[c]
                    return (
                        <span key={c} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                            <Icon className="h-3 w-3" /> {channelLabel[c]}
                        </span>
                    )
                })}
            </div>
        ),
        enableSorting: false,
    },
    {
        id: "delivery",
        header: "Sent / Delivered",
        cell: ({ row }) => (
            <span className="text-sm">
                <span className="font-medium">{row.original.delivered_count}</span>
                <span className="text-muted-foreground">/{row.original.sent_count}</span>
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "sent_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = row.getValue("sent_at") as string | null
            return date ? new Date(date).toLocaleDateString("en-GB") : "—"
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
            const broadcast = row.original as any
            const actions = [
                { label: "View Details", icon: Eye, onClick: (data: BroadcastRecord) => router.get(`/broadcasts/${data.id}`) },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: BroadcastRecord) => {
                        if (confirm(`Delete broadcast "${data.title}"?`)) {
                            router.delete(`/broadcasts/${data.id}`, { preserveScroll: true })
                        }
                    },
                    show: broadcast.can?.delete !== false,
                },
            ]
            return <DataTableRowActions row={row} actions={actions} />
        },
    },
]