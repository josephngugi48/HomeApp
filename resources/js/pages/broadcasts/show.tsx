// resources/js/pages/broadcasts/show.tsx
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react"
import { BroadcastRecord, BroadcastRecipientRecord, DataTableResponse } from "@/types"

interface Props {
    broadcast: BroadcastRecord
    recipients: DataTableResponse<BroadcastRecipientRecord>
}

const statusIcon: Record<string, any> = {
    pending: Clock, sent: Clock, delivered: CheckCircle2, failed: XCircle,
}

const statusColor: Record<string, string> = {
    pending: "text-muted-foreground",
    sent: "text-blue-600",
    delivered: "text-success",
    failed: "text-destructive",
}

export default function BroadcastShowPage({ broadcast, recipients }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: "Broadcasts", href: "/broadcasts" }, { title: broadcast.title, href: `/broadcasts/${broadcast.id}` }]}>
            <Head title={broadcast.title} />

            <div className="flex flex-col gap-8 p-8 max-w-5xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/broadcasts')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{broadcast.title}</h1>
                        <p className="text-muted-foreground">
                            {broadcast.channels.map(c => c.toUpperCase()).join(", ")} — sent {broadcast.sent_at ? new Date(broadcast.sent_at).toLocaleString() : "—"}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="whitespace-pre-line">{broadcast.body}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Recipients ({recipients.total})</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    {broadcast.channels.map((c) => (
                                        <TableHead key={c} className="capitalize">{c}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recipients.data.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.resolved_name}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {r.resolved_email && <div>{r.resolved_email}</div>}
                                            {r.resolved_phone && <div>{r.resolved_phone}</div>}
                                        </TableCell>
                                        {broadcast.channels.map((c) => {
                                            const status = r.channel_statuses?.[c]?.status ?? "pending"
                                            const Icon = statusIcon[status]
                                            return (
                                                <TableCell key={c}>
                                                    <span className={`inline-flex items-center gap-1.5 text-xs capitalize ${statusColor[status]}`}>
                                                        <Icon className="h-3.5 w-3.5" /> {status}
                                                    </span>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}