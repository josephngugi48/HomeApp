import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Activity } from "@/types"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ActivityDetailsDialog } from "@/components/activity-log/details-dialog"
import * as React from "react"

export const activityColumns: ColumnDef<any>[] = [
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <span className="capitalize">{row.getValue("description")}</span>,
    },
    {
        accessorKey: "subject_type",
        header: "Subject",
        cell: ({ row }) => {
            const subjectType = row.original.subject_type?.split('\\').pop()
            const subjectId = row.original.subject_id
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{subjectType}</span>
                    <span className="text-xs text-muted-foreground">ID: {subjectId}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "causer",
        header: "User",
        cell: ({ row }) => {
            const causer = row.original.causer
            return causer ? (
                <div className="flex flex-col">
                    <span className="font-medium">{causer.name}</span>
                    <span className="text-xs text-muted-foreground">{causer.email}</span>
                </div>
            ) : (
                <span className="text-muted-foreground italic">System</span>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("created_at")), "MMM d, yyyy HH:mm:ss"),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return <ActivityDetailsDialog activity={row.original} />
        },
    },
]
