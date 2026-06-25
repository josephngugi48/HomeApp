"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { router } from "@inertiajs/react"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchColumn?: string
    searchPlaceholder?: string
    filters?: Array<{
        column: string
        title: string
        options: Array<{
            label: string
            value: string
            icon?: React.ComponentType<{ className?: string }>
        }>
    }>
}

export function DataTableToolbar<TData>({
    table,
    searchColumn = "name",
    searchPlaceholder = "Search...",
    filters = [],
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    // Get current URL search params
    const searchParams = new URLSearchParams(window.location.search)
    const currentSearch = searchParams.get("search") || ""

    // Debounced search to avoid too many requests
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: Record<string, any> = {
            page: 1, // Reset to first page on search
            per_page: table.getState().pagination.pageSize,
        }

        if (value) {
            params.search = value
        }

        // Preserve existing filters
        table.getState().columnFilters.forEach((filter) => {
            if (filter.id !== searchColumn) {
                params[filter.id] = filter.value
            }
        })

        router.get(window.location.pathname, params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        })
    }, 500)

    const handleFilterChange = (columnId: string, value: string[] | undefined) => {
        const params: Record<string, any> = {
            page: 1, // Reset to first page on filter
            per_page: table.getState().pagination.pageSize,
        }

        // Preserve search
        if (currentSearch) {
            params.search = currentSearch
        }

        // Add all filters
        table.getState().columnFilters.forEach((filter) => {
            if (filter.id !== columnId) {
                params[filter.id] = filter.value
            }
        })

        // Add new filter value
        if (value && value.length > 0) {
            params[columnId] = value
        }

        router.get(window.location.pathname, params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        })
    }

    const handleReset = () => {
        table.resetColumnFilters()
        router.get(
            window.location.pathname,
            {
                page: 1,
                per_page: table.getState().pagination.pageSize,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        )
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input
                    placeholder={searchPlaceholder}
                    defaultValue={currentSearch}
                    onChange={(event) => {
                        debouncedSearch(event.target.value)
                    }}
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                {filters.map((filter) => {
                    const column = table.getColumn(filter.column)
                    if (!column) return null

                    return (
                        <DataTableFacetedFilter
                            key={filter.column}
                            column={column}
                            title={filter.title}
                            options={filter.options}
                            onFilterChange={(value) => handleFilterChange(filter.column, value)}
                        />
                    )
                })}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}