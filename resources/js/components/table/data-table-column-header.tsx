import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"
import { router } from "@inertiajs/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
    serverSide?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    serverSide = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    const handleSort = (direction: "asc" | "desc" | false) => {
        if (serverSide) {
            const searchParams = new URLSearchParams(window.location.search)
            const params: Record<string, any> = {
                page: 1, // Always reset to page 1 when sorting changes
                per_page: searchParams.get("per_page") || 10,
            }

            // Preserve search and other filters (but not sort params)
            searchParams.forEach((value, key) => {
                if (key !== "page" && key !== "per_page" && key !== "sort_by" && key !== "sort_direction") {
                    params[key] = value
                }
            })

            // Add sorting params only if direction is specified
            if (direction !== false) {
                params.sort_by = column.id
                params.sort_direction = direction
            }
            // When direction is false, sort_by and sort_direction are omitted, effectively clearing the sort

            router.get(window.location.pathname, params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            })
        } else {
            // Client-side sorting
            if (direction === false) {
                column.clearSorting()
            } else {
                column.toggleSorting(direction === "desc")
            }
        }
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="data-[state=open]:bg-accent -ml-3 h-8"
                    >
                        <span>{title}</span>
                        {column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleSort("asc")}>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("desc")}>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Desc
                    </DropdownMenuItem>
                    {column.getIsSorted() && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSort(false)}>
                                <ChevronsUpDown className="mr-2 h-4 w-4" />
                                Clear Sort
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}