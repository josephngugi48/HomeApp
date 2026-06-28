// resources/js/pages/wallet/index.tsx
import { router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DataTableResponse, WalletRecord } from "@/types"
import { useDebouncedCallback } from "use-debounce"

const formatKES = (value: string | number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value))

interface PageProps {
    wallets: DataTableResponse<WalletRecord>
    filters: { search?: string }
}

export default function WalletIndexPage({ wallets, filters }: PageProps) {
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get("/wallet", { search: value }, { preserveState: true, replace: true })
    }, 350)

    return (
        <AppLayout breadcrumbs={[{ title: "Wallet", href: "/wallet" }]}>
            <div className="flex flex-col gap-8 p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Wallets</h1>
                    <p className="text-muted-foreground">
                        Tenants currently holding a wallet credit balance
                    </p>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        defaultValue={filters.search}
                        onChange={e => debouncedSearch(e.target.value)}
                        placeholder="Search tenant..."
                        className="pl-9"
                    />
                </div>

                <div className="grid gap-3">
                    {wallets.data.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No tenants currently hold a wallet credit.
                            </CardContent>
                        </Card>
                    )}
                    {wallets.data.map((wallet) => (
                        <Card key={wallet.id} className="cursor-pointer hover:bg-accent/30" onClick={() => router.get(`/wallet/${wallet.id}`)}>
                            <CardContent className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-medium">{wallet.tenant?.name}</p>
                                    <p className="text-sm text-muted-foreground">{wallet.tenant?.email}</p>
                                </div>
                                <p className="text-lg font-semibold text-success">{formatKES(wallet.balance)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}