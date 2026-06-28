// resources/js/pages/apartments/edit.tsx
import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Apartment } from "@/types"
import { ArrowLeft } from "lucide-react"

interface Option {
    id: number
    name: string
    code?: string
}

interface PageProps {
    apartment: Apartment
    locations: Option[]
    landlords: Option[]
    caretakers: Option[]
}

// 1. Define explicit form field types matching the hook state
interface ApartmentFormFields {
    name: string
    code: string
    location_id: string
    landlord_id: string
    caretaker_id: string
    status: "Active" | "Inactive"
}

export default function EditApartmentPage({ apartment, locations, landlords, caretakers }: PageProps) {
    // 2. Destructure 'transform' and supply the generic type
    const { data, setData, put, transform, processing, errors } = useForm<ApartmentFormFields>({
        name: apartment.name || "",
        code: apartment.code || "",
        location_id: String(apartment.location_id ?? ""),
        landlord_id: apartment.landlord_id ? String(apartment.landlord_id) : "",
        caretaker_id: apartment.caretaker_id ? String(apartment.caretaker_id) : "",
        status: apartment.status || "Active",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // 3. Chain transform before calling put()
        transform((formData) => ({
            ...formData,
            landlord_id: formData.landlord_id || null,
            caretaker_id: formData.caretaker_id || null,
        }))

        put(`/apartments/${apartment.id}`)
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Apartments", href: "/apartments" },
                { title: "Edit Apartment", href: `/apartments/${apartment.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/apartments')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Apartment</h1>
                        <p className="text-muted-foreground">Update property details and assignments</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Apartment Details</CardTitle>
                                <CardDescription>Update the apartment's information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase())}
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Select
                                        value={data.location_id}
                                        onValueChange={(value) => setData('location_id', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={String(loc.id)}>
                                                    {loc.name} {loc.code ? `(${loc.code})` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.location_id && (
                                        <p className="text-sm text-destructive">{errors.location_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Landlord</Label>
                                    <Select
                                        value={data.landlord_id}
                                        onValueChange={(value) => setData('landlord_id', value)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            {landlords.map((l) => (
                                                <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.landlord_id && (
                                        <p className="text-sm text-destructive">{errors.landlord_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Caretaker</Label>
                                    <Select
                                        value={data.caretaker_id}
                                        onValueChange={(value) => setData('caretaker_id', value)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            {caretakers.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.caretaker_id && (
                                        <p className="text-sm text-destructive">{errors.caretaker_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value: "Active" | "Inactive") => setData('status', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Apartment"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.get('/apartments')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}