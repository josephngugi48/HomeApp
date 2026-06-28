// resources/js/pages/payments/pay.tsx
import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, CheckCircle2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Props {
    invoice: {
        id: number
        number: string
        total: string
        balance: string
    }
    tenantPhone?: string
}

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value))

export default function PayInvoice({ invoice, tenantPhone }: Props) {
    const [phone, setPhone] = useState(tenantPhone ?? "")
    const [amount, setAmount] = useState(invoice.balance)
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        router.post(
            "/mpesa/stk-push",
            { invoice_id: invoice.id, phone, amount },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSent(true)
                    toast.success("Check your phone to complete the payment")
                },
                onError: (errors) => {
                    const message = (errors as any)?.error || "Could not initiate the payment. Please try again."
                    setError(message)
                    toast.error(message)
                },
                onFinish: () => setLoading(false),
            }
        )
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Invoices", href: "/invoices" }, { title: "Pay", href: "#" }]}>
            <Head title="Pay Invoice" />

            <div className="mx-auto max-w-2xl p-8">
                <Button variant="ghost" onClick={() => router.get(`/invoices/${invoice.id}`)} className="mb-6 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Invoice
                </Button>

                <Card className="overflow-hidden">
                    <div className="bg-primary p-6 text-center text-primary-foreground sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                            {invoice.number}
                        </p>
                        <p className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                            {formatKES(invoice.balance)}
                        </p>
                        <p className="mt-1 text-sm text-primary-foreground/80">Outstanding balance</p>
                    </div>

                    {sent ? (
                        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-8 sm:py-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                                <CheckCircle2 className="h-9 w-9 text-success" />
                            </div>
                            <h2 className="mt-5 text-2xl font-semibold">Check your phone</h2>
                            <p className="mt-2 max-w-sm text-muted-foreground">
                                We've sent an M-Pesa prompt to <span className="font-medium text-foreground">{phone}</span>.
                                Enter your PIN to complete the payment of {formatKES(amount)}.
                            </p>
                            <p className="mt-4 text-xs text-muted-foreground">
                                This page won't auto-update — refresh the invoice page after completing payment on your phone.
                            </p>
                            <Button className="mt-6" onClick={() => router.get(`/invoices/${invoice.id}`)}>
                                Back to Invoice
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-6 p-6 sm:p-8">
                            <div className="flex items-center gap-2 rounded-lg border-2 border-primary bg-primary/5 p-4">
                                <Smartphone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">M-Pesa</p>
                                    <p className="text-xs text-muted-foreground">STK push to your phone</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="07XXXXXXXX"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (KES)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <Button type="submit" disabled={loading} className="h-12 w-full text-base">
                                {loading ? "Sending request..." : `Pay ${formatKES(Number(amount) || 0)} via M-Pesa`}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}