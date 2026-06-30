// resources/js/pages/broadcasts/index.tsx
import { DataTable } from "@/components/table/data-table"
import { broadcastColumns } from "@/pages/broadcasts/columns"
import { BroadcastRecord, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Megaphone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    broadcasts: DataTableResponse<BroadcastRecord>
    can: { create: boolean }
}

export default function BroadcastsIndexPage({ broadcasts, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Broadcasts", href: "/broadcasts" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Broadcasts</h1>
                        <p className="text-muted-foreground">
                            Send announcements via SMS, Email, and WhatsApp
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/broadcasts/create')}>
                            <Megaphone className="h-4 w-4" /> New Broadcast
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={broadcastColumns}
                    data={broadcasts}
                    searchColumn="title"
                    searchPlaceholder="Search broadcasts..."
                />
            </div>
        </AppLayout>
    )
}