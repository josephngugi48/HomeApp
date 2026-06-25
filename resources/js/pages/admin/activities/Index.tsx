import * as React from "react"
import { DataTable } from "@/components/table/data-table"
import { activityColumns } from "./columns"
import { DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { History, Search, Terminal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    activities: DataTableResponse<any>
    telescope_url?: string | null
    log_viewer_url?: string | null
}

export default function ActivitiesPage({ activities, telescope_url, log_viewer_url }: PageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Dashboard", href: "/dashboard" },
                { title: "Activity Log", href: "/admin/activity-log" },
            ]}
        >
            <div className="flex flex-col gap-8 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Review and search every action performed in the system.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {telescope_url && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(telescope_url, '_blank')}
                                className="gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Telescope
                                <ExternalLink className="h-3 w-3 opacity-50" />
                            </Button>
                        )}
                        {log_viewer_url && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(log_viewer_url, '_blank')}
                                className="gap-2"
                            >
                                <Terminal className="h-4 w-4" />
                                Log Viewer
                                <ExternalLink className="h-3 w-3 opacity-50" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={activityColumns}
                    data={activities}
                    searchColumn="description"
                    searchPlaceholder="Search events..."
                />
            </div>
        </AppLayout>
    )
}
