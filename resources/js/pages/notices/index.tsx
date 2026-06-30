// resources/js/pages/notices/

import { DataTable } from "@/components/table/data-table"
import { noticeColumns } from "@/pages/notices/columns"
import { NoticeRecord, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PageProps {
    notices: DataTableResponse<NoticeRecord>
    typeOptions: string[]
    statusOptions: string[]
    actionNeededCount: number
    can: { create: boolean }
}

export default function NoticesIndexPage({ notices, typeOptions, statusOptions, actionNeededCount, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Tenancy Notices", href: "/notices" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenancy Notices</h1>
                        <p className="text-muted-foreground">
                            Vacating, renewal, and termination notices submitted by tenants
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/notices/create')}>
                            <Plus className="h-4 w-4" /> Record Notice
                        </Button>
                    )}
                </div>

                {actionNeededCount > 0 && (
                    <Alert variant="destructive" className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300 [&>svg]:text-amber-600">
                        <AlertTriangle />
                        <AlertTitle>
                            {actionNeededCount} vacating notice{actionNeededCount > 1 ? "s" : ""} {actionNeededCount > 1 ? "have" : "has"} reached their effective date
                        </AlertTitle>
                        <AlertDescription>
                            These leases are ready to be terminated and their units freed up. Look for the highlighted
                            effective dates below, then use "Terminate Lease &amp; Close" on each row — nothing is
                            terminated automatically.
                        </AlertDescription>
                    </Alert>
                )}

                <DataTable
                    columns={noticeColumns}
                    data={notices}
                    searchColumn="tenant"
                    searchPlaceholder="Search by tenant..."
                    filters={[
                        {
                            column: "type",
                            title: "Type",
                            options: typeOptions.map((t) => ({
                                label: t.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
                                value: t,
                            })),
                        },
                        {
                            column: "status",
                            title: "Status",
                            options: statusOptions.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}