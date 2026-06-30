// resources/js/pages/issues/index.tsx
import { useState } from "react"
import { DataTable } from "@/components/table/data-table"
import { issueColumns } from "@/pages/issues/columns"
import { IssueRecord, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { MessageSquareWarning, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface PageProps {
    issues: DataTableResponse<IssueRecord>
    categoryOptions: string[]
    statusOptions: string[]
    can: { create: boolean }
}

export default function IssuesIndexPage({ issues, categoryOptions, statusOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Tenant Issues", href: "/issues" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenant Issues</h1>
                        <p className="text-muted-foreground">
                            Complaints, questions, and concerns raised by tenants
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/issues/create')}>
                            <Plus className="h-4 w-4" /> Log Issue
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={issueColumns}
                    data={issues}
                    searchColumn="title"
                    searchPlaceholder="Search by title or tenant..."
                    filters={[
                        {
                            column: "category",
                            title: "Category",
                            options: categoryOptions.map((c) => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c, icon: MessageSquareWarning })),
                        },
                        {
                            column: "status",
                            title: "Status",
                            options: statusOptions.map((s) => ({ label: s.replace("_", " "), value: s })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}