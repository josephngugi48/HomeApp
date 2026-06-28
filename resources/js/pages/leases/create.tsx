// resources/js/pages/leases/create.tsx
import { useState } from "react"
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

interface TenantOption {
    id: number
    name: string
    email: string
}

interface UnitOption {
    id: number
    unit_no: string
    apartment_id: number
    apartment?: { id: number; name: string }
    rent: string
    service_charge: string | null
}

interface Props {
    tenants: TenantOption[]
    units: UnitOption[]
}

export default function CreateLease({ tenants, units }: Props) {
    const [selectedUnit, setSelectedUnit] = useState<UnitOption | null>(null)

    const { data, setData, post, processing, errors } = useForm({
        tenant_id: "",
        unit_id: "",
        start_date: "",
        end_date: "",
        rent: "",
        service_charge: "",
        deposit: "",
    })

    const handleUnitChange = (unitId: string) => {
        setData("unit_id", unitId)
        const unit = units.find((u) => String(u.id) === unitId) ?? null
        setSelectedUnit(unit)
        // Pre-fill from the unit's defaults — admin can still override.
        if (unit) {
            setData((prev) => ({
                ...prev,
                unit_id: unitId,
                rent: unit.rent,
                service_charge: unit.service_charge ?? "",
            }))
        }
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/leases", {
            transform: (formData) => ({
                ...formData,
                end_date: formData.end_date || null,
                service_charge: formData.service_charge || null,
                deposit: formData.deposit || null,
            }),
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Leases", href: "/leases" },
                { title: "Create Lease", href: "/leases/create" },
            ]}
        >
            <Head title="Create Lease" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create Lease</h1>
                        <p className="text-sm text-muted-foreground">
                            Link a tenant to a vacant unit
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/leases")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Creating..." : "Create Lease"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Lease Details</CardTitle>
                        <CardDescription>
                            Only units without an active lease are shown
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tenant *</Label>
                            <Select
                                value={data.tenant_id}
                                onValueChange={(value) => setData("tenant_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name} ({t.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tenant_id && (
                                <p className="text-sm text-destructive">{errors.tenant_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Unit *</Label>
                            <Select value={data.unit_id} onValueChange={handleUnitChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a vacant unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.length === 0 && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No vacant units available
                                        </div>
                                    )}
                                    {units.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.unit_no} — {u.apartment?.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.unit_id && (
                                <p className="text-sm text-destructive">{errors.unit_id}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date *</Label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={e => setData("start_date", e.target.value)}
                                />
                                {errors.start_date && (
                                    <p className="text-sm text-destructive">{errors.start_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={e => setData("end_date", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank for an open-ended lease
                                </p>
                                {errors.end_date && (
                                    <p className="text-sm text-destructive">{errors.end_date}</p>
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
                                />
                                {selectedUnit && (
                                    <p className="text-xs text-muted-foreground">
                                        Unit's listed rent: KES {Number(selectedUnit.rent).toLocaleString()}
                                    </p>
                                )}
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
                                />
                                {errors.service_charge && (
                                    <p className="text-sm text-destructive">{errors.service_charge}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Deposit (KES)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.deposit}
                                onChange={e => setData("deposit", e.target.value)}
                            />
                            {errors.deposit && (
                                <p className="text-sm text-destructive">{errors.deposit}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}