// resources/js/pages/units/create.tsx
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

interface ApartmentOption {
    id: number
    name: string
    code: string
}

interface Props {
    apartments: ApartmentOption[]
    statusOptions: string[]
}

export default function CreateUnit({ apartments, statusOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        apartment_id: "",
        unit_no: "",
        floor: "",
        bedrooms: "",
        rent: "",
        service_charge: "",
        status: statusOptions[1] ?? "Vacant", // default to "Vacant"
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/units")
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Units", href: "/units" },
                { title: "Create Unit", href: "/units/create" },
            ]}
        >
            <Head title="Create Unit" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new house unit to an apartment
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/units")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Creating..." : "Create Unit"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Details</CardTitle>
                        <CardDescription>Numbering, pricing, and occupancy</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Apartment *</Label>
                            <Select
                                value={data.apartment_id}
                                onValueChange={(value) => setData("apartment_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an apartment" />
                                </SelectTrigger>
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
                            <Label>Unit Number *</Label>
                            <Input
                                value={data.unit_no}
                                onChange={e => setData("unit_no", e.target.value)}
                                placeholder="e.g., A05"
                            />
                            {errors.unit_no && (
                                <p className="text-sm text-destructive">{errors.unit_no}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Floor</Label>
                                <Input
                                    type="number"
                                    value={data.floor}
                                    onChange={e => setData("floor", e.target.value)}
                                    placeholder="0"
                                />
                                {errors.floor && (
                                    <p className="text-sm text-destructive">{errors.floor}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Bedrooms</Label>
                                <Input
                                    type="number"
                                    value={data.bedrooms}
                                    onChange={e => setData("bedrooms", e.target.value)}
                                    placeholder="1"
                                />
                                {errors.bedrooms && (
                                    <p className="text-sm text-destructive">{errors.bedrooms}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rent (KES) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.rent}
                                    onChange={e => setData("rent", e.target.value)}
                                    placeholder="23000"
                                />
                                {errors.rent && (
                                    <p className="text-sm text-destructive">{errors.rent}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Service Charge (KES)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.service_charge}
                                    onChange={e => setData("service_charge", e.target.value)}
                                    placeholder="1500"
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
                                onValueChange={(value) => setData("status", value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                This will be automatically managed once leases are tracked.
                            </p>
                            {errors.status && (
                                <p className="text-sm text-destructive">{errors.status}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}