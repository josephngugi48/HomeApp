// resources/js/pages/locations/index.tsx
import * as React from "react"
import { DataTable } from "@/components/table/data-table"
import { locationColumns } from "@/pages/locations/columns"
import { DataTableResponse, Location } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    locations: DataTableResponse<Location>
    filters?: {
        search?: string
        status?: string
        sort_by?: string
        sort_direction?: 'asc' | 'desc'
    }
    can: {
        create: boolean
    }
}

export default function LocationsIndexPage({ locations, can }: PageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Locations", href: "/locations" },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                        <p className="text-muted-foreground">
                            Cities and regions where you manage properties
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/locations/create')}>
                            <Plus className="h-4 w-4" />
                            New Location
                        </Button>
                    )}
                </div>

                {/* Data Table */}
                <DataTable
                    columns={locationColumns}
                    data={locations}
                    searchColumn="name"
                    searchPlaceholder="Search locations..."
                    filters={[
                        {
                            column: "status",
                            title: "Status",
                            options: [
                                { label: "Active", value: "Active", icon: MapPin },
                                { label: "Inactive", value: "Inactive", icon: MapPin },
                            ],
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}