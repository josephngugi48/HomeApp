
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the action type
export interface RowAction<TData> {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (data: TData) => void;
    variant?: "default" | "destructive";
    show?: boolean; // Simple boolean for conditional rendering
    shortcut?: string;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    actions: RowAction<TData>[]; // Changed from 'action' to 'actions' (plural)
}

export function DataTableRowActions<TData>({
    row,
    actions,
}: DataTableRowActionsProps<TData>) {
    const data = row.original;

    // Filter out actions where show is false
    const visibleActions = actions.filter(action => action.show !== false);

    if (visibleActions.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="data-[state=open]:bg-muted size-8"
                >
                    <MoreHorizontal />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {visibleActions.map((action, index) => {
                    const Icon = action.icon;
                    const isDestructive = action.variant === "destructive";
                    const needsSeparator = isDestructive && index > 0;

                    return (
                        <div key={index}>
                            {needsSeparator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => action.onClick(data)}
                                className={isDestructive ? "text-destructive focus:text-destructive" : ""}
                            >
                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                {action.label}
                                {action.shortcut && (
                                    <DropdownMenuShortcut>
                                        {action.shortcut}
                                    </DropdownMenuShortcut>
                                )}
                            </DropdownMenuItem>
                        </div>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}