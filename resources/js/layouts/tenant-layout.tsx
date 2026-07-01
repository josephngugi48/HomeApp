// resources/js/layouts/tenant-layout.tsx
import { Head, Link, usePage } from '@inertiajs/react'
import { type SharedData } from '@/types'
import { useState } from 'react'
import {
    FileText, CreditCard, Wallet, AlertCircle, Wrench, FileCheck,
    LogOut, Menu, X, Home,
} from 'lucide-react'

interface Props {
    children: React.ReactNode
    title?: string
}

const navItems = [
    { href: '/tenant/invoices', label: 'Invoices', icon: FileText },
    { href: '/tenant/payments', label: 'Payments', icon: CreditCard },
    { href: '/tenant/wallet', label: 'Wallet', icon: Wallet },
    { href: '/tenant/issues', label: 'Issues', icon: AlertCircle },
    { href: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/tenant/documents', label: 'Documents', icon: FileCheck },
]

export default function TenantLayout({ children, title }: Props) {
    const { auth } = usePage<SharedData>().props
    const [mobileOpen, setMobileOpen] = useState(false)
    const currentPath = window.location.pathname

    const isActive = (href: string) => currentPath.startsWith(href)

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F7F3EC' }}>
            {title && <Head title={title} />}

            {/* Top nav */}
            <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden rounded-md p-1.5 text-stone-600 hover:bg-stone-100"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        <Link href="/tenant/dashboard" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#1B4332' }}>
                                <Home className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-stone-800">PropTap</span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'text-white'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                    style={active ? { backgroundColor: '#1B4332' } : {}}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-stone-600 md:block">
                            {auth.user.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">Sign out</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile nav */}
                {mobileOpen && (
                    <div className="border-t border-stone-200 bg-white md:hidden">
                        <nav className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
                                            active ? 'text-white' : 'text-stone-700 hover:bg-stone-100'
                                        }`}
                                        style={active ? { backgroundColor: '#1B4332' } : {}}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Page content */}
            <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
                {children}
            </main>
        </div>
    )
}