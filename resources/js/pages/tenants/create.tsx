// resources/js/pages/tenants/create.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"

export default function CreateTenant() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        national_id: "",
        kra_pin: "",
        date_of_birth: "",
        marital_status: "",
        next_of_kin_name: "",
        next_of_kin_phone: "",
        next_of_kin_relationship: "",
        next_of_kin_address: "",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/tenants")
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Tenants", href: "/tenants" },
                { title: "Create Tenant", href: "/tenants/create" },
            ]}
        >
            <Head title="Create Tenant" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create Tenant</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new tenant account and profile
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/tenants")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Creating..." : "Create Tenant"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl px-6 py-4">
                {/* Account */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Login credentials and contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Full Name *</Label>
                            <Input
                                value={data.name}
                                onChange={e => setData("name", e.target.value)}
                                placeholder="e.g., Joseph M Ngugi"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={e => setData("email", e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={data.phone}
                                onChange={e => setData("phone", e.target.value)}
                                placeholder="07XXXXXXXX"
                            />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={e => setData("password", e.target.value)}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Confirm Password *</Label>
                            <Input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData("password_confirmation", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Identification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identification</CardTitle>
                        <CardDescription>Required for tenancy records</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>National ID / Passport No. *</Label>
                            <Input
                                value={data.national_id}
                                onChange={e => setData("national_id", e.target.value)}
                            />
                            {errors.national_id && (
                                <p className="text-sm text-destructive">{errors.national_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>KRA PIN</Label>
                            <Input
                                value={data.kra_pin}
                                onChange={e => setData("kra_pin", e.target.value)}
                            />
                            {errors.kra_pin && <p className="text-sm text-destructive">{errors.kra_pin}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={data.date_of_birth}
                                onChange={e => setData("date_of_birth", e.target.value)}
                            />
                            {errors.date_of_birth && (
                                <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Marital Status</Label>
                            <Input
                                value={data.marital_status}
                                onChange={e => setData("marital_status", e.target.value)}
                                placeholder="Single, Married, etc."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Next of Kin */}
                <Card>
                    <CardHeader>
                        <CardTitle>Next of Kin</CardTitle>
                        <CardDescription>Optional emergency contact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={data.next_of_kin_name}
                                onChange={e => setData("next_of_kin_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={data.next_of_kin_phone}
                                onChange={e => setData("next_of_kin_phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Input
                                value={data.next_of_kin_relationship}
                                onChange={e => setData("next_of_kin_relationship", e.target.value)}
                                placeholder="e.g., Spouse, Parent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={data.next_of_kin_address}
                                onChange={e => setData("next_of_kin_address", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}