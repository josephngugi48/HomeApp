// resources/js/pages/invoices/create.tsx
import { useMemo, useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"

interface LeaseOption {
    id: number
    tenant_id: number
    unit_id: number
    rent: string
    service_charge: string | null
    tenant?: { id: number; name: string; email: string }
    unit?: { id: number; unit_no: string; apartment?: { id: number; name: string } }
}

interface LineItem {
    type: string
    description: string
    quantity: string
    unit_price: string
}

interface Props {
    leases: LeaseOption[]
    itemTypes: string[]
}

const formatKES = (n: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n)

export default function CreateInvoice({ leases, itemTypes }: Props) {
    const [items, setItems] = useState<LineItem[]>([])

    const { data, setData, post, processing, errors } = useForm({
        lease_id: "",
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: "",
        amount_already_paid: "",
    })

    const selectedLease = useMemo(
        () => leases.find((l) => String(l.id) === data.lease_id) ?? null,
        [data.lease_id, leases]
    )

    const handleLeaseChange = (leaseId: string) => {
        setData("lease_id", leaseId)
        const lease = leases.find((l) => String(l.id) === leaseId)
        if (lease) {
            const prefilled: LineItem[] = [
                { type: "rent", description: "Rent", quantity: "1", unit_price: lease.rent },
            ]
            if (lease.service_charge && Number(lease.service_charge) > 0) {
                prefilled.push({
                    type: "service",
                    description: "Service Charge",
                    quantity: "1",
                    unit_price: lease.service_charge,
                })
            }
            setItems(prefilled)
        }
    }

    const addItem = () => {
        setItems((prev) => [...prev, { type: itemTypes[0] ?? "misc", description: "", quantity: "1", unit_price: "" }])
    }

    const updateItem = (index: number, patch: Partial<LineItem>) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    }

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index))
    }

    const total = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        const price = Number(item.unit_price) || 0
        return sum + qty * price
    }, 0)

    const alreadyPaid = Number(data.amount_already_paid) || 0
    const startingBalance = Math.max(0, total - alreadyPaid)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/invoices", {
            transform: (formData) => ({
                ...formData,
                amount_already_paid: formData.amount_already_paid || null,
                items,
            }),
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Invoices", href: "/invoices" },
                { title: "Generate Invoice", href: "/invoices/create" },
            ]}
        >
            <Head title="Generate Invoice" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Generate Invoice</h1>
                        <p className="text-sm text-muted-foreground">
                            Select an active lease to auto-fill rent and service charge
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/invoices")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing || items.length === 0}>
                            {processing ? "Generating..." : "Generate Invoice"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl px-6 py-4">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lease & Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Active Lease *</Label>
                                <Select value={data.lease_id} onValueChange={handleLeaseChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an active lease" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leases.map((l) => (
                                            <SelectItem key={l.id} value={String(l.id)}>
                                                {l.tenant?.name} — {l.unit?.unit_no} ({l.unit?.apartment?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.lease_id && (
                                    <p className="text-sm text-destructive">{errors.lease_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issue Date *</Label>
                                    <Input
                                        type="date"
                                        value={data.issue_date}
                                        onChange={e => setData("issue_date", e.target.value)}
                                    />
                                    {errors.issue_date && (
                                        <p className="text-sm text-destructive">{errors.issue_date}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date *</Label>
                                    <Input
                                        type="date"
                                        value={data.due_date}
                                        onChange={e => setData("due_date", e.target.value)}
                                    />
                                    {errors.due_date && (
                                        <p className="text-sm text-destructive">{errors.due_date}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Line Items</CardTitle>
                                <CardDescription>Rent and service charge are pre-filled from the lease</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.length === 0 && (
                                <p className="text-sm text-muted-foreground py-6 text-center">
                                    Select a lease above, or add an item manually.
                                </p>
                            )}
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-start border-b pb-3 last:border-0">
                                    <div className="col-span-2">
                                        <Select
                                            value={item.type}
                                            onValueChange={(value) => updateItem(index, { type: value })}
                                        >
                                            <SelectTrigger className="capitalize">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemTypes.map((t) => (
                                                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={e => updateItem(index, { description: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, { quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Unit Price"
                                            value={item.unit_price}
                                            onChange={e => updateItem(index, { unit_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {errors.items && (
                                <p className="text-sm text-destructive">{errors.items}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Amount Already Paid (KES)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.amount_already_paid}
                                    onChange={e => setData("amount_already_paid", e.target.value)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Manual opening adjustment only — not linked to wallet records.
                                </p>
                                {errors.amount_already_paid && (
                                    <p className="text-sm text-destructive">{errors.amount_already_paid}</p>
                                )}
                            </div>
                            
                            {selectedLease && walletBalances[selectedLease.tenant_id] > 0 && (
                                <div className="flex justify-between text-success">
                                    <span>Wallet Credit (auto-applied)</span>
                                    <span>-{formatKES(Math.min(walletBalances[selectedLease.tenant_id], total - alreadyPaid))}</span>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-medium">{formatKES(total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Already Paid</span>
                                    <span>-{formatKES(alreadyPaid)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold">Starting Balance</span>
                                    <span className="font-semibold">{formatKES(startingBalance)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}