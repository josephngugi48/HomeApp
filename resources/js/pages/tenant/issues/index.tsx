// resources/js/pages/tenant/issues/index.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router } from '@inertiajs/react'
import { Eye } from 'lucide-react'
import { DataTableResponse } from '@/types'

interface IssueRow { id: number; title: string; body: string; category: string; status: string; raised_at: string }
interface Props { issues: DataTableResponse<IssueRow> }

const statusStyle: Record<string, { bg: string; dot: string; text: string }> = {
    open: { bg: 'bg-stone-100', dot: 'bg-stone-400', text: 'text-stone-600' },
    in_progress: { bg: 'bg-blue-50 border border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
    closed: { bg: 'bg-stone-100', dot: 'bg-stone-400', text: 'text-stone-500' },
    assigned: { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
}

const resolvedStyle = { bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' }

function statusLabel(status: string) {
    if (status === 'in_progress') return 'In Progress'
    if (status === 'closed') return 'Closed'
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function TenantIssuesPage({ issues }: Props) {
    return (
        <TenantLayout title="Tenant Issues">
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>SUPPORT</p>
                        <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">Tenant Issues</h1>
                        <p className="mt-1 text-stone-500">Raise complaints, suggestions, or questions and track responses from your property manager.</p>
                    </div>
                    <button
                        onClick={() => router.get('/tenant/issues/create')}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#1B4332' }}
                    >
                        + New Issue
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="px-6 py-4 text-left font-medium text-stone-500">No</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Title</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Raised</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Description</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">Status</th>
                                <th className="px-6 py-4 text-left font-medium text-stone-500">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {issues.data.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">No issues raised yet.</td></tr>
                            )}
                            {issues.data.map((issue, i) => {
                                const s = issue.status === 'in_progress' ? statusStyle.in_progress
                                    : issue.status === 'closed' ? statusStyle.closed
                                    : resolvedStyle
                                return (
                                    <tr key={issue.id} className="hover:bg-stone-50">
                                        <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-stone-800">{issue.title}</td>
                                        <td className="px-6 py-4 text-stone-500">{issue.raised_at}</td>
                                        <td className="px-6 py-4 max-w-xs text-stone-600 truncate">
                                            <span style={{ color: '#1B4332' }}>{issue.body}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                                {statusLabel(issue.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => router.get(`/tenant/issues/${issue.id}`)} className="text-stone-400 hover:text-stone-700">
                                                <Eye className="h-4 w-4" />
                                            </button>
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