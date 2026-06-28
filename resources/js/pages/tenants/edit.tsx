// resources/js/pages/tenants/edit.tsx
import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tenant } from "@/types"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    tenant: Tenant
}

export default function EditTenantPage({ tenant }: PageProps) {
    const profile = tenant.tenant_profile

    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: "",
        password: "",
        password_confirmation: "",
        national_id: profile?.national_id || "",
        kra_pin: profile?.kra_pin || "",
        date_of_birth: profile?.date_of_birth || "",
        marital_status: profile?.marital_status || "",
        next_of_kin_name: profile?.next_of_kin_name || "",
        next_of_kin_phone: profile?.next_of_kin_phone || "",
        next_of_kin_relationship: profile?.next_of_kin_relationship || "",
        next_of_kin_address: profile?.next_of_kin_address || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/tenants/${tenant.id}`, {
            transform: (formData: any) => ({
                ...formData,
                date_of_birth: formData.date_of_birth || null,
                kra_pin: formData.kra_pin || null,
                marital_status: formData.marital_status || null,
                phone: formData.phone || null,
                next_of_kin_name: formData.next_of_kin_name || null,
                next_of_kin_phone: formData.next_of_kin_phone || null,
                next_of_kin_relationship: formData.next_of_kin_relationship || null,
                next_of_kin_address: formData.next_of_kin_address || null,
                // Don't send empty password fields — backend treats blank as "no change"
                password: formData.password || undefined,
                password_confirmation: formData.password_confirmation || undefined,
            }),
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Tenants", href: "/tenants" },
                { title: "Edit Tenant", href: `/tenants/${tenant.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/tenants')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Tenant</h1>
                        <p className="text-muted-foreground">Update account and profile information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Account</CardTitle>
                                <CardDescription>
                                    Leave password blank to keep the current one
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Identification</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="national_id">National ID / Passport No.</Label>
                                    <Input
                                        id="national_id"
                                        value={data.national_id}
                                        onChange={e => setData('national_id', e.target.value)}
                                    />
                                    {errors.national_id && (
                                        <p className="text-sm text-destructive">{errors.national_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kra_pin">KRA PIN</Label>
                                    <Input
                                        id="kra_pin"
                                        value={data.kra_pin}
                                        onChange={e => setData('kra_pin', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="marital_status">Marital Status</Label>
                                    <Input
                                        id="marital_status"
                                        value={data.marital_status}
                                        onChange={e => setData('marital_status', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Next of Kin</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_name">Full Name</Label>
                                    <Input
                                        id="next_of_kin_name"
                                        value={data.next_of_kin_name}
                                        onChange={e => setData('next_of_kin_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_phone">Phone</Label>
                                    <Input
                                        id="next_of_kin_phone"
                                        value={data.next_of_kin_phone}
                                        onChange={e => setData('next_of_kin_phone', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_relationship">Relationship</Label>
                                    <Input
                                        id="next_of_kin_relationship"
                                        value={data.next_of_kin_relationship}
                                        onChange={e => setData('next_of_kin_relationship', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_address">Address</Label>
                                    <Input
                                        id="next_of_kin_address"
                                        value={data.next_of_kin_address}
                                        onChange={e => setData('next_of_kin_address', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Tenant"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.get('/tenants')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}