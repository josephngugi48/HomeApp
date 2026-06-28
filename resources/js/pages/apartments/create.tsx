// resources/js/pages/apartments/create.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Option {
    id: number
    name: string
    code?: string
    email?: string
}

interface Props {
    locations: Option[]
    landlords: Option[]
    caretakers: Option[]
}

// 1. Explicitly define the form fields type
interface ApartmentFormFields {
    name: string
    code: string
    location_id: string
    landlord_id: string
    caretaker_id: string
    status: "Active" | "Inactive"
}

export default function CreateApartment({ locations, landlords, caretakers }: Props) {
    // 2. Add the type to useForm and extract the 'transform' method
    const { data, setData, post, transform, processing, errors } = useForm<ApartmentFormFields>({
        name: "",
        code: "",
        location_id: "",
        landlord_id: "",
        caretaker_id: "",
        status: "Active",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        // 3. Call transform before calling post to mutate the submitted payload safely
        transform((formData) => ({
            ...formData,
            landlord_id: formData.landlord_id || null,
            caretaker_id: formData.caretaker_id || null,
        }))

        post("/apartments")
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Apartments", href: "/apartments" },
                { title: "Create Apartment", href: "/apartments/create" },
            ]}
        >
            <Head title="Create Apartment" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create Apartment</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new property to your portfolio
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/apartments")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Creating..." : "Create Apartment"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Apartment Details</CardTitle>
                        <CardDescription>Basic information and assignments</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={data.name}
                                onChange={e => setData("name", e.target.value)}
                                placeholder="e.g., Jubilee Apartments — Westlands"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Code *</Label>
                            <Input
                                value={data.code}
                                onChange={e => setData("code", e.target.value.toUpperCase())}
                                placeholder="e.g., JUB-WLD"
                            />
                            {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Location *</Label>
                            <Select
                                value={data.location_id}
                                onValueChange={(value) => setData("location_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={String(loc.id)}>
                                            {loc.name} ({loc.code})
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
                                onValueChange={(value) => setData("landlord_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    {landlords.map((l) => (
                                        <SelectItem key={l.id} value={String(l.id)}>
                                            {l.name}
                                        </SelectItem>
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
                                onValueChange={(value) => setData("caretaker_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    {caretakers.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.caretaker_id && (
                                <p className="text-sm text-destructive">{errors.caretaker_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(value: "Active" | "Inactive") => setData("status", value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}