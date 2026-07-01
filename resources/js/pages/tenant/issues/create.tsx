// resources/js/pages/tenant/issues/create.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'

interface Props { categoryOptions: string[] }

export default function TenantIssueCreatePage({ categoryOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', body: '', category: categoryOptions[0] ?? 'general',
    })

    const submit = (e: React.FormEvent) => { e.preventDefault(); post('/tenant/issues') }

    return (
        <TenantLayout title="New Issue">
            <div className="max-w-2xl space-y-6">
                <button onClick={() => router.get('/tenant/issues')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800">
                    <ArrowLeft className="h-4 w-4" /> Back to Issues
                </button>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>SUPPORT</p>
                    <h1 className="mt-1 font-serif text-3xl font-bold text-stone-900">New Issue</h1>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-stone-700">Title *</label>
                        <input
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                            placeholder="Short summary of the issue"
                        />
                        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-stone-700">Category *</label>
                        <select
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 capitalize"
                        >
                            {categoryOptions.map(c => (
                                <option key={c} value={c} className="capitalize">{c}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-stone-700">Description *</label>
                        <textarea
                            rows={5}
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                            placeholder="Describe the issue in detail"
                        />
                        {errors.body && <p className="text-xs text-red-600">{errors.body}</p>}
                    </div>

                    <div className="flex justify-between pt-2">
                        <button onClick={() => router.get('/tenant/issues')} className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                            style={{ backgroundColor: '#1B4332' }}
                        >
                            {processing ? 'Submitting...' : 'Submit Issue'}
                        </button>
                    </div>
                </div>
            </div>
        </TenantLayout>
    )
}