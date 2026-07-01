// resources/js/pages/tenant/invoices/index.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router } from '@inertiajs/react'
import { DataTableResponse } from '@/types'

interface InvoiceRow {
    id: number; number: string; billing_month: string; billing_year: string
    issue_date: string; due_date: string; total: number; balance: number
    status: string
}

interface Props {
    invoices: DataTableResponse<InvoiceRow>
    availableMonths: string[]
    filters: { month?: string }
}

const statusStyle: Record<string, { bg: string; dot: string; text: string }> = {
    paid: { bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    unpaid: { bg: 'bg-red-50 border border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
    partial: { bg: 'bg-amber-50 border border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
    overdue: { bg: 'bg-red-50 border border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
}

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n)

export default function TenantInvoicesPage({ invoices, availableMonths, filters }: Props) {
    const setMonth = (month: string) =>
        router.get('/tenant/invoices', { month }, { preserveState: true, replace: true })

    return (
        <TenantLayout title="Sales Invoices">
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>
                            BILLING
                        </p>
                        <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">Sales Invoices</h1>
                        <p className="mt-1 text-stone-500">
                            Review your bills, due dates, and payment status across every billing cycle.
                        </p>
                    </div>

                    <select
                        value={filters.month ?? 'all'}
                        onChange={e => setMonth(e.target.value)}
                        className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#1B4332' } as any}
                    >
                        <option value="all">All Months</option>
                        {availableMonths.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="px-6 py-4 text-left font-medium text-stone-500">No</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Invoice #</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Month</th>
                                <th className="px-6 py-4 text-left font-medium" style={{ color: '#1B4332' }}>Outstanding</th>
                                <th className="px-6 py-4 text-left font-medium" style={{ color: '#1B4332' }}>Due Date</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Total Amount</th>
                                <th className="px-6 py-4 text-right font-medium text-stone-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {invoices.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                            {invoices.data.map((inv, i) => {
                                const s = statusStyle[inv.status] ?? statusStyle.unpaid
                                return (
                                    <tr
                                        key={inv.id}
                                        className="cursor-pointer transition-colors hover:bg-stone-50"
                                        onClick={() => router.get(`/tenant/invoices/${inv.id}`)}
                                    >
                                        <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-medium" style={{ color: '#1B4332' }}>
                                            {inv.number}
                                        </td>
                                        <td className="px-6 py-4 text-stone-600">{inv.billing_month}</td>
                                        <td className={`px-6 py-4 font-medium ${inv.balance > 0 ? 'text-red-600' : 'text-stone-500'}`}>
                                            {formatKES(inv.balance)}
                                        </td>
                                        <td className="px-6 py-4" style={{ color: '#1B4332' }}>
                                            {new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-stone-800">{formatKES(inv.total)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s.bg} ${s.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </TenantLayout>
    )
}