import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import React from 'react'

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage()

    // Track which items are open. Initialize with active items.
    const [openItems, setOpenItems] = React.useState<string[]>(() => {
        return items
            .filter(item => {
                if (!item.children || item.children.length === 0) return false;
                const href = item.href ? (typeof item.href === 'string' ? item.href : item.href.url) : '';
                return page.url.startsWith(href.startsWith('/') ? href : `/${href}`);
            })
            .map(item => item.title);
    });

    const toggleItem = (title: string) => {
        setOpenItems(prev => 
            prev.includes(title) 
                ? [] 
                : [title]
        );
    };

    // Auto-open parent of active child on navigation
    React.useEffect(() => {
        const activeParent = items.find(item => {
            if (!item.children || item.children.length === 0) return false;
            return item.children.some(child => {
                const subHref = normalizeHref(child.href);
                return page.url === subHref;
            });
        });

        if (activeParent && !openItems.includes(activeParent.title)) {
            setOpenItems([activeParent.title]);
        }
    }, [page.url, items]);

    const normalizeHref = (href: NavItem['href']) => {
        const url = typeof href === 'string' ? href : href.url
        return url.startsWith('/') ? url : `/${url}`
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.map(item => {
                    const href = normalizeHref(item.href)
                    const hasChildren = item.children && item.children.length > 0
                    const isActive = page.url.startsWith(href)
                    const isOpen = openItems.includes(item.title)

                    if (hasChildren) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                open={isOpen}
                                onOpenChange={() => toggleItem(item.title)}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children?.map((subItem) => {
                                                const subHref = normalizeHref(subItem.href)
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={page.url === subHref}>
                                                            <Link href={subHref}>
                                                                 <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={href} prefetch className="flex items-center gap-2">
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
