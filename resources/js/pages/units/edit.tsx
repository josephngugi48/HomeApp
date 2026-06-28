// resources/js/pages/units/edit.tsx
import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Unit } from "@/types"
import { ArrowLeft } from "lucide-react"

interface ApartmentOption {
    id: number
    name: string
    code: string
}

interface PageProps {
    unit: Unit
    apartments: ApartmentOption[]
    statusOptions: string[]
}

export default function EditUnitPage({ unit, apartments, statusOptions }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        apartment_id: String(unit.apartment_id ?? ""),
        unit_no: unit.unit_no || "",
        floor: unit.floor !== null ? String(unit.floor) : "",
        bedrooms: unit.bedrooms !== null ? String(unit.bedrooms) : "",
        rent: unit.rent ? String(unit.rent) : "",
        service_charge: unit.service_charge ? String(unit.service_charge) : "",
        status: unit.status || "Vacant",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/units/${unit.id}`, {
            transform: (formData: any) => ({
                ...formData,
                floor: formData.floor === "" ? null : formData.floor,
                bedrooms: formData.bedrooms === "" ? null : formData.bedrooms,
                service_charge: formData.service_charge === "" ? null : formData.service_charge,
            }),
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Units", href: "/units" },
                { title: "Edit Unit", href: `/units/${unit.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/units')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Unit</h1>
                        <p className="text-muted-foreground">Update unit number, pricing, and occupancy</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Unit Details</CardTitle>
                                <CardDescription>Update this unit's information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Apartment</Label>
                                    <Select
                                        value={data.apartment_id}
                                        onValueChange={(value) => setData('apartment_id', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {apartments.map((a) => (
                                                <SelectItem key={a.id} value={String(a.id)}>
                                                    {a.name} ({a.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.apartment_id && (
                                        <p className="text-sm text-destructive">{errors.apartment_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_no">Unit Number</Label>
                                    <Input
                                        id="unit_no"
                                        value={data.unit_no}
                                        onChange={e => setData('unit_no', e.target.value)}
                                    />
                                    {errors.unit_no && (
                                        <p className="text-sm text-destructive">{errors.unit_no}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="floor">Floor</Label>
                                        <Input
                                            id="floor"
                                            type="number"
                                            value={data.floor}
                                            onChange={e => setData('floor', e.target.value)}
                                        />
                                        {errors.floor && (
                                            <p className="text-sm text-destructive">{errors.floor}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms">Bedrooms</Label>
                                        <Input
                                            id="bedrooms"
                                            type="number"
                                            value={data.bedrooms}
                                            onChange={e => setData('bedrooms', e.target.value)}
                                        />
                                        {errors.bedrooms && (
                                            <p className="text-sm text-destructive">{errors.bedrooms}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rent">Rent (KES)</Label>
                                        <Input
                                            id="rent"
                                            type="number"
                                            step="0.01"
                                            value={data.rent}
                                            onChange={e => setData('rent', e.target.value)}
                                        />
                                        {errors.rent && (
                                            <p className="text-sm text-destructive">{errors.rent}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="service_charge">Service Charge (KES)</Label>
                                        <Input
                                            id="service_charge"
                                            type="number"
                                            step="0.01"
                                            value={data.service_charge}
                                            onChange={e => setData('service_charge', e.target.value)}
                                        />
                                        {errors.service_charge && (
                                            <p className="text-sm text-destructive">{errors.service_charge}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Occupancy Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Unit"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.get('/units')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}