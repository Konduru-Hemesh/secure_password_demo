export interface VaultEntry {
    id: number;
    website: string;
    username: string;
    password: string;
    securityQuestion?: string;
    securityAnswer?: string;
    isFavorite: boolean;
    category?: string;
    passwordHistory?: Array<{ password: string; changedAt: string }>;
    conflictHistory?: Array<{
        password: string;
        resolvedAt: string;
        resolution: 'local-wins' | 'server-wins' | 'merged';
    }>;
    version: number;
    updatedAt: string;
}

export interface VaultState {
    entries: VaultEntry[];
    vaultVersion: number;
    serverVersion: number;
}

export interface SyncDelta {
    added: VaultEntry[];
    updated: VaultEntry[];
    deleted: number[];
    baseVersion: number;
}

export interface SyncResponse {
    success: boolean;
    vault_version: number;
    deltas?: {
        added: VaultEntry[];
        updated: VaultEntry[];
        deleted: number[];
    };
    conflict?: boolean;
}
