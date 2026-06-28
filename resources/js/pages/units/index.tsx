// resources/js/pages/units/index.tsx
import { DataTable } from "@/components/table/data-table"
import { unitColumns } from "@/pages/units/columns"
import { Unit, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { DoorOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApartmentOption {
    id: number
    name: string
    code: string
}

interface PageProps {
    units: DataTableResponse<Unit>
    apartmentOptions: ApartmentOption[]
    statusOptions: string[]
    can: { create: boolean }
}

export default function UnitsIndexPage({ units, apartmentOptions, statusOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Units", href: "/units" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">House Units</h1>
                        <p className="text-muted-foreground">
                            Individual units with rent, service charges, and occupancy
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/units/create')}>
                            <Plus className="h-4 w-4" />
                            New Unit
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={unitColumns}
                    data={units}
                    searchColumn="unit_no"
                    searchPlaceholder="Search by unit number or apartment..."
                    filters={[
                        {
                            column: "apartment_id",
                            title: "Apartment",
                            options: apartmentOptions.map((a) => ({
                                label: a.name,
                                value: String(a.id),
                                icon: DoorOpen,
                            })),
                        },
                        {
                            column: "status",
                            title: "Occupancy",
                            options: statusOptions.map((s) => ({ label: s, value: s })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}