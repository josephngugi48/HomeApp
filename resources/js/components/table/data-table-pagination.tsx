import { type Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    paginationMeta: PaginationMeta
}

export function DataTablePagination<TData>({
    table,
    paginationMeta,
}: DataTablePaginationProps<TData>) {
    const isFirstPage = paginationMeta.current_page === 1
    const isLastPage = paginationMeta.current_page === paginationMeta.last_page

    return (
        <div className="flex items-center justify-between px-2">
            {/* Rows per page */}
            <div className="flex-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                            table.setPageIndex(0)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p>of {paginationMeta.total}</p>
                </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                    Page {paginationMeta.current_page} of {paginationMeta.last_page}
                </div>

                <div className="flex items-center space-x-2">
                    {/* First page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={isFirstPage}
                    >
                        <ChevronsLeft />
                    </Button>

                    {/* Previous page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={isFirstPage}
                    >
                        <ChevronLeft />
                    </Button>

                    {/* Next page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={isLastPage}
                    >
                        <ChevronRight />
                    </Button>

                    {/* Last page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(paginationMeta.last_page - 1)}
                        disabled={isLastPage}
                    >
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}