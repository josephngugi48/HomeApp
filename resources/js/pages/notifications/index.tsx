import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    data: {
        message: string;
        icon: string;
        action_url?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        links: any[];
        total: number;
    };
    unread_count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

export default function Notifications({ notifications, unread_count }: Props) {
    const { auth } = usePage<SharedData>().props;

    const markAsRead = (id: string) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
        });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const deleteNotification = (id: string) => {
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            You have {unread_count} unread notifications.
                        </p>
                    </div>
                    {unread_count > 0 && (
                        <Button onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Your Notifications</CardTitle>
                        <CardDescription>
                            Stay updated with recent activities and alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {notifications.data.length > 0 ? (
                            <div className="flex flex-col divide-y divide-border">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start justify-between py-4 gap-4 ${!notification.read_at ? 'bg-muted/30 -mx-4 px-4' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-full ${!notification.read_at ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                <Bell className="h-4 w-4" />
                                            </div>
                                            <div className="grid gap-1">
                                                <p className={`text-sm ${!notification.read_at ? 'font-semibold' : ''}`}>
                                                    {notification.data.message}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                {notification.data.action_url && (
                                                    <Button variant="link" className="p-0 h-auto text-xs w-fit" onClick={() => router.visit(notification.data.action_url!)}>
                                                        View details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Mark as read"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                title="Delete"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <Bell className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg">No notifications yet</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    When you receive notifications, they will appear here.
                                </p>
                            </div>
                        )}

                        {/* Simple Pagination info */}
                        {notifications.total > 20 && (
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Total: {notifications.total}
                                </div>
                                {/* Inclusion of simple pagination links would go here */}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
