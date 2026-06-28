// resources/js/pages/invoices/index.tsx
import { DataTable } from "@/components/table/data-table"
import { invoiceColumns } from "@/pages/invoices/columns"
import { Invoice, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    invoices: DataTableResponse<Invoice>
    statusOptions: string[]
    can: { create: boolean }
}

export default function InvoicesIndexPage({ invoices, statusOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Invoices", href: "/invoices" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sales Invoices</h1>
                        <p className="text-muted-foreground">
                            Generate and track invoices issued to tenants
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/invoices/create')}>
                            <Plus className="h-4 w-4" />
                            Generate Invoice
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={invoiceColumns}
                    data={invoices}
                    searchColumn="number"
                    searchPlaceholder="Search by invoice number or tenant..."
                    filters={[
                        {
                            column: "status",
                            title: "Status",
                            options: statusOptions.map((s) => ({
                                label: s.charAt(0).toUpperCase() + s.slice(1),
                                value: s,
                            })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}