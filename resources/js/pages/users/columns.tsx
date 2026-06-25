import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { User } from "@/types/user";
import { router } from "@inertiajs/react";
import { Edit, Trash2 } from "lucide-react";

export const usersColumns: ColumnDef<User>[] = [

    // Name
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
    },

    // Email verification
    {
        accessorKey: "email_verified_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const value = row.original.email_verified_at;

            return value ? (
                <Badge variant="outline">
                    Verified
                </Badge>
            ) : (
                <Badge variant="destructive">
                    Not Verified
                </Badge>
            );
        },
    },

    // 2FA
    {
        accessorKey: "two_factor_confirmed_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="2FA" />
        ),
        cell: ({ row }) => {
            return row.original.two_factor_confirmed_at ? (
                <Badge variant="default">
                    Enabled
                </Badge>
            ) : (
                <Badge variant="secondary">
                    Disabled
                </Badge>
            );
        },
    },

    // Status
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status;

            return (
                <Badge
                    variant="outline"
                    className="capitalize"
                    style={{ color: status.color, borderColor: status.color }}
                >
                    {status.name}
                </Badge>
            );
        },
    },

    // Roles
    {
        accessorKey: "roles",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Roles" />
        ),
        cell: ({ row }) => {
            const roles = row.original.roles;

            if (!roles.length) {
                return <Badge variant="secondary">No Role</Badge>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map(role => (
                        <Badge key={role.id} variant="outline" className="capitalize">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            );
        },
    },

    // Created
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString("en-GB");
        },
    },

    // Actions
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;

            // ✅ Get abilities from the user object
            // These were added by the backend in the controller
            const canUpdate = user.can?.update ?? false;
            const canDelete = user.can?.delete ?? false;

            // Build actions array based on abilities
            const actions = [];

            // Show Edit button only if user has update permission
            if (canUpdate) {
                actions.push({
                    label: "Edit",
                    icon: Edit,
                    onClick: () => router.get(`/users/${user.id}/edit`),
                });
            }

            // Show Delete button only if user has delete permission
            if (canDelete) {
                actions.push({
                    label: "Delete",
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: () => {
                        if (confirm(`Delete user "${user.name}"?`)) {
                            router.delete(`/users/${user.id}`, {
                                preserveScroll: true,
                                onError: (errors) => {
                                    alert(errors.error || 'Failed to delete user');
                                }
                            });
                        }
                    },
                });
            }

            // If no actions available, don't render the actions dropdown
            if (actions.length === 0) {
                return null;
            }

            return (
                <DataTableRowActions
                    row={row}
                    actions={actions}
                />
            );
        },
    },
];
