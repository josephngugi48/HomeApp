import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { Role } from "@/types";
import { router } from "@inertiajs/react";
import { Shield, Edit, Trash2, Key } from "lucide-react";

export const roleColumns: ColumnDef<Role>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role Name" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "guard_name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Guard" />
        ),
        cell: ({ row }) => {
            const guardName = row.getValue("guard_name") as string;

            return (
                <div className="flex items-center">
                    <Badge variant="outline" className="capitalize">
                        {guardName}
                    </Badge>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "permissions_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Permissions" />
        ),
        cell: ({ row }: any) => {
            const count = row.original.permissions_count || 0;
            return (
                <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{count}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="text-sm text-muted-foreground">
                    {date.toLocaleDateString()}
                </div>
            );
        },
        enableSorting: true,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const role = row.original;

            const actions = [
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (data: Role) => {
                        router.get(`/roles-and-permissions/${data.id}/edit`);
                    },
                    shortcut: "⌘E",
                },
                {
                    label: "Manage Permissions",
                    icon: Key,
                    onClick: (data: Role) => {
                        router.get(`/roles-and-permissions/${data.id}/permissions`);
                    },
                    shortcut: "⌘P",
                },
                {
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: (data: Role) => {
                        if (confirm(`Are you sure you want to delete "${data.name}"?`)) {
                            router.delete(`/roles-and-permissions/${data.id}`, {
                                preserveScroll: true,
                                onSuccess: () => {
                                    // Optional: Show success message
                                },
                            });
                        }
                    },
                    show: role.name !== "super-admin", // Hide delete for super-admin
                    shortcut: "⌘⌫",
                },
            ];

            return <DataTableRowActions row={row} actions={actions} />;
        },
    },
];