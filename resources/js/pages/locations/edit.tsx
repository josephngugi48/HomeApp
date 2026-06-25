// resources/js/pages/locations/edit.tsx
import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Location } from "@/types"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    location: Location
}

export default function EditLocationPage({ location }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: location.name || "",
        code: location.code || "",
        status: location.status || "Active",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/locations/${location.id}`)
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Locations", href: "/locations" },
                { title: "Edit Location", href: `/locations/${location.id}/edit` },
            ]}
        >
            <div className="flex flex-col gap-8 p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get('/locations')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Location</h1>
                        <p className="text-muted-foreground">
                            Update location details
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                                <CardDescription>
                                    Update the location's basic information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g., Nairobi"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g., NBO"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Location"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get('/locations')}
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