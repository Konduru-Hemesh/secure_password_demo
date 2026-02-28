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
    encrypted_history?: Array<{
        encrypted_data: string;
        timestamp: string;
        device_id: string;
    }>;
    version: number;
    updatedAt: string;
    device_id?: string; // ID of the device that last mutated this entry
    isDeleted?: boolean;
    deletedAt?: string;
}

export interface VaultState {
    entries: VaultEntry[];
    vaultVersion: number;
    serverVersion: number;
}

export interface SyncDelta {
    eventId: string;
    device_id: string;     // Adding device mapped to sync delta
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
    server_base_version?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server_entries?: any[]; // Encrypted entries for conflict resolution
}

export interface OutboxEvent {
    eventId: string;
    timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delta: any;
}
