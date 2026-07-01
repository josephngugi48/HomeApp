// resources/js/pages/tenant/maintenance/create.tsx
import TenantLayout from '@/layouts/tenant-layout'
import { router, useForm } from '@inertiajs/react'
import { ArrowLeft, Upload } from 'lucide-react'

interface Props { categoryOptions: string[]; priorityOptions: string[] }

export default function TenantMaintenanceCreatePage({ categoryOptions, priorityOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        category: string; priority: string; description: string; photos: File[]
    }>({
        category: categoryOptions[0] ?? 'general',
        priority: 'medium',
        description: '',
        photos: [],
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/tenant/maintenance', { forceFormData: true })
    }

    return (
        <TenantLayout title="New Request">
            <div className="max-w-2xl space-y-6">
                <button onClick={() => router.get('/tenant/maintenance')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800">
                    <ArrowLeft className="h-4 w-4" /> Back to Requests
                </button>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1B4332' }}>REPAIRS</p>
                    <h1 className="mt-1 font-serif text-3xl font-bold text-stone-900">New Maintenance Request</h1>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-stone-700">Category *</label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 capitalize"
                            >
                                {categoryOptions.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-stone-700">Priority *</label>
                            <select
                                value={data.priority}
                                onChange={e => setData('priority', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 capitalize"
                            >
                                {priorityOptions.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-stone-700">Description *</label>
                        <textarea
                            rows={5}
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                            placeholder="Describe the issue in detail"
                        />
                        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-stone-700">Photos (optional)</label>
                        <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-stone-300 p-6 cursor-pointer hover:bg-stone-50">
                            <Upload className="h-6 w-6 text-stone-400" />
                            <span className="text-sm text-stone-500">
                                {data.photos.length > 0 ? `${data.photos.length} photo(s) selected` : 'Click to upload before photos (max 6)'}
                            </span>
                            <input
                                type="file" accept="image/*" multiple className="hidden"
                                onChange={e => setData('photos', Array.from(e.target.files ?? []).slice(0, 6))}
                            />
                        </label>
                    </div>

                    <div className="flex justify-between pt-2">
                        <button onClick={() => router.get('/tenant/maintenance')} className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50">
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                            style={{ backgroundColor: '#1B4332' }}
                        >
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            </div>
        </TenantLayout>
    )
}