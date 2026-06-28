// resources/js/pages/invoices/show.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Invoice } from "@/types"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    invoice: Invoice
}

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value))

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline", unpaid: "secondary", partial: "secondary", paid: "default", overdue: "destructive",
}

export default function InvoiceShowPage({ invoice }: PageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Invoices", href: "/invoices" },
                { title: invoice.number, href: `/invoices/${invoice.id}` },
            ]}
        >
            <Head title={`Invoice ${invoice.number}`} />

            <div className="flex flex-col gap-8 p-8 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.get('/invoices')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{invoice.number}</h1>
                            <p className="text-muted-foreground">
                                {invoice.tenant?.name} — {invoice.unit?.unit_no}, {invoice.unit?.apartment?.name}
                            </p>
                        </div>
                    </div>
                    <Badge variant={statusVariant[invoice.status] ?? "outline"} className="capitalize text-sm px-3 py-1">
                        {invoice.status}
                    </Badge>
                </div>

                <Card>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Issue Date</p>
                            <p className="mt-1 font-medium">{new Date(invoice.issue_date).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Due Date</p>
                            <p className="mt-1 font-medium">{new Date(invoice.due_date).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                            <p className="mt-1 font-medium">{formatKES(invoice.total)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Balance</p>
                            <p className={`mt-1 font-semibold ${Number(invoice.balance) > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {formatKES(invoice.balance)}
                            </p>
                        </div>
                        <div>
                            <p>
                                {walletCreditApplied > 0 && (
                                    <div className="flex justify-between text-sm text-success px-6">
                                        <span>Wallet credit applied</span>
                                        <span>-{formatKES(walletCreditApplied)}</span>
                                    </div>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="capitalize">Type</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell className="capitalize text-muted-foreground">{item.type}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatKES(item.unit_price)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatKES(item.amount)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/30">
                                    <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
                                    <TableCell className="text-right font-semibold">{formatKES(invoice.total)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {Number(invoice.total) !== Number(invoice.subtotal) || /* placeholder for actual wallet-credit signal */ false}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}