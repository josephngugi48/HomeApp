// resources/js/pages/issues/create.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyUserOption } from "@/types"

interface Props {
    tenants: CompanyUserOption[]
    caretakers: CompanyUserOption[]
    categoryOptions: string[]
}

export default function CreateIssue({ tenants, caretakers, categoryOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tenant_id: "",
        category: categoryOptions[0] ?? "general",
        title: "",
        body: "",
        assignee_id: "",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/issues", {
            transform: (formData) => ({ ...formData, assignee_id: formData.assignee_id || null }),
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Tenant Issues", href: "/issues" }, { title: "Log Issue", href: "/issues/create" }]}>
            <Head title="Log Issue" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Log Issue</h1>
                        <p className="text-sm text-muted-foreground">Record a complaint or concern on behalf of a tenant</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/issues")}>Cancel</Button>
                        <Button onClick={submit} disabled={processing}>{processing ? "Saving..." : "Log Issue"}</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Issue Details</CardTitle>
                        <CardDescription>Tenant, category, and description</CardDescription>
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
                            <Label>Title *</Label>
                            <Input value={data.title} onChange={e => setData("title", e.target.value)} placeholder="Short summary" />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                rows={5}
                                value={data.body}
                                onChange={e => setData("body", e.target.value)}
                                placeholder="Full details of the issue"
                            />
                            {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}