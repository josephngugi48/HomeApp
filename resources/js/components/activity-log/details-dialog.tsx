import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface ActivityDetailsProps {
    activity: {
        id: number
        description: string
        subject_type: string
        subject_id: number
        causer?: { name: string; email: string }
        properties: any
        created_at: string
    }
}

export function ActivityDetailsDialog({ activity }: ActivityDetailsProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Activity Details</DialogTitle>
                    <DialogDescription>
                        Audit log entry #{activity.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">Description</p>
                            <p className="capitalize">{activity.description}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">Timestamp</p>
                            <p>{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">Subject</p>
                            <p>{activity.subject_type?.split('\\').pop()} (ID: {activity.subject_id})</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">User</p>
                            <p>{activity.causer?.name ?? 'System'} ({activity.causer?.email ?? 'N/A'})</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase mb-2">Changes / Properties</p>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                            {JSON.stringify(activity.properties, null, 2)}
                        </pre>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
