export interface User {
    id: string;
    email: string;
    displayName?: string;
    createdAt?: string;
    lastLoginAt?: string;
    loginCount?: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
