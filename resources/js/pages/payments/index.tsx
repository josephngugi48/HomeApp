// resources/js/pages/payments/index.tsx
import { DataTable } from "@/components/table/data-table"
import { paymentColumns } from "@/pages/payments/columns"
import { PaymentRecord, DataTableResponse } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    payments: DataTableResponse<PaymentRecord>
    methodOptions: string[]
    can: { create: boolean }
}

export default function PaymentsIndexPage({ payments, methodOptions, can }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Payments", href: "/payments" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                        <p className="text-muted-foreground">
                            All recorded payments across channels
                        </p>
                    </div>
                    {can.create && (
                        <Button onClick={() => router.get('/payments/create')}>
                            <Plus className="h-4 w-4" />
                            Record Payment
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={paymentColumns}
                    data={payments}
                    searchColumn="ref"
                    searchPlaceholder="Search by receipt, reference, or tenant..."
                    filters={[
                        {
                            column: "method",
                            title: "Method",
                            options: methodOptions
                                .filter((m) => m !== "wallet") // not yet a usable method until Wallet ships
                                .map((m) => ({
                                    label: m === "mpesa" ? "M-Pesa" : m.charAt(0).toUpperCase() + m.slice(1),
                                    value: m,
                                })),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    )
}