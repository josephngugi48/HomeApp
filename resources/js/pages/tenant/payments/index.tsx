// resources/js/pages/tenant/payments/index.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router } from '@inertiajs/react'
import { Download } from 'lucide-react'
import { DataTableResponse } from '@/types'

interface PaymentRow {
    id: number; ref: string; amount: number; external_ref: string | null
    method: string; paid_at: string; invoice_number: string | null
}

interface Props { payments: DataTableResponse<PaymentRow> }

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n)

export default function TenantPaymentsPage({ payments }: Props) {
    return (
        <TenantLayout title="Payments">
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>TRANSACTIONS</p>
                        <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">Payments</h1>
                        <p className="mt-1 text-stone-500">Every transaction made to your account, with reference numbers for your records.</p>
                    </div>
                    <a
                        href="/tenant/payments?export=1"
                        className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 shadow-sm"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="px-6 py-4 text-left font-medium text-stone-500">No</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Payment ID</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Amount</th>
                                <th className="px-6 py-4 text-left font-medium" style={{ color: '#1B4332' }}>Reference</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Payment Date</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400">No payments recorded yet.</td>
                                </tr>
                            )}
                            {payments.data.map((p, i) => (
                                <tr key={p.id} className="hover:bg-stone-50">
                                    <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium text-stone-700">{p.ref}</td>
                                    <td className="px-6 py-4 font-medium text-stone-800">{formatKES(p.amount)}</td>
                                    <td className="px-6 py-4">
                                        {p.external_ref
                                            ? <span className="font-mono text-xs" style={{ color: '#1B4332' }}>{p.external_ref}</span>
                                            : <span className="text-stone-400">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">{p.paid_at}</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                                            {p.method}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TenantLayout>
    )
}