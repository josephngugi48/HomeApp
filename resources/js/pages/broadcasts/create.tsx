// resources/js/pages/broadcasts/create.tsx
import { useState } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Mail, MessageSquare, Phone, Upload, Users } from "lucide-react"
import { ApartmentOption, ContactListOption } from "@/types"
import axios from "@/lib/axios"

interface Props {
    apartments: ApartmentOption[]
    contactLists: ContactListOption[]
    channelOptions: string[]
}

const channelMeta: Record<string, { label: string; icon: any; caveat: string }> = {
    sms: { label: "SMS", icon: MessageSquare, caveat: "Sent via Africa's Talking" },
    email: { label: "Email", icon: Mail, caveat: "Sent via your existing mail configuration" },
    whatsapp: { label: "WhatsApp", icon: Phone, caveat: "Requires recipients to have messaged you first, or an approved template" },
}

export default function CreateBroadcast({ apartments, contactLists, channelOptions }: Props) {
    const [uploadOpen, setUploadOpen] = useState(false)
    const [uploadName, setUploadName] = useState("")
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [previewCount, setPreviewCount] = useState<number | null>(null)
    const [previewing, setPreviewing] = useState(false)

    const { data, setData, post, processing, errors } = useForm<{
        title: string
        body: string
        channels: string[]
        apartment_ids: number[]
        contact_list_ids: number[]
    }>({
        title: "",
        body: "",
        channels: [],
        apartment_ids: [],
        contact_list_ids: [],
    })

    const toggleChannel = (channel: string) => {
        setData("channels", data.channels.includes(channel)
            ? data.channels.filter(c => c !== channel)
            : [...data.channels, channel])
    }

    const toggleApartment = (id: number) => {
        setData("apartment_ids", data.apartment_ids.includes(id)
            ? data.apartment_ids.filter(a => a !== id)
            : [...data.apartment_ids, id])
        setPreviewCount(null)
    }

    const toggleContactList = (id: number) => {
        setData("contact_list_ids", data.contact_list_ids.includes(id)
            ? data.contact_list_ids.filter(c => c !== id)
            : [...data.contact_list_ids, id])
        setPreviewCount(null)
    }

    const checkPreview = async () => {
        setPreviewing(true)
        try {
            const res = await axios.post("/broadcasts/preview", {
                apartment_ids: data.apartment_ids,
                contact_list_ids: data.contact_list_ids,
            })
            setPreviewCount(res.data.count)
        } catch {
            setPreviewCount(null)
        } finally {
            setPreviewing(false)
        }
    }

    const uploadList = (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadFile) return
        const formData = new FormData()
        formData.append("name", uploadName)
        formData.append("file", uploadFile)
        router.post("/broadcasts/contact-lists/upload", formData, {
            forceFormData: true,
            onSuccess: () => {
                setUploadOpen(false)
                setUploadName("")
                setUploadFile(null)
            },
        })
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (confirm(`Send this broadcast to ${previewCount ?? "the selected"} recipients now? This cannot be undone.`)) {
            post("/broadcasts")
        }
    }

    const noAudienceSelected = data.apartment_ids.length === 0 && data.contact_list_ids.length === 0

    return (
        <AppLayout breadcrumbs={[{ title: "Broadcasts", href: "/broadcasts" }, { title: "New Broadcast", href: "/broadcasts/create" }]}>
            <Head title="New Broadcast" />

            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">New Broadcast</h1>
                        <p className="text-sm text-muted-foreground">Compose, choose channels, and select your audience</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.get("/broadcasts")}>Cancel</Button>
                        <Button onClick={submit} disabled={processing || noAudienceSelected || data.channels.length === 0}>
                            {processing ? "Sending..." : "Send Broadcast"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl px-6 py-4">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input value={data.title} onChange={e => setData("title", e.target.value)} placeholder="e.g., May rent reminder" />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Message Body *</Label>
                                <Textarea
                                    rows={6}
                                    value={data.body}
                                    onChange={e => setData("body", e.target.value)}
                                    placeholder="Write your message — this is what will be sent across all selected channels"
                                />
                                <p className="text-xs text-muted-foreground">{data.body.length} characters</p>
                                {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Channels</CardTitle>
                            <CardDescription>Select one or more — the same message is sent on each</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {channelOptions.map((channel) => {
                                const meta = channelMeta[channel]
                                const Icon = meta.icon
                                const checked = data.channels.includes(channel)
                                return (
                                    <label
                                        key={channel}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "hover:bg-accent/30"}`}
                                    >
                                        <Checkbox checked={checked} onCheckedChange={() => toggleChannel(channel)} className="mt-0.5" />
                                        <div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Icon className="h-4 w-4" /> {meta.label}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{meta.caveat}</p>
                                        </div>
                                    </label>
                                )
                            })}
                            {errors.channels && <p className="text-sm text-destructive">{errors.channels}</p>}

                            {data.channels.includes("whatsapp") && (
                                <Alert>
                                    <Phone className="h-4 w-4" />
                                    <AlertTitle>WhatsApp requires an approved template</AlertTitle>
                                    <AlertDescription>
                                        Meta blocks free-form messages to numbers that haven't messaged your business
                                        first. Confirm your message template is approved in Meta Business Manager
                                        before relying on this channel.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audience</CardTitle>
                            <CardDescription>Select buildings, an uploaded list, or both</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tenants in Building</Label>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {apartments.map((a) => (
                                        <label key={a.id} className="flex items-center gap-2 text-sm py-1">
                                            <Checkbox
                                                checked={data.apartment_ids.includes(a.id)}
                                                onCheckedChange={() => toggleApartment(a.id)}
                                            />
                                            {a.name}
                                        </label>
                                    ))}
                                    {apartments.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No apartments found</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded Lists</Label>
                                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                <Upload className="h-3 w-3" /> Upload
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Upload Contact List</DialogTitle></DialogHeader>
                                            <form onSubmit={uploadList} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>List Name</Label>
                                                    <Input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g., AGM Attendees" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>CSV File</Label>
                                                    <Input
                                                        type="file"
                                                        accept=".csv,.txt"
                                                        onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Columns: Name (required), Email, Phone or Mobile Number
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit">Upload</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {contactLists.map((list) => (
                                        <label key={list.id} className="flex items-center gap-2 text-sm py-1">
                                            <Checkbox
                                                checked={data.contact_list_ids.includes(list.id)}
                                                onCheckedChange={() => toggleContactList(list.id)}
                                            />
                                            {list.name}
                                            <span className="text-xs text-muted-foreground ml-auto">{list.contact_count}</span>
                                        </label>
                                    ))}
                                    {contactLists.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No uploaded lists yet</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={checkPreview}
                                disabled={noAudienceSelected || previewing}
                            >
                                <Users className="h-4 w-4" />
                                {previewing ? "Checking..." : "Preview Recipient Count"}
                            </Button>

                            {previewCount !== null && (
                                <Alert>
                                    <Users className="h-4 w-4" />
                                    <AlertTitle>{previewCount} recipient{previewCount !== 1 ? "s" : ""} will receive this</AlertTitle>
                                    <AlertDescription>
                                        Duplicates between buildings and uploaded lists have already been removed.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {errors.apartment_ids && <p className="text-sm text-destructive">{errors.apartment_ids}</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}