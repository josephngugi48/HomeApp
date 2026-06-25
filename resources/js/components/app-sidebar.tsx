import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { deriveTheme } from '@/lib/colors';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    LucideIcon,
    LayoutDashboard,
    Users,
    Printer,
    Building2,
    User as UserIcon,
    Shield,
    Settings,
    Sliders,
    MessageCircle,
    Activity,
    Mail,
    Phone,
} from 'lucide-react';
import AppLogo from './app-logo';
import React from 'react';


const iconMap: Record<string, LucideIcon> = {
    "lucide-folder": Folder,
    "lucide-layout-grid": LayoutGrid,
    "lucide-book-open": BookOpen,
    "LayoutDashboard": LayoutDashboard,
    "Users": Users,
    "Printer": Printer,
    "Building2": Building2,
    "User": UserIcon,
    "Shield": Shield,
    "Settings": Settings,
    "Sliders": Sliders,
    "MessageCircle": MessageCircle,
    "Activity": Activity,
    "Mail": Mail,
    "Phone": Phone,
};
function transformMenu(menu: any[]): NavItem[] {
    return menu.map((item) => ({
        title: item.title,
        href: item.route,        // URL path from database
        icon: iconMap[item.icon] ?? Folder,
        children: item.children ? transformMenu(item.children) : []
    }));
}
export function AppSidebar() {
    const { auth, sidebarOpen, site: settings } = usePage<SharedData>().props;
    if (!auth?.user) return null;

    const [mainNavItems, setMainNavItems] = React.useState<NavItem[]>(transformMenu(auth.user.menu as any[]));
    const [footerNavItems, setFooterNavItems] = React.useState<NavItem[]>([]);


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {settings.footer_text && (
                    <div className="px-4 py-2 text-xs text-muted-foreground transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
                        {settings.footer_text}
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
