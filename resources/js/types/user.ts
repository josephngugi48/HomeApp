// types/user.ts
export interface Status {
    id: number;
    name: string;
    slug: string;
    color: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    two_factor_confirmed_at: string | null;
    created_at: string;
    status: Status;
    status_id: any;
    roles: Role[];
    can?: {
        update?: boolean;
        delete?: boolean;
        // Add more as needed
    };

}
