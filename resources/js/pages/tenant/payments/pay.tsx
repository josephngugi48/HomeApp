// resources/js/pages/tenant/payments/pay.tsx
import { useState } from 'react'
import TenantLayout from '@/layouts/tenant-layout'
import { router, useForm } from '@inertiajs/react'
import { ArrowLeft, Smartphone, Building2 } from 'lucide-react'

interface Invoice { id: number; number: string; balance: number; unit?: { apartment_name: string; location_name: string } }
interface Props { invoice: Invoice; tenantPhone?: string }

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n)

export default function TenantPayPage({ invoice, tenantPhone }: Props) {
    const [method, setMethod] = useState<'mpesa' | 'pesalink'>('mpesa')
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: invoice.id,
        phone: tenantPhone ?? '',
        amount: String(invoice.balance),
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/mpesa/stk-push', {
            onSuccess: () => router.get(`/tenant/invoices/${invoice.id}`),
        })
    }

    const propertyLabel = invoice.unit
        ? `${invoice.unit.apartment_name} — ${invoice.unit.location_name}`
        : 'Your Property'

    return (
        <TenantLayout title="Pay Now">
            <div className="max-w-md mx-auto space-y-6">
                <button
                    onClick={() => router.get(`/tenant/invoices/${invoice.id}`)}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Amount card */}
                <div className="rounded-2xl text-white text-center py-10 px-6" style={{ backgroundColor: '#1B4332' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-200">AMOUNT DUE</p>
                    <p className="mt-3 font-serif text-5xl font-bold">{formatKES(invoice.balance)}</p>
                    <p className="mt-2 text-green-200">{propertyLabel}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 space-y-5">
                    {/* Method toggle */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setMethod('mpesa')}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${method === 'mpesa' ? 'shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}
                            style={method === 'mpesa' ? { borderColor: '#1B4332', backgroundColor: '#F0FDF4' } : {}}
                        >
                            <Smartphone className="h-5 w-5 mb-2" style={{ color: '#1B4332' }} />
                            <p className="font-semibold text-stone-800">M-Pesa</p>
                            <p className="text-xs text-stone-500">STK Push to your phone</p>
                        </button>
                        <button
                            onClick={() => setMethod('pesalink')}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${method === 'pesalink' ? 'shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}
                            style={method === 'pesalink' ? { borderColor: '#1B4332', backgroundColor: '#F0FDF4' } : {}}
                        >
                            <Building2 className="h-5 w-5 mb-2" style={{ color: '#1B4332' }} />
                            <p className="font-semibold text-stone-800">Pesalink</p>
                            <p className="text-xs text-stone-500">Bank transfer</p>
                        </button>
                    </div>

                    {method === 'mpesa' && (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">Mobile number</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-stone-200 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#1B4332' } as any}
                                    placeholder="07XXXXXXXX"
                                />
                                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">Amount (KES)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full rounded-lg border border-stone-200 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#1B4332' } as any}
                                />
                                <p className="text-xs" style={{ color: '#1B4332' }}>
                                    Outstanding balance: {formatKES(invoice.balance)}
                                </p>
                                {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-70"
                                style={{ backgroundColor: '#1B4332' }}
                            >
                                {processing ? 'Sending request...' : `Pay ${formatKES(Number(data.amount) || 0)} with M-Pesa`}
                            </button>
                        </form>
                    )}

                    {method === 'pesalink' && (
                        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                            <p className="font-medium text-stone-800 mb-2">Bank Transfer Details</p>
                            <p>Transfer KES {formatKES(invoice.balance)} to your landlord's Pesalink-registered account and use <strong>{invoice.number}</strong> as the reference.</p>
                        </div>
                    )}
                </div>
            </div>
        </TenantLayout>
    )
}