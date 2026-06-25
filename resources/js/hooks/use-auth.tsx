import { usePage } from "@inertiajs/react";
import { SharedData } from "@/types";

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    if (!auth?.user) return null;

    return {
        user: auth?.user ?? null,
        auth,
    };
}
