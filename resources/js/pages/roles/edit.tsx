import AppLayout from "@/layouts/app-layout"
import { Head, router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronUp, CheckSquare, Square } from "lucide-react"
import { useState, useMemo } from "react"
import { Role } from "@/types"

interface Props {
    role: Role & { permissions: any[] }
    permissions: any[]
}

function groupPermissions(permissions: any[]) {
    return permissions.reduce((acc, permission) => {
        const module = permission.name.split(" ").pop()!
        if (!acc[module]) acc[module] = []
        acc[module].push(permission)
        return acc
    }, {} as Record<string, any[]>)
}

export default function EditRole({ role, permissions }: Props) {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

    const grouped = useMemo(() => groupPermissions(permissions), [permissions])

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        guard_name: role.guard_name,
        permissions: role.permissions.map(p => p.id),
    })

    // Filter modules and permissions based on search
    const filteredGrouped = useMemo(() => {
        if (!searchQuery) return grouped

        const filtered: Record<string, any[]> = {}
        Object.entries(grouped).forEach(([module, perms]: any) => {
            const matchingPerms = perms.filter((p: any) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (matchingPerms.length > 0) {
                filtered[module] = matchingPerms
            }
        })
        return filtered
    }, [grouped, searchQuery])

    const togglePermission = (id: number) => {
        setData(
            "permissions",
            data.permissions.includes(id)
                ? data.permissions.filter(p => p !== id)
                : [...data.permissions, id]
        )
    }

    const toggleModule = (modulePermissions: any[]) => {
        const ids = modulePermissions.map(p => p.id)
        const allSelected = ids.every(id => data.permissions.includes(id))

        setData(
            "permissions",
            allSelected
                ? data.permissions.filter(id => !ids.includes(id))
                : Array.from(new Set([...data.permissions, ...ids]))
        )
    }

    const toggleModuleExpanded = (module: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev)
            if (next.has(module)) {
                next.delete(module)
            } else {
                next.add(module)
            }
            return next
        })
    }

    const selectAll = () => {
        setData("permissions", permissions.map(p => p.id))
    }

    const deselectAll = () => {
        setData("permissions", [])
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/roles/${role.id}`)
    }

    const totalSelected = data.permissions.length
    const totalPermissions = permissions.length

    return (
        <AppLayout>
            <Head title={`Edit Role - ${role.name}`} />

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background border-b mb-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Edit Role: {role.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Update role details and manage permissions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                            {totalSelected} of {totalPermissions} selected
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={() => router.get('/roles')}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing ? "Updating..." : "Update Role"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 px-6 py-4">
                {/* Sidebar - Role Details */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Basic information
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Role Name *</Label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                    placeholder="e.g., Admin, Editor"
                                    disabled={role.name === 'super-admin'}
                                />
                                {role.name === 'super-admin' && (
                                    <p className="text-xs text-muted-foreground">
                                        Super admin role name cannot be changed
                                    </p>
                                )}
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Guard</Label>
                                <Input
                                    value={data.guard_name}
                                    onChange={e => setData("guard_name", e.target.value)}
                                    disabled
                                />
                                {errors.guard_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.guard_name}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Quick Actions</p>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAll}
                                        className="w-full justify-start"
                                    >
                                        <CheckSquare className="h-4 w-4 mr-2" />
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={deselectAll}
                                        className="w-full justify-start"
                                    >
                                        <Square className="h-4 w-4 mr-2" />
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Permissions */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Search Bar */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search permissions or modules..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permission Modules */}
                    {Object.entries(filteredGrouped).length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No permissions found matching "{searchQuery}"
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(filteredGrouped).map(([module, perms]: any) => {
                            const selectedCount = perms.filter((p: any) =>
                                data.permissions.includes(p.id)
                            ).length
                            const allSelected = selectedCount === perms.length
                            const someSelected = selectedCount > 0 && !allSelected
                            const isExpanded = expandedModules.has(module)

                            return (
                                <Card key={module}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleModuleExpanded(module)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="capitalize text-lg">
                                                            {module}
                                                        </CardTitle>
                                                        <Badge
                                                            variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                                                        >
                                                            {selectedCount}/{perms.length}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>
                                                        {perms.length} permission{perms.length !== 1 ? 's' : ''} available
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={allSelected ? "default" : "outline"}
                                                onClick={() => toggleModule(perms)}
                                            >
                                                {allSelected ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <>
                                            <Separator />
                                            <CardContent className="pt-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                    {perms.map((permission: any) => (
                                                        <label
                                                            key={permission.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                                                        >
                                                            <Checkbox
                                                                checked={data.permissions.includes(permission.id)}
                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {permission.name.replace(` ${module}`, '')}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </>
                                    )}
                                </Card>
                            )
                        })
                    )}

                    {errors.permissions && (
                        <Card className="border-destructive">
                            <CardContent className="pt-6">
                                <p className="text-sm text-destructive">
                                    {errors.permissions}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}