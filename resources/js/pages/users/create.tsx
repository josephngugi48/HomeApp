import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface Role {
    id: number
    name: string
}

interface Status {
    id: number
    name: string
    color: string
}

interface Props {
    roles: Role[]
    statuses: Status[]
}

export default function CreateUser({ roles, statuses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        status_id: statuses[0]?.id ?? null,
        roles: [] as number[],
    })

    const toggleRole = (id: number) => {
        setData(
            "roles",
            data.roles.includes(id)
                ? data.roles.filter(r => r !== id)
                : [...data.roles, id]
        )
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/users")
    }

    return (
        <AppLayout>
            <Head title="Create User" />

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create User</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new user and assign roles
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.get("/users")}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 py-4">
                {/* Sidebar - User Details */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>
                                Basic account information
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData("email", e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Password *</Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData("password", e.target.value)}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Confirm Password *</Label>
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData("password_confirmation", e.target.value)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={data.status_id ?? ""}
                                    onChange={e => setData("status_id", Number(e.target.value))}
                                >
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Roles */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Assign roles to the user
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {roles.map(role => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                                    >
                                        <Checkbox
                                            checked={data.roles.includes(role.id)}
                                            onCheckedChange={() => toggleRole(role.id)}
                                        />
                                        <span className="text-sm font-medium capitalize">
                                            {role.name}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {errors.roles && (
                                <p className="text-sm text-destructive mt-3">
                                    {errors.roles}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
