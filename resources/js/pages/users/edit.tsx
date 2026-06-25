import * as React from "react"
import { useForm } from "@inertiajs/react"
import { router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from "@/types/user"
import { ArrowLeft } from "lucide-react"

interface Role {
    id: number
    name: string
}

interface Status {
    id: number
    name: string
    color: string
}

interface PageProps {
    user: User & { roles: Role[] }
    roles: Role[]
    statuses: Status[]
}

export default function EditUserPage({ user, roles, statuses }: PageProps) {
    const { data, setData, put, processing, errors }: any = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        status_id: user.status_id || "",
        roles: user.roles.map(role => role.id) || [],
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/users/${user.id}`)
    }

    const handleRoleToggle = (roleId: number) => {
        setData('roles',
            data.roles.includes(roleId)
                ? data.roles.filter((id: any) => id !== roleId)
                : [...data.roles, roleId]
        )
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Users", href: "/users" },
                { title: "Edit User", href: `/users/${user.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get('/users')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-muted-foreground">
                            Update user information and roles
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Update the user's basic details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status_id.toString()}
                                        onValueChange={(value) => setData('status_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem
                                                    key={status.id}
                                                    value={status.id.toString()}
                                                >
                                                    <span
                                                        className="inline-block w-2 h-2 rounded-full mr-2"
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                    {status.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status_id && (
                                        <p className="text-sm text-destructive">{errors.status_id}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Update */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Leave blank to keep the current password
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Password */}
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

                                {/* Confirm Password */}
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

                        {/* Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Roles</CardTitle>
                                <CardDescription>
                                    Assign roles to this user
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.roles.includes(role.id)}
                                                onCheckedChange={() => handleRoleToggle(role.id)}
                                            />
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="text-sm font-normal cursor-pointer capitalize"
                                            >
                                                {role.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-destructive mt-2">{errors.roles}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update User"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get('/users')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}