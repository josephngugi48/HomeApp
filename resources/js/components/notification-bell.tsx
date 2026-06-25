import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(route('notifications.recent'));
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = (id: string) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => fetchNotifications(),
        });
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
            onSuccess: () => fetchNotifications(),
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-0 hover:bg-transparent text-primary"
                            onClick={() => router.post(route('notifications.mark-all-read'))}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    <>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex flex-col items-start p-3 gap-1 cursor-pointer ${!notification.read_at ? 'bg-muted/50' : ''}`}
                                    onClick={() => notification.data.action_url ? router.visit(notification.data.action_url) : markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between w-full gap-2">
                                        <p className={`text-sm leading-none ${!notification.read_at ? 'font-semibold' : ''}`}>
                                            {notification.data.message}
                                        </p>
                                        <div className="flex gap-1">
                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => deleteNotification(notification.id, e)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('notifications.index')} className="w-full justify-center text-xs text-primary font-medium">
                                View all notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
