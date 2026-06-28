// resources/js/pages/wallet/show.tsx
import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus } from "lucide-react"
import { WalletRecord, WalletTransactionRecord, DataTableResponse } from "@/types"

interface OutstandingInvoice {
    id: number
    number: string
    total: string
    balance: string
}

interface PageProps {
    wallet: WalletRecord
    transactions: DataTableResponse<WalletTransactionRecord>
    outstandingInvoices: OutstandingInvoice[]
    can: { deposit: boolean; applyToInvoice: boolean }
}

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value))

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    deposit: "default", payment: "secondary", refund: "outline", adjustment: "outline",
}

export default function WalletShowPage({ wallet, transactions, outstandingInvoices, can }: PageProps) {
    const [depositOpen, setDepositOpen] = useState(false)
    const [applyOpen, setApplyOpen] = useState(false)

    const depositForm = useForm({ amount: "", note: "" })
    const applyForm = useForm({ invoice_id: "", amount: "" })

    const submitDeposit = (e: React.FormEvent) => {
        e.preventDefault()
        depositForm.post(`/wallet/${wallet.id}/deposit`, {
            onSuccess: () => { setDepositOpen(false); depositForm.reset() },
        })
    }

    const submitApply = (e: React.FormEvent) => {
        e.preventDefault()
        applyForm.post(`/wallet/${wallet.id}/apply`, {
            onSuccess: () => { setApplyOpen(false); applyForm.reset() },
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Wallet", href: "/wallet" }, { title: wallet.tenant?.name ?? "Tenant", href: `/wallet/${wallet.id}` }]}>
            <Head title={`Wallet — ${wallet.tenant?.name}`} />

            <div className="flex flex-col gap-8 p-8 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.get('/wallet')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{wallet.tenant?.name}</h1>
                            <p className="text-muted-foreground">{wallet.tenant?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can.deposit && (
                            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Plus className="h-4 w-4" /> Record Deposit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Record Wallet Deposit</DialogTitle></DialogHeader>
                                    <form onSubmit={submitDeposit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Amount (KES)</Label>
                                            <Input
                                                type="number" step="0.01"
                                                value={depositForm.data.amount}
                                                onChange={e => depositForm.setData("amount", e.target.value)}
                                            />
                                            {depositForm.errors.amount && (
                                                <p className="text-sm text-destructive">{depositForm.errors.amount}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Note</Label>
                                            <Input
                                                value={depositForm.data.note}
                                                onChange={e => depositForm.setData("note", e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={depositForm.processing}>
                                                {depositForm.processing ? "Saving..." : "Record Deposit"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        {can.applyToInvoice && outstandingInvoices.length > 0 && Number(wallet.balance) > 0 && (
                            <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                                <DialogTrigger asChild>
                                    <Button>Apply Credit to Invoice</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Apply Wallet Credit</DialogTitle></DialogHeader>
                                    <form onSubmit={submitApply} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Invoice</Label>
                                            <Select
                                                value={applyForm.data.invoice_id}
                                                onValueChange={(value) => {
                                                    applyForm.setData("invoice_id", value)
                                                    const inv = outstandingInvoices.find(i => String(i.id) === value)
                                                    if (inv) applyForm.setData("amount", String(Math.min(Number(inv.balance), Number(wallet.balance))))
                                                }}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select an invoice" /></SelectTrigger>
                                                <SelectContent>
                                                    {outstandingInvoices.map((inv) => (
                                                        <SelectItem key={inv.id} value={String(inv.id)}>
                                                            {inv.number} (Bal: {formatKES(inv.balance)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {applyForm.errors.invoice_id && (
                                                <p className="text-sm text-destructive">{applyForm.errors.invoice_id}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount to Apply (KES)</Label>
                                            <Input
                                                type="number" step="0.01"
                                                value={applyForm.data.amount}
                                                onChange={e => applyForm.setData("amount", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Available wallet balance: {formatKES(wallet.balance)}
                                            </p>
                                            {applyForm.errors.amount && (
                                                <p className="text-sm text-destructive">{applyForm.errors.amount}</p>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={applyForm.processing}>
                                                {applyForm.processing ? "Applying..." : "Apply Credit"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Balance</p>
                        <p className="mt-1 text-3xl font-bold text-success">{formatKES(wallet.balance)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Every deposit, payment, refund, and adjustment for this wallet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No transactions yet
                                        </TableCell>
                                    </TableRow>
                                )}
                                {transactions.data.map((tx) => {
                                    const amount = Number(tx.amount)
                                    return (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(tx.occurred_at).toLocaleDateString("en-GB")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={typeVariant[tx.type] ?? "outline"} className="capitalize">
                                                    {tx.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">{tx.ref}</TableCell>
                                            <TableCell className={`text-right font-medium ${amount >= 0 ? "text-success" : "text-destructive"}`}>
                                                {amount >= 0 ? "+" : ""}{formatKES(amount)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}