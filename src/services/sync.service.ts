import type { VaultEntry, SyncDelta } from '../types/vault.types';

export const syncService = {
    /**
     * Calculates the delta between the local state and the base version.
     * In this simple implementation, we assume the base version is what the server last saw.
     */
    calculateDelta: (localEntries: VaultEntry[], baseVersion: number): SyncDelta => {
        return {
            added: localEntries.filter(e => e.version === 1),
            updated: localEntries.filter(e => e.version > 1),
            deleted: [],
            baseVersion: baseVersion
        };
    },

    /**
     * Resolves conflicts deterministically.
     * Strategy: Last Writer Wins (based on updatedAt)
     */
    resolveConflicts: (localEntries: VaultEntry[], serverDeltas: SyncDelta): VaultEntry[] => {
        let merged = [...localEntries];

        // Handle Added from Server
        serverDeltas.added.forEach(serverEntry => {
            if (!merged.find(e => e.id === serverEntry.id)) {
                merged.push(serverEntry);
            }
        });

        serverDeltas.updated.forEach(serverEntry => {
            const index = merged.findIndex(e => e.id === serverEntry.id);
            if (index !== -1) {
                const localEntry = merged[index];
                if (new Date(serverEntry.updatedAt) > new Date(localEntry.updatedAt)) {
                    // Conflict detected (Server is newer)
                    // Store local state in conflict history before overwriting
                    const conflictHistory = localEntry.conflictHistory || [];
                    merged[index] = {
                        ...serverEntry,
                        conflictHistory: [
                            {
                                password: localEntry.password,
                                resolvedAt: new Date().toISOString(),
                                resolution: 'server-wins'
                            },
                            ...conflictHistory.slice(0, 4) // Keep last 5
                        ]
                    };
                }
            } else {
                merged.push(serverEntry);
            }
        });

        // Handle Deleted from Server
        serverDeltas.deleted.forEach(id => {
            merged = merged.filter(e => e.id !== id);
        });

        return merged;
    }
};
