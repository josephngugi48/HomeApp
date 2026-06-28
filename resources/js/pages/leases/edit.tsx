// resources/js/pages/leases/edit.tsx
import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lease } from "@/types"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    lease: Lease
}

export default function EditLeasePage({ lease }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        start_date: lease.start_date?.slice(0, 10) || "",
        end_date: lease.end_date?.slice(0, 10) || "",
        rent: lease.rent || "",
        service_charge: lease.service_charge || "",
        deposit: lease.deposit || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/leases/${lease.id}`, {
            transform: (formData: any) => ({
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
                { title: "Edit Lease", href: `/leases/${lease.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/leases')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Lease Terms</h1>
                        <p className="text-muted-foreground">
                            {lease.tenant?.name} — Unit {lease.unit?.unit_no}
                        </p>
                    </div>
                </div>

                <div className="rounded-md border bg-muted/30 px-4 py-3 max-w-2xl text-sm text-muted-foreground">
                    Tenant and unit cannot be changed here. To move this tenant to a
                    different unit, terminate this lease and create a new one.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lease Terms</CardTitle>
                                <CardDescription>Dates and financial terms</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={e => setData('start_date', e.target.value)}
                                        />
                                        {errors.start_date && (
                                            <p className="text-sm text-destructive">{errors.start_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={e => setData('end_date', e.target.value)}
                                        />
                                        {errors.end_date && (
                                            <p className="text-sm text-destructive">{errors.end_date}</p>
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
                                    <Label htmlFor="deposit">Deposit (KES)</Label>
                                    <Input
                                        id="deposit"
                                        type="number"
                                        step="0.01"
                                        value={data.deposit}
                                        onChange={e => setData('deposit', e.target.value)}
                                    />
                                    {errors.deposit && (
                                        <p className="text-sm text-destructive">{errors.deposit}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Lease"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.get('/leases')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}