// resources/js/pages/payments/create.tsx
import { useMemo } from "react"
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
import { PayableInvoice } from "@/types"

interface Props {
    invoices: PayableInvoice[]
}

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value))

export default function CreatePayment({ invoices }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: "",
        amount: "",
        method: "cash",
        external_ref: "",
        paid_at: new Date().toISOString().slice(0, 10),
    })

    const selectedInvoice = useMemo(
        () => invoices.find((i) => String(i.id) === data.invoice_id) ?? null,
        [data.invoice_id, invoices]
    )

    const handleInvoiceChange = (invoiceId: string) => {
        setData("invoice_id", invoiceId)
        const invoice = invoices.find((i) => String(i.id) === invoiceId)
        if (invoice) {
            setData("amount", invoice.balance)
        }
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/payments", {
            transform: (formData) => ({
                ...formData,
                external_ref: formData.external_ref || null,
            }),
        })
    }

    const overpaying = selectedInvoice && Number(data.amount) > Number(selectedInvoice.balance)

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Payments", href: "/payments" },
                { title: "Record Payment", href: "/payments/create" },
            ]}
        >
            <Head title="Record Payment" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Record Payment</h1>
                        <p className="text-sm text-muted-foreground">
                            Manually record a bank transfer or cash payment
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/payments")}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Recording..." : "Record Payment"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl px-6 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                            For M-Pesa payments, use the tenant's portal STK push instead — this form is for bank and cash only
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Invoice *</Label>
                            <Select value={data.invoice_id} onValueChange={handleInvoiceChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an outstanding invoice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {invoices.length === 0 && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No outstanding invoices
                                        </div>
                                    )}
                                    {invoices.map((inv) => (
                                        <SelectItem key={inv.id} value={String(inv.id)}>
                                            {inv.number} — {inv.tenant?.name} (Bal: {formatKES(inv.balance)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.invoice_id && (
                                <p className="text-sm text-destructive">{errors.invoice_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Amount (KES) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={e => setData("amount", e.target.value)}
                            />
                            {selectedInvoice && (
                                <p className="text-xs text-muted-foreground">
                                    Outstanding balance: {formatKES(selectedInvoice.balance)}
                                </p>
                            )}
                            {overpaying && (
                                <p className="text-xs text-amber-600">
                                    This exceeds the invoice balance — the invoice will show a credit.
                                </p>
                            )}
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Method *</Label>
                            <Select value={data.method} onValueChange={(value) => setData("method", value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.method && (
                                <p className="text-sm text-destructive">{errors.method}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>External Reference</Label>
                            <Input
                                value={data.external_ref}
                                onChange={e => setData("external_ref", e.target.value)}
                                placeholder="e.g., bank transaction ID"
                            />
                            {errors.external_ref && (
                                <p className="text-sm text-destructive">{errors.external_ref}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Date Paid *</Label>
                            <Input
                                type="date"
                                value={data.paid_at}
                                onChange={e => setData("paid_at", e.target.value)}
                            />
                            {errors.paid_at && (
                                <p className="text-sm text-destructive">{errors.paid_at}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}