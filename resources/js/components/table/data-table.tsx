import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
    RowSelectionState,
} from "@tanstack/react-table"
import { router } from "@inertiajs/react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableResponse } from "@/types"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: DataTableResponse<TData>
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
    onRowSelectionChange?: (selectedRowIndices: number[]) => void
    enableRowSelection?: boolean | ((row: any) => boolean)
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchColumn,
    searchPlaceholder,
    filters,
    onRowSelectionChange,
    enableRowSelection = false,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    // Sync sorting state with URL params on mount and when data changes
    React.useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const sortBy = searchParams.get("sort_by")
        const sortDirection = searchParams.get("sort_direction") as "asc" | "desc" | null

        if (sortBy && sortDirection) {
            setSorting([{ id: sortBy, desc: sortDirection === "desc" }])
        } else {
            setSorting([])
        }
    }, [data])
    const lastEmittedSelection = React.useRef<number[]>([]);

    // Notify parent of row selection changes
    React.useEffect(() => {
        if (!onRowSelectionChange) return;

        const selectedIndices = Object.keys(rowSelection)
            .filter(key => rowSelection[key])
            .map(key => parseInt(key));

        const prev = lastEmittedSelection.current;

        const isSame =
            prev.length === selectedIndices.length &&
            prev.every((v, i) => v === selectedIndices[i]);

        if (isSame) return;

        lastEmittedSelection.current = selectedIndices;
        onRowSelectionChange(selectedIndices);
    }, [rowSelection, onRowSelectionChange]);


    const { data: tableData, ...paginationMeta } = data

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: {
                pageIndex: (paginationMeta.current_page || 1) - 1,
                pageSize: paginationMeta.per_page || 10,
            },
        },
        manualPagination: true,
        manualSorting: true,
        pageCount: paginationMeta.last_page || 1,
        onPaginationChange: (updater) => {
            const currentState = {
                pageIndex: (paginationMeta.current_page || 1) - 1,
                pageSize: paginationMeta.per_page || 10,
            }

            const nextState = typeof updater === "function"
                ? updater(currentState)
                : updater

            if (nextState.pageIndex !== currentState.pageIndex ||
                nextState.pageSize !== currentState.pageSize) {

                const searchParams = new URLSearchParams(window.location.search)
                const params: Record<string, any> = {
                    page: nextState.pageIndex + 1,
                    per_page: nextState.pageSize,
                }

                searchParams.forEach((value, key) => {
                    if (key !== "page" && key !== "per_page") {
                        params[key] = value
                    }
                })

                router.get(
                    window.location.pathname,
                    params,
                    {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true,
                    }
                )
            }
        },
        enableRowSelection: enableRowSelection,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="flex flex-col gap-4">
            <DataTableToolbar
                table={table}
                searchColumn={searchColumn}
                searchPlaceholder={searchPlaceholder}
                filters={filters}
            />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} paginationMeta={paginationMeta} />
        </div>
    )
}