// resources/js/pages/notices/create.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaseOption {
    id: number
    tenant?: { id: number; name: string }
    unit?: { id: number; unit_no: string }
}

interface Props {
    leases: LeaseOption[]
    typeOptions: string[]
}

const typeLabel: Record<string, string> = {
    vacating: "Vacating",
    lease_renewal: "Lease Renewal",
    lease_termination: "Lease Termination",
}

export default function CreateNotice({ leases, typeOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        lease_id: "",
        type: typeOptions[0] ?? "vacating",
        effective_at: "",
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/notices")
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Tenancy Notices", href: "/notices" }, { title: "Record Notice", href: "/notices/create" }]}>
            <Head title="Record Notice" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Record Notice</h1>
                        <p className="text-sm text-muted-foreground">Log a notice submitted by a tenant</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/notices")}>Cancel</Button>
                        <Button onClick={submit} disabled={processing}>{processing ? "Saving..." : "Record Notice"}</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Notice Details</CardTitle>
                        <CardDescription>This does not change the lease itself — it's a record of intent</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Lease *</Label>
                            <Select value={data.lease_id} onValueChange={(v) => setData("lease_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Select an active lease" /></SelectTrigger>
                                <SelectContent>
                                    {leases.map((l) => (
                                        <SelectItem key={l.id} value={String(l.id)}>
                                            {l.tenant?.name} — Unit {l.unit?.unit_no}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.lease_id && <p className="text-sm text-destructive">{errors.lease_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Notice Type *</Label>
                            <Select value={data.type} onValueChange={(v) => setData("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((t) => (
                                        <SelectItem key={t} value={t}>{typeLabel[t]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Effective Date *</Label>
                            <Input
                                type="date"
                                value={data.effective_at}
                                onChange={e => setData("effective_at", e.target.value)}
                            />
                            {data.type === "vacating" && (
                                <p className="text-xs text-muted-foreground">
                                    Once this date arrives, the notice will appear in the "action needed" list — staff
                                    will need to manually terminate the lease.
                                </p>
                            )}
                            {errors.effective_at && <p className="text-sm text-destructive">{errors.effective_at}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}