// resources/js/pages/tenant/wallet/index.tsx
import { useState } from 'react'
import TenantLayout from '@/layouts/tenant-layout'
import { useForm } from '@inertiajs/react'
import { Plus, Download, Wallet as WalletIcon } from 'lucide-react'

interface Transaction { id: number; type: string; amount: number; ref: string; occurred_at: string; meta: any }
interface WalletData { id: number; balance: number; transactions: Transaction[] }
interface Props { wallet: WalletData }

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n)

export default function TenantWalletPage({ wallet }: Props) {
    const [topUpOpen, setTopUpOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({ phone: '', amount: '' })

    const topUps = wallet.transactions.filter(t => t.type === 'deposit')

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/tenant/wallet/top-up', {
            onSuccess: () => { setTopUpOpen(false); reset() },
        })
    }

    return (
        <TenantLayout title="Wallet">
            <div className="space-y-6 max-w-4xl">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>FUNDS</p>
                    <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">Wallet</h1>
                    <p className="mt-1 text-stone-500">
                        Top up your wallet for faster checkout and{' '}
                        <span style={{ color: '#1B4332' }}>auto-debit</span> on{' '}
                        <span style={{ color: '#1B4332' }}>monthly</span> invoices.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Balance card */}
                    <div className="md:col-span-2 rounded-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#1B4332' }}>
                        <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                            <WalletIcon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-green-200">WALLET BALANCE</p>
                        <p className="mt-2 font-serif text-5xl font-bold">{formatKES(wallet.balance)}</p>
                        <p className="mt-1 text-green-300 text-sm">Pending: Ksh 0.00</p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setTopUpOpen(true)}
                                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                            >
                                <Plus className="h-4 w-4" /> Top Up Wallet
                            </button>
                            <button className="flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                                <Download className="h-4 w-4" /> Withdraw
                            </button>
                        </div>
                    </div>

                    {/* Auto-debit */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col justify-between">
                        <div>
                            <p className="font-semibold text-stone-800">Auto-debit</p>
                            <p className="mt-1 text-sm text-stone-500">
                                Allow PropTap to automatically settle your monthly invoices using your wallet balance.
                            </p>
                        </div>
                        <button className="mt-4 w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50">
                            Enable Auto-debit
                        </button>
                    </div>
                </div>

                {/* Top-up modal */}
                {topUpOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Top Up Wallet</h2>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-stone-700">M-Pesa Phone</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                                        placeholder="07XXXXXXXX"
                                    />
                                    {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-stone-700">Amount (KES)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                                    />
                                    {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setTopUpOpen(false)} className="flex-1 rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-stone-700">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                                        style={{ backgroundColor: '#1B4332' }}
                                    >
                                        {processing ? 'Sending...' : 'Top Up'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Recent top-ups */}
                <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
                    <div className="px-6 py-4 border-b border-stone-100">
                        <h2 className="font-semibold text-stone-800">Recent Top-ups</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="px-6 py-3 text-left font-medium text-stone-400">No</th>
                                <th className="px-6 py-3 text-left font-medium text-stone-400">Top Up Ref</th>
                                <th className="px-6 py-3 text-left font-medium text-stone-400">M-Pesa Reference</th>
                                <th className="px-6 py-3 text-left font-medium text-stone-400">Amount</th>
                                <th className="px-6 py-3 text-left font-medium text-stone-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {topUps.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-400">No top-ups yet.</td></tr>
                            )}
                            {topUps.map((t, i) => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#1B4332' }}>{t.ref}</td>
                                    <td className="px-6 py-4 font-mono text-xs" style={{ color: '#1B4332' }}>
                                        {t.meta?.mpesa_ref ?? '—'}
                                    </td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#1B4332' }}>
                                        +{formatKES(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{t.occurred_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TenantLayout>
    )
}