// resources/js/pages/maintenance/create.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { CompanyUserOption } from "@/types"

interface Props {
    tenants: CompanyUserOption[]
    caretakers: CompanyUserOption[]
    categoryOptions: string[]
    priorityOptions: string[]
}

export default function CreateMaintenanceRequest({ tenants, caretakers, categoryOptions, priorityOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        tenant_id: string
        category: string
        priority: string
        description: string
        assignee_id: string
        photos: File[]
    }>({
        tenant_id: "",
        category: categoryOptions[0] ?? "general",
        priority: "medium",
        description: "",
        assignee_id: "",
        photos: [],
    })

    const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 6)
        setData("photos", files)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/maintenance", {
            forceFormData: true, // required for file uploads — useForm needs this to send multipart/form-data
            transform: (formData: any) => ({ ...formData, assignee_id: formData.assignee_id || null }),
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Maintenance", href: "/maintenance" }, { title: "Log Request", href: "/maintenance/create" }]}>
            <Head title="Log Maintenance Request" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Log Maintenance Request</h1>
                        <p className="text-sm text-muted-foreground">Record a repair request on behalf of a tenant</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/maintenance")}>Cancel</Button>
                        <Button onClick={submit} disabled={processing}>{processing ? "Saving..." : "Log Request"}</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        <CardDescription>Tenant, category, priority, and photos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tenant *</Label>
                            <Select value={data.tenant_id} onValueChange={(v) => setData("tenant_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Select a tenant" /></SelectTrigger>
                                <SelectContent>
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tenant_id && <p className="text-sm text-destructive">{errors.tenant_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select value={data.category} onValueChange={(v) => setData("category", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((c) => (
                                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Priority *</Label>
                                <Select value={data.priority} onValueChange={(v) => setData("priority", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((p) => (
                                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                rows={5}
                                value={data.description}
                                onChange={e => setData("description", e.target.value)}
                                placeholder="Describe the issue in detail"
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={data.assignee_id} onValueChange={(v) => setData("assignee_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                <SelectContent>
                                    {caretakers.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.assignee_id && <p className="text-sm text-destructive">{errors.assignee_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Before Photos</Label>
                            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-accent/30">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {data.photos.length > 0 ? `${data.photos.length} photo(s) selected` : "Click to upload (max 6, 5MB each)"}
                                </span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                            </label>
                            {errors.photos && <p className="text-sm text-destructive">{errors.photos}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}