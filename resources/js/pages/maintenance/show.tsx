// resources/js/pages/maintenance/show.tsx
import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import { MaintenanceRequestRecord, CompanyUserOption } from "@/types"

interface Props {
    request: MaintenanceRequestRecord
    caretakers: CompanyUserOption[]
    statusOptions: string[]
}

const priorityColor: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    emergency: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function MaintenanceShowPage({ request, caretakers, statusOptions }: Props) {
    const [afterPhotos, setAfterPhotos] = useState<File[]>([])

    const { data, setData, post, processing } = useForm<{
        status: string
        assignee_id: string
        after_photos: File[]
    }>({
        status: request.status,
        assignee_id: request.assignee?.id ? String(request.assignee.id) : "",
        after_photos: [],
    })

    const handleAfterPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 6)
        setAfterPhotos(files)
        setData("after_photos", files)
    }

    //
    const save = () => {
        router.post(`/maintenance/${request.id}`, {
            ...data,
            _method: 'put',
            assignee_id: data.assignee_id || null,
        } as any, {
            forceFormData: true,
        })
    }

    const beforePhotos = request.photos?.filter(p => p.kind === "before") ?? []
    const existingAfterPhotos = request.photos?.filter(p => p.kind === "after") ?? []

    return (
        <AppLayout breadcrumbs={[{ title: "Maintenance", href: "/maintenance" }, { title: request.number, href: `/maintenance/${request.id}` }]}>
            <Head title={request.number} />

            <div className="flex flex-col gap-8 p-8 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/maintenance')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{request.number}</h1>
                        <p className="text-muted-foreground">{request.tenant?.name} — Unit {request.unit?.unit_no}</p>
                    </div>
                    <span className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${priorityColor[request.priority]}`}>
                        {request.priority}
                    </span>
                </div>

                <Card>
                    <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(v) => setData("status", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((s) => (
                                            <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assigned To</Label>
                                <Select value={data.assignee_id} onValueChange={(v) => setData("assignee_id", v)}>
                                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                        {caretakers.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Add After Photos</Label>
                            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-accent/30">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {afterPhotos.length > 0 ? `${afterPhotos.length} photo(s) selected` : "Click to upload completion photos"}
                                </span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleAfterPhotos} />
                            </label>
                        </div>

                        <Button onClick={save} disabled={processing}>{processing ? "Saving..." : "Save Changes"}</Button>
                    </CardContent>
                </Card>

                {beforePhotos.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Before Photos</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-3 gap-3">
                            {beforePhotos.map((photo) => (
                                <img key={photo.id} src={`/storage/${photo.path}`} className="rounded-md border aspect-square object-cover" />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {existingAfterPhotos.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>After Photos</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-3 gap-3">
                            {existingAfterPhotos.map((photo) => (
                                <img key={photo.id} src={`/storage/${photo.path}`} className="rounded-md border aspect-square object-cover" />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}