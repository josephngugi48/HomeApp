// resources/js/pages/issues/columns.tsx 
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { router } from "@inertiajs/react"
import { Pencil, Trash2 } from "lucide-react"
import { IssueRecord } from "@/types"

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    open: "destructive", assigned: "secondary", in_progress: "secondary", closed: "outline",
}

function StatusQuickEdit({ issue }: { issue: IssueRecord & { statusOptions?: string[]; caretakers?: { id: number; name: string }[] } }) {
    const [status, setStatus] = useState(issue.status)
    const [assigneeId, setAssigneeId] = useState(issue.assignee?.id ? String(issue.assignee.id) : "")
    const [open, setOpen] = useState(false)

    const save = () => {
        router.put(`/issues/${issue.id}`, {
            status,
            assignee_id: assigneeId || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3">
                <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button size="sm" className="w-full" onClick={save}>Save</Button>
            </PopoverContent>
        </Popover>
    )
}

export const issueColumns: ColumnDef<IssueRecord>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue("title")}</span>
                <span className="text-xs text-muted-foreground">{row.original.tenant?.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("category") as string}</Badge>,
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
            const issue = row.original as any
            return (
                <div className="flex justify-end gap-1">
                    {issue.can?.update !== false && <StatusQuickEdit issue={issue} />}
                    <DataTableRowActions
                        row={row}
                        actions={[{
                            label: "Delete",
                            icon: Trash2,
                            variant: "destructive" as const,
                            onClick: (data: IssueRecord) => {
                                if (confirm(`Delete issue "${data.title}"?`)) {
                                    router.delete(`/issues/${data.id}`, { preserveScroll: true })
                                }
                            },
                            show: issue.can?.delete !== false,
                        }]}
                    />
                </div>
            )
        },
    },
]