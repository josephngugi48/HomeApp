// resources/js/pages/tenant/invoices/show.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router } from '@inertiajs/react'
import { ArrowLeft, Download } from 'lucide-react'

interface InvoiceItem { id: number; description: string; quantity: number; unit_price: number; amount: number }
interface PaymentRow { id: number; ref: string; amount: number; method: string; paid_at: string }
interface Invoice {
    id: number; number: string; billing_month: string; issue_date: string; due_date: string
    total: number; balance: number; status: string; items: InvoiceItem[]; payments: PaymentRow[]
    unit?: { unit_no: string; apartment_name: string; location_name: string }
}

interface Props { invoice: Invoice }

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n)

export default function TenantInvoiceShowPage({ invoice }: Props) {
    return (
        <TenantLayout title={invoice.number}>
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.get('/tenant/invoices')}
                        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Invoices
                    </button>
                    <div className="flex gap-3">
                        <a
                            href={`/tenant/invoices/${invoice.id}/pdf`}
                            className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        >
                            <Download className="h-4 w-4" /> Download PDF
                        </a>
                        {invoice.balance > 0 && (
                            <button
                                onClick={() => router.get(`/tenant/invoices/${invoice.id}/pay`)}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                                style={{ backgroundColor: '#1B4332' }}
                            >
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>

                {/* Header banner */}
                <div className="rounded-xl p-8 text-white" style={{ backgroundColor: '#1B4332' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-200">INVOICE</p>
                    <h1 className="mt-2 font-serif text-4xl font-bold">{invoice.number}</h1>
                </div>

                {/* Meta */}
                <div className="rounded-xl border border-stone-200 bg-white p-6 grid grid-cols-3 gap-6">
                    {[
                        ['DATE ISSUED', new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                        ['DUE DATE', new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                        ['BILLING MONTH', invoice.billing_month],
                        ['TENANT', 'Joseph M Ngugi'],
                        ['PROPERTY', invoice.unit ? `${invoice.unit.apartment_name} — ${invoice.unit.location_name}` : '—'],
                        ['UNIT', invoice.unit?.unit_no ?? '—'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
                            <p className="mt-1 font-medium text-stone-800">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Amounts */}
                <div className="rounded-xl border border-stone-200 bg-white p-6 flex gap-12">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">OUTSTANDING AMOUNT</p>
                        <p className="mt-1 text-3xl font-bold" style={{ color: '#DC2626' }}>{formatKES(invoice.balance)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">TOTAL AMOUNT</p>
                        <p className="mt-1 text-3xl font-bold text-stone-900">{formatKES(invoice.total)}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="rounded-xl border border-stone-200 bg-white">
                    <div className="px-6 py-4 border-b border-stone-100">
                        <h2 className="font-semibold text-stone-800">Items</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100 text-stone-400">
                                <th className="px-6 py-3 text-left font-medium">Description</th>
                                <th className="px-6 py-3 text-center font-medium" style={{ color: '#1B4332' }}>Quantity</th>
                                <th className="px-6 py-3 text-right font-medium" style={{ color: '#1B4332' }}>Unit Price</th>
                                <th className="px-6 py-3 text-right font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 text-stone-700">{item.description}</td>
                                    <td className="px-6 py-4 text-center font-medium" style={{ color: '#1B4332' }}>{item.quantity}</td>
                                    <td className="px-6 py-4 text-right text-stone-600">{formatKES(item.unit_price)}</td>
                                    <td className="px-6 py-4 text-right font-medium text-stone-800">{formatKES(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-stone-200">
                                <td colSpan={3} className="px-6 py-4 text-right font-medium text-stone-600">Total</td>
                                <td className="px-6 py-4 text-right text-lg font-bold text-stone-900">{formatKES(invoice.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Payment history */}
                <div className="rounded-xl border border-stone-200 bg-white">
                    <div className="px-6 py-4 border-b border-stone-100">
                        <h2 className="font-semibold text-stone-800">Payment History</h2>
                    </div>
                    {invoice.payments.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-stone-400">No payments recorded for this invoice yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-stone-100">
                                {invoice.payments.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-3 text-stone-700">{p.ref}</td>
                                        <td className="px-6 py-3 font-medium text-stone-800">{formatKES(p.amount)}</td>
                                        <td className="px-6 py-3 text-stone-400">{p.paid_at}</td>
                                        <td className="px-6 py-3">
                                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700">{p.method}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </TenantLayout>
    )
}