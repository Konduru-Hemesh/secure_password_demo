import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { VaultEntry, VaultState } from '@/shared/models/vault.types';
import { cryptoService } from '@/shared/sync/crypto.service';
import { syncService } from '@/shared/sync/sync.service';
import { SyncQueueManager } from '@/shared/sync/sync.queue';
import { getDeviceInfo } from '@/shared/utils/device.utils';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface VaultContextType {
    entries: VaultEntry[];
    vaultVersion: number;
    serverVersion: number;
    isSyncing: boolean;
    isOnline: boolean;
    syncStatus: 'synced' | 'pending' | 'syncing' | 'offline' | 'error';
    lastSynced: string | null;
    addEntry: (entry: Omit<VaultEntry, 'id' | 'version' | 'updatedAt' | 'passwordHistory'>) => Promise<void>;
    updateEntry: (id: number, entry: Partial<VaultEntry>) => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
    syncVault: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api/vault';

/**
 * Provider component for the Vault Context.
 * 
 * Manages the state of the encrypted vault, handling:
 * - Local storage persistence
 * - Syncing with the backend server (Delta-based sync)
 * - Conflict resolution (Last Writer Wins)
 * - Offline support with an "outbox" pattern
 * - Automatic versioning of entries
 * 
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const { user, token, logout } = useAuth();
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [vaultVersion, setVaultVersion] = useState<number>(0);
    const [serverVersion, setServerVersion] = useState<number>(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [syncError, setSyncError] = useState(false);
    const [syncConflict, setSyncConflict] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);
    const userId = user?.id;

    const queueManager = useMemo(() => {
        if (!userId) return null;
        return new SyncQueueManager(userId);
    }, [userId]);

    const [queueSize, setQueueSize] = useState(0);

    // Update queue size whenever outbox changes
    const updateQueueSize = useCallback(() => {
        if (queueManager) {
            setQueueSize(queueManager.size);
        }
    }, [queueManager]);

    // Stable refs to avoid re-triggering effects when callback references change
    const logoutRef = useRef(logout);
    const showToastRef = useRef(showToast);
    const tokenRef = useRef(token);
    // Flag: true when a cross-tab BroadcastChannel message triggered a state update.
    // Prevents the persist effect from re-broadcasting back, which would cause an infinite loop.
    const isCrossTabUpdateRef = useRef(false);
    useEffect(() => { logoutRef.current = logout; }, [logout]);
    useEffect(() => { showToastRef.current = showToast; }, [showToast]);
    useEffect(() => { tokenRef.current = token; }, [token]);

    const syncStatus = useMemo(() => {
        if (syncConflict) return 'error';
        if (syncError) return 'error';
        if (isSyncing) return 'syncing';
        if (queueSize > 0) return 'pending';
        // Check version mismatch (Pending means we have local changes not yet synced/outboxed)
        if (vaultVersion > serverVersion) return 'pending';
        return isOnline ? 'synced' : 'offline';
    }, [isSyncing, syncError, syncConflict, vaultVersion, serverVersion, isOnline, queueSize]);

    // Initialize logic — runs only when user or token changes (not on network toggle)
    useEffect(() => {
        let mounted = true;
        const initializeVault = async () => {
            if (!userId || !token) return;

            // Load Outbox via QueueManager
            let currentOutbox: import('@/shared/models/vault.types').OutboxEvent[] = [];
            if (queueManager) {
                currentOutbox = queueManager.getQueue();
                setQueueSize(currentOutbox.length);
            }

            // Read localStorage regardless — used as fallback / merge source
            let localEntries: VaultEntry[] = [];
            let localVersion = 0;
            try {
                const savedData = localStorage.getItem(`vault_storage_${userId}`);
                if (savedData) {
                    const parsed: VaultState = JSON.parse(savedData);
                    localEntries = parsed.entries || [];
                    localVersion = parsed.vaultVersion || 0;
                }
            } catch (e) {
                console.warn('Could not read localStorage on init', e);
            }

            // --- Device Registration ---
            const deviceIdStorageKey = `vault_device_id_${userId}`;
            let deviceId = localStorage.getItem(deviceIdStorageKey);
            if (!deviceId) {
                deviceId = crypto.randomUUID();
                localStorage.setItem(deviceIdStorageKey, deviceId);
            }

            try {
                const deviceInfo = getDeviceInfo();
                await fetch('http://localhost:5000/api/devices/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        device_id: deviceId,
                        device_name: deviceInfo
                    })
                });
                console.log('Device registered/updated:', deviceInfo);
            } catch (e) {
                console.warn('Failed to register device during init', e);
            }
            // ---------------------------

            // 1. Always try to fetch from server first (source of truth)
            try {
                const response = await fetch(API_BASE_URL, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!mounted) return;

                if (response.status === 401) {
                    console.error('Server rejected token. Logging out.');
                    showToastRef.current('Session expired. Please log in again.', 'error');
                    logoutRef.current();
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    const serverVer = data.vaultVersion || 0;
                    const serverEntries: VaultEntry[] = (data.encryptedEntries || []).filter(
                        (e: VaultEntry) => !e.isDeleted
                    );

                    console.log(`Init: server has ${serverEntries.length} entries (v${serverVer}), local has ${localEntries.length} entries (v${localVersion})`);

                    // Check for stale outbox
                    if (currentOutbox.length > 0) {
                        const firstEvent = currentOutbox[0];
                        if (firstEvent.delta.baseVersion !== serverVer) {
                            console.warn(`Stale outbox (Base v${firstEvent.delta.baseVersion} vs Server v${serverVer}). Discarding.`);
                            queueManager?.clear();
                            currentOutbox = [];
                            updateQueueSize();
                        }
                    }

                    if (currentOutbox.length > 0) {
                        // Pending local changes — keep local state, process queue will sync
                        console.log('Outbox has pending changes — keeping local state.');
                        if (mounted) {
                            setEntries(localEntries);
                            setVaultVersion(localVersion);
                            setServerVersion(serverVer);
                        }
                    } else if (serverEntries.length > 0) {
                        // Server has data — it's authoritative
                        console.log('Using server entries as source of truth.');
                        if (mounted) {
                            setEntries(serverEntries);
                            setVaultVersion(serverVer);
                            setServerVersion(serverVer);
                        }
                    } else if (localEntries.length > 0) {
                        // Server empty but local has data — restore local data and push to server
                        // This happens when: user clears server, server resets, or first sync on a new account
                        console.log('Server empty but local has data. Restoring local entries and scheduling upload to server.');
                        if (mounted) {
                            setEntries(localEntries);
                            // Bump vaultVersion above serverVersion to trigger syncVault auto-push
                            const bumpedVersion = Math.max(localVersion, serverVer) + 1;
                            setVaultVersion(bumpedVersion);
                            setServerVersion(serverVer);
                            showToastRef.current('Local entries restored — syncing to server...', 'info');
                        }
                    } else {
                        // Both server and local are empty — new user, fresh state
                        console.log('Both server and local are empty. Fresh vault.');
                        if (mounted) {
                            setEntries([]);
                            setVaultVersion(serverVer);
                            setServerVersion(serverVer);
                        }
                    }

                    if (mounted) {
                        setSyncError(false);
                        setSyncConflict(false);
                    }
                    return;
                }
            } catch (e) {
                console.error('Failed to fetch vault from server', e);
                if (mounted) setSyncError(true);
            }

            // 2. Fallback: server unreachable — use localStorage
            if (localEntries.length > 0 && mounted) {
                console.log('Server unreachable. Loading from localStorage.');
                setEntries(localEntries);
                setVaultVersion(localVersion);
            }
        };

        initializeVault();
        return () => { mounted = false; };
    }, [userId, token, queueManager, updateQueueSize]); // isOnline intentionally excluded — init runs on auth, not network change

    // BroadcastChannel for cross-tab eventual consistency
    // When another tab confirms a server sync, we do a fresh GET from the server
    // (NOT just localStorage) to ensure our state matches the authoritative server state.
    // This prevents a cascade where loading bumped localStorage versions triggers a re-sync loop.
    useEffect(() => {
        if (!userId) return;

        const channel = new BroadcastChannel(`vault_sync_channel_${userId}`);

        channel.onmessage = async (event) => {
            console.log('Cross-tab message received:', event.data.type);
            if (event.data.type === 'VAULT_UPDATED') {
                const currentToken = tokenRef.current;
                if (!currentToken) {
                    console.warn('Cross-tab update skipped: No token available.');
                    return;
                }

                try {
                    console.log('Fetching authoritative state from server for cross-tab update...');
                    const response = await fetch(API_BASE_URL, {
                        headers: { 'Authorization': `Bearer ${currentToken}` }
                    });
                    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

                    const data = await response.json();
                    const serverVer = data.vaultVersion || 0;
                    const serverEntries: VaultEntry[] = (data.encryptedEntries || []).filter(
                        (e: VaultEntry) => !e.isDeleted
                    );

                    console.log(`Cross-tab sync: Server has ${serverEntries.length} entries (v${serverVer})`);

                    // Mark as cross-tab update so persist effect doesn't re-broadcast
                    isCrossTabUpdateRef.current = true;
                    setEntries(serverEntries);
                    // Set both versions to the server version so auto-trigger never fires
                    setVaultVersion(serverVer);
                    setServerVersion(serverVer);
                    updateQueueSize();
                } catch (e) {
                    console.error('Cross-tab refresh from server failed:', e);
                }
            }
        };

        return () => { channel.close(); };
    }, [userId, updateQueueSize]);

    // Clear state on logout
    useEffect(() => {
        if (!userId) {
            setEntries([]);
            setVaultVersion(0);
            setServerVersion(0);
            setQueueSize(0);
            setSyncConflict(false);
        }
    }, [userId]);

    // Online/Offline listeners
    useEffect(() => {
        const handleOnline = () => {
            console.log('Network status: ONLINE');
            setIsOnline(true);
            showToast('Back online — resuming sync...', 'info');
        };
        const handleOffline = () => {
            console.log('Network status: OFFLINE');
            setIsOnline(false);
            showToast('Offline — changes queued', 'warning');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast]);

    // Define syncVault properly to be used in effects
    const syncVault = useCallback(async () => {
        if (!userId || syncConflict) return;

        // Force retry of pending items if called manually
        setRetryTrigger(prev => prev + 1);
        setSyncError(false); // Clear error allowing retry

        // Get or generate a device ID
        const storageKey = `vault_device_id_${userId}`;
        let deviceId = localStorage.getItem(storageKey);
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem(storageKey, deviceId);
        }

        console.log(`Checking for changes... Vault v${vaultVersion} vs Server v${serverVersion} on device ${deviceId}`);
        console.log('Entries:', entries.length);

        const delta = syncService.calculateDelta(entries, serverVersion, deviceId);
        console.log('Calculated Delta:', {
            added: delta.added.length,
            updated: delta.updated.length,
            deleted: delta.deleted.length,
            baseVersion: delta.baseVersion,
            eventId: delta.eventId
        });

        if (delta.added.length === 0 && delta.updated.length === 0 && delta.deleted.length === 0) {
            console.log(`No changes to sync (v${vaultVersion} matches server v${serverVersion}) — reconciling.`);
            setVaultVersion(prev => Math.max(prev, serverVersion) === serverVersion ? serverVersion : prev);
            return;
        }

        const event: import('@/shared/models/vault.types').OutboxEvent = {
            eventId: delta.eventId,
            timestamp: Date.now(),
            delta
        };

        console.log('Queueing event to outbox:', event);

        if (queueManager) {
            queueManager.enqueue(event);
            updateQueueSize();
        }

    }, [userId, entries, serverVersion, syncConflict, queueManager, updateQueueSize]); // vaultVersion implied by entries check

    // Auto-trigger sync generation when version changes
    useEffect(() => {
        // If we have changes (vault > server) and no pending outbox (or maybe we want to keep adding?)
        // If outbox is empty, definitely generate.
        // If outbox has items, we might want to wait? 
        // Current logic: If outbox is empty, we are ready to generate next batch.
        // CHANGED: Removed isOnline check so we queue to outbox even if offline.
        if (vaultVersion > serverVersion && queueSize === 0) {
            console.log('Auto-triggering syncVault...');
            syncVault();
        }
    }, [vaultVersion, serverVersion, queueSize, syncVault]);

    // Persist storage to localStorage — does NOT broadcast to other tabs.
    // Broadcasting only happens after a confirmed server sync, ensuring other tabs
    // only see changes that have been committed to Supabase (not offline-pending changes).
    useEffect(() => {
        if (userId) {
            const state: VaultState = { entries, vaultVersion, serverVersion };
            localStorage.setItem(`vault_storage_${userId}`, JSON.stringify(state));
        }
    }, [entries, vaultVersion, serverVersion, userId]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addEntry = useCallback(async (entryData: any) => {
        const newEntry: VaultEntry = {
            ...entryData,
            id: Date.now(),
            version: Math.max(vaultVersion, serverVersion) + 1,
            updatedAt: new Date().toISOString(),
            passwordHistory: [],
            isFavorite: entryData.isFavorite || false,
            isDeleted: false
        };

        newEntry.password = await cryptoService.encrypt(newEntry.password);

        setEntries(prev => [...prev, newEntry]);
        setVaultVersion(Math.max(vaultVersion, serverVersion) + 1);
        // Toast is shown by the caller (Dashboard) to avoid duplicates
    }, [vaultVersion, serverVersion]);

    const updateEntry = useCallback(async (id: number, entryData: Partial<VaultEntry>) => {
        const finalEntryData = { ...entryData };
        const existing = entries.find(e => e.id === id);

        if (existing && entryData.password && entryData.password !== existing.password) {
            finalEntryData.password = await cryptoService.encrypt(entryData.password);
        }

        setEntries(prev => prev.map(e => {
            if (e.id === id) {
                const isPasswordChanged = entryData.password && entryData.password !== e.password;
                let passwordHistory = e.passwordHistory || [];

                if (isPasswordChanged) {
                    passwordHistory = [
                        { password: e.password, changedAt: new Date().toISOString() },
                        ...passwordHistory.slice(0, 4)
                    ];
                }

                return {
                    ...e,
                    ...finalEntryData,
                    version: Math.max(vaultVersion, serverVersion) + 1,
                    updatedAt: new Date().toISOString(),
                    passwordHistory,
                    isDeleted: false
                };
            }
            return e;
        }));

        setVaultVersion(Math.max(vaultVersion, serverVersion) + 1);
        // Toast is shown by the caller (Dashboard) to avoid duplicates
    }, [entries, vaultVersion, serverVersion]);

    const deleteEntry = useCallback(async (id: number) => {
        console.log('deleteEntry triggered for id:', id);
        setEntries(prev => prev.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                    version: Math.max(vaultVersion, serverVersion) + 1,
                    updatedAt: new Date().toISOString()
                };
            }
            return e;
        }));
        setVaultVersion(Math.max(vaultVersion, serverVersion) + 1);
        // Toast is shown by the caller (Dashboard) to avoid duplicates
    }, [vaultVersion, serverVersion]);

    // Process Outbox Effect
    useEffect(() => {
        let mounted = true;
        const process = async () => {
            if (!queueManager) return;
            const currentOutbox = queueManager.getQueue();
            if (!isOnline || currentOutbox.length === 0 || syncConflict || !userId || !token) {
                // logs can be noisy, but good for debug
                // console.log('Skipping process:', { isOnline, len: outbox.length, syncConflict, userId });
                return;
            }

            setIsSyncing(true);
            const event = currentOutbox[0];
            console.log('Processing outbox event:', event.eventId);

            try {
                const response = await fetch(`${API_BASE_URL}/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(event.delta)
                });

                console.log(`Sync Response: ${response.status} ${response.statusText} for event ${event.eventId}`);

                if (response.status === 409) {
                    console.warn('Sync Conflict (409). Initiating client-side resolution...');
                    // 1. Fetch latest server state
                    const pullRes = await fetch(API_BASE_URL, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!pullRes.ok) throw new Error('Failed to pull server state for resolution');
                    const pullData = await pullRes.json();

                    // 2. Construct pseudo-delta for resolveConflicts
                    const serverDeltas: typeof event.delta = {
                        eventId: crypto.randomUUID(),
                        device_id: 'server',
                        added: [],
                        updated: pullData.encryptedEntries || [],
                        deleted: [],
                        baseVersion: pullData.vaultVersion || 0
                    };

                    // 3. Resolve conflicts
                    const resolvedEntries = syncService.resolveConflicts(entries, serverDeltas);
                    const newLocalVersion = Math.max(vaultVersion, pullData.vaultVersion || 0) + 1;

                    // 4. Update local state with version-stamped resolved entries
                    if (mounted) {
                        const versionedEntries = resolvedEntries.map(e => ({ ...e, version: newLocalVersion }));
                        console.log(`Conflict resolved locally. Pulled v${pullData.vaultVersion}, new converged v${newLocalVersion}. Enqueueing reconciliation sync.`);

                        setEntries(versionedEntries);
                        setVaultVersion(newLocalVersion);
                        setServerVersion(pullData.vaultVersion || 0);

                        // 5. Clear outbox to re-trigger generation with new baseVersion
                        queueManager?.clear();
                        updateQueueSize();
                        setSyncConflict(false);
                        setSyncError(false);
                        // Broadcast server-confirmed state to other tabs
                        const ch = new BroadcastChannel(`vault_sync_channel_${userId}`);
                        ch.postMessage({ type: 'VAULT_UPDATED', timestamp: Date.now() });
                        ch.close();
                        showToast('Conflict resolved. Syncing merged state...', 'info');
                    }
                    setIsSyncing(false);
                    return;
                }

                if (!response.ok) throw new Error(`Sync failed: ${response.statusText}`);

                const result = await response.json();
                console.log('Sync Success:', result);

                if (mounted) {
                    // Sync successful — remove from outbox
                    queueManager?.remove(event.eventId);
                    updateQueueSize();

                    if (result.entries) {
                        setEntries(result.entries);
                        setVaultVersion(result.vaultVersion || result.entries.length);
                    }
                    setServerVersion(result.vaultVersion || result.entries.length);
                    setLastSynced(result.lastSyncedAt);
                    setSyncError(false);

                    // Broadcast to other tabs ONLY now that the change is server-confirmed.
                    // This ensures Tab B does NOT show Tab A's offline changes until they're synced.
                    const ch = new BroadcastChannel(`vault_sync_channel_${userId}`);
                    ch.postMessage({ type: 'VAULT_UPDATED', timestamp: Date.now() });
                    ch.close();

                    showToast('Sync completed', 'success');
                }
            } catch (error) {
                console.error('Sync processing error', error);
                if (mounted) setSyncError(true);
            } finally {
                // If we unmount, we can't update state, but usually effect cleanup handles 'mounted'
                if (mounted) setIsSyncing(false);
            }
        };

        if (isOnline && queueSize > 0 && !isSyncing) {
            process();
        }

        return () => { mounted = false; };
    }, [queueSize, isOnline, syncConflict, token, userId, showToast, retryTrigger, queueManager, updateQueueSize]); // Added retryTrigger

    return (
        <VaultContext.Provider value={{
            entries: entries.filter(e => !e.isDeleted),
            vaultVersion,
            serverVersion,
            isSyncing,
            isOnline,
            syncStatus,
            lastSynced,
            addEntry,
            updateEntry,
            deleteEntry,
            syncVault
        }}>
            {children}
        </VaultContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
/**
 * Hook to access the Vault Context.
 * 
 * Provides access to vault items, sync status, and methods for modifying the vault.
 * 
 * @returns {VaultContextType} The vault context properties and methods.
 * @throws {Error} If used outside of a VaultProvider.
 */
export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) throw new Error('useVault must be used within a VaultProvider');
    return context;
};
