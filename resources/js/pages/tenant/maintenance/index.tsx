// resources/js/pages/tenant/maintenance/index.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router } from '@inertiajs/react'
import { Wrench, Zap, Settings, Droplets } from 'lucide-react'
import { DataTableResponse } from '@/types'

interface MaintenanceRow { id: number; number: string; category: string; priority: string; status: string; raised_at: string }
interface Props { requests: DataTableResponse<MaintenanceRow> }

const categoryIcon: Record<string, any> = {
    plumbing: Droplets, electrical: Zap, appliance: Settings, general: Wrench, security: Settings,
}

const priorityColor: Record<string, string> = {
    low: 'text-stone-500', medium: 'text-amber-600 font-semibold', high: 'text-orange-600 font-semibold', emergency: 'text-red-600 font-bold',
}

const statusStyle: Record<string, { bg: string; dot: string; text: string }> = {
    open: { bg: 'bg-stone-100', dot: 'bg-stone-400', text: 'text-stone-600' },
    assigned: { bg: 'bg-blue-50 border border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
    in_progress: { bg: 'bg-amber-50 border border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
    completed: { bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    closed: { bg: 'bg-stone-100', dot: 'bg-stone-400', text: 'text-stone-500' },
}

export default function TenantMaintenancePage({ requests }: Props) {
    return (
        <TenantLayout title="Maintenance Requests">
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>REPAIRS</p>
                        <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">Maintenance Requests</h1>
                        <p className="mt-1 text-stone-500">Submit and track repairs handled by your property manager.</p>
                    </div>
                    <button
                        onClick={() => router.get('/tenant/maintenance/create')}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#1B4332' }}
                    >
                        + New Request
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="px-6 py-4 text-left font-medium text-stone-500">No</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Category</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Title</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Date</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Priority</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {requests.data.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">No maintenance requests yet.</td></tr>
                            )}
                            {requests.data.map((req, i) => {
                                const Icon = categoryIcon[req.category] ?? Wrench
                                const s = statusStyle[req.status] ?? statusStyle.open
                                return (
                                    <tr key={req.id} className="cursor-pointer hover:bg-stone-50" onClick={() => router.get(`/tenant/maintenance/${req.id}`)}>
                                        <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100">
                                                    <Icon className="h-3.5 w-3.5 text-stone-600" />
                                                </span>
                                                <span className="capitalize text-stone-700">{req.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" style={{ color: '#1B4332' }}>{req.number}</td>
                                        <td className="px-6 py-4 text-stone-500">{req.raised_at}</td>
                                        <td className={`px-6 py-4 capitalize ${priorityColor[req.priority]}`}>{req.priority}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${s.bg} ${s.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                                {req.status.replace('_', ' ')}
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