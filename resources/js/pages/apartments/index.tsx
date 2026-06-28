// resources/js/pages/apartments/index.tsx
import { DataTable } from "@/components/table/data-table"
import { apartmentColumns } from "@/pages/apartments/columns"
import { Apartment, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationOption {
    id: number
    name: string
    code: string
}

interface PageProps {
    apartments: DataTableResponse<Apartment>
    locationOptions: LocationOption[]
    can: { create: boolean }
}

export default function ApartmentsIndexPage({ apartments, locationOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Apartments", href: "/apartments" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Apartments</h1>
                        <p className="text-muted-foreground">
                            Manage your properties and their landlords/caretakers
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/apartments/create')}>
                            <Plus className="h-4 w-4" />
                            New Apartment
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={apartmentColumns}
                    data={apartments}
                    searchColumn="name"
                    searchPlaceholder="Search apartments..."
                    filters={[
                        {
                            column: "location_id",
                            title: "Location",
                            options: locationOptions.map((loc) => ({
                                label: loc.name,
                                value: String(loc.id),
                                icon: Building2,
                            })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}