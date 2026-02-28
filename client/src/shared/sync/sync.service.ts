import type { VaultEntry, SyncDelta } from '@/shared/models/vault.types';

export const syncService = {
    /**
     * Calculates the differences (delta) between the local vault state and the server's base version.
     * 
     * @param {VaultEntry[]} localEntries - Current local vault entries.
     * @param {number} baseVersion - Server's current base version.
     * @param {string} deviceId - ID of the device generating the delta.
     * @returns {SyncDelta} Delta payload.
     */
    calculateDelta: (localEntries: VaultEntry[], baseVersion: number, deviceId: string): SyncDelta => {
        const changes = localEntries.filter(e => e.version > baseVersion);

        return {
            eventId: crypto.randomUUID(),
            device_id: deviceId,
            added: [],
            updated: changes,
            deleted: [],
            baseVersion
        };
    },

    /**
     * Merges server changes into the local state and resolves conflicts.
     * Implements a deterministic "Last Writer Wins" (LWW) strategy.
     * Tie-breaker: device_id lexicographical comparison.
     * 
     * @param {VaultEntry[]} localEntries - Current local entries.
     * @param {SyncDelta} serverDeltas - Changes from server.
     * @returns {VaultEntry[]} A resolved array of entries.
     */
    resolveConflicts: (localEntries: VaultEntry[], serverDeltas: SyncDelta): VaultEntry[] => {
        const mergedMap = new Map<number, VaultEntry>();

        // Add all local entries to map
        localEntries.forEach(e => mergedMap.set(e.id, { ...e }));

        serverDeltas.added.forEach(serverEntry => {
            if (!mergedMap.has(serverEntry.id)) {
                mergedMap.set(serverEntry.id, { ...serverEntry });
            }
        });

        serverDeltas.updated.forEach(serverEntry => {
            const localEntry = mergedMap.get(serverEntry.id);
            if (localEntry) {
                const localTime = new Date(localEntry.updatedAt).getTime();
                const serverTime = new Date(serverEntry.updatedAt).getTime();

                // Deterministic LWW
                let serverWins = false;
                if (serverTime > localTime) {
                    serverWins = true;
                } else if (serverTime === localTime) {
                    // Tie-breaker based on device_id (if exists on both, otherwise prefer server for safety or local)
                    const localDev = localEntry.device_id || '';
                    const serverDev = serverEntry.device_id || serverDeltas.device_id;
                    if (serverDev > localDev) {
                        serverWins = true;
                    }
                }

                if (serverWins) {
                    // Store local as encrypted history (loss)
                    const history = localEntry.encrypted_history || [];
                    const lostVersionParams = {
                        encrypted_data: localEntry.password, // Ideally full entry delta, but password is the secret
                        timestamp: localEntry.updatedAt,
                        device_id: localEntry.device_id || 'unknown'
                    };

                    mergedMap.set(serverEntry.id, {
                        ...serverEntry,
                        encrypted_history: [lostVersionParams, ...history.slice(0, 9)]
                    });
                } else {
                    // Local wins, server entry becomes history
                    const history = localEntry.encrypted_history || [];
                    const lostVersionParams = {
                        encrypted_data: serverEntry.password,
                        timestamp: serverEntry.updatedAt,
                        device_id: serverEntry.device_id || serverDeltas.device_id || 'unknown'
                    };

                    mergedMap.set(localEntry.id, {
                        ...localEntry,
                        encrypted_history: [lostVersionParams, ...history.slice(0, 9)]
                    });
                }
            } else {
                mergedMap.set(serverEntry.id, { ...serverEntry });
            }
        });

        // Technically deleted is empty, but we process it safely if populated
        serverDeltas.deleted.forEach(id => {
            mergedMap.delete(id);
        });

        return Array.from(mergedMap.values());
    },

    /**
     * Calculates a deterministic hash of the vault entries using SHA-256.
     * Helps ensure convergence across devices securely.
     */
    calculateVaultHash: async (entries: VaultEntry[]): Promise<string> => {
        // Sort deterministically to ensure identical state produces identical hash
        const sorted = [...entries].sort((a, b) => a.id - b.id).map(e => ({
            id: e.id,
            v: e.version,
            u: e.updatedAt,
            p: e.password // already encrypted
        }));

        const payloadStr = JSON.stringify(sorted);
        const msgBuffer = new TextEncoder().encode(payloadStr);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
};
