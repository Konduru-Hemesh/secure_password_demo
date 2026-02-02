import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { VaultEntry, VaultState } from '../types/vault.types';
import { cryptoService } from '../services/crypto.service';
import { syncService } from '../services/sync.service';
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

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const { user, token } = useAuth();
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [vaultVersion, setVaultVersion] = useState<number>(0);
    const [serverVersion, setServerVersion] = useState<number>(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [syncError, setSyncError] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const userId = user?.id;

    const syncStatus = useMemo(() => {
        if (isSyncing) return 'syncing';
        if (syncError) return 'error';
        if (vaultVersion > serverVersion) return 'pending';
        return isOnline ? 'synced' : 'offline';
    }, [isSyncing, syncError, vaultVersion, serverVersion, isOnline]);

    // Initialize from server or localStorage
    useEffect(() => {
        const initializeVault = async () => {
            if (!userId) return;

            // 1. Try to fetch from server first
            if (isOnline && token) {
                try {
                    const response = await fetch(API_BASE_URL, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setEntries(data.encryptedEntries || []);
                        setVaultVersion(data.vaultVersion || 0);
                        setServerVersion(data.vaultVersion || 0);
                        setSyncError(false);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to fetch from server', e);
                    setSyncError(true);
                }
            }

            // 2. Fallback to localStorage
            const savedData = localStorage.getItem(`vault_storage_${userId}`);
            if (savedData) {
                try {
                    const parsed: VaultState = JSON.parse(savedData);
                    setEntries(parsed.entries || []);
                    setVaultVersion(parsed.vaultVersion || 0);
                    setServerVersion(parsed.serverVersion || 0);
                    setSyncError(false);
                } catch (e) {
                    console.error('Failed to parse vault storage', e);
                }
            }
        };

        initializeVault();
    }, [userId, isOnline]);

    // Clear state on logout
    useEffect(() => {
        if (!userId) {
            setEntries([]);
            setVaultVersion(0);
            setServerVersion(0);
        }
    }, [userId]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showToast('Back online — checking for updates...', 'info');
        };
        const handleOffline = () => {
            setIsOnline(false);
            showToast('Offline — changes will sync when online', 'warning');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast, vaultVersion, serverVersion]);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && vaultVersion > serverVersion && userId) {
            syncVault();
        }
    }, [isOnline, vaultVersion, serverVersion, userId]);

    // Persist to localStorage (User-scoped)
    useEffect(() => {
        if (userId) {
            const state: VaultState = { entries, vaultVersion, serverVersion };
            localStorage.setItem(`vault_storage_${userId}`, JSON.stringify(state));
        }
    }, [entries, vaultVersion, userId]);

    const addEntry = useCallback(async (entryData: any) => {
        const newEntry: VaultEntry = {
            ...entryData,
            id: Date.now(),
            version: 1,
            updatedAt: new Date().toISOString(),
            passwordHistory: [],
            isFavorite: entryData.isFavorite || false
        };

        newEntry.password = await cryptoService.encrypt(newEntry.password, 'master-key');

        setEntries(prev => [...prev, newEntry]);
        setVaultVersion(v => v + 1);
        showToast('Entry added successfully', 'success');
    }, [showToast]);

    const updateEntry = useCallback(async (id: number, entryData: Partial<VaultEntry>) => {
        let finalEntryData = { ...entryData };

        const existing = entries.find(e => e.id === id);
        if (existing && entryData.password && entryData.password !== existing.password) {
            finalEntryData.password = await cryptoService.encrypt(entryData.password, 'master-key');
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
                    version: e.version + 1,
                    updatedAt: new Date().toISOString(),
                    passwordHistory
                };
            }
            return e;
        }));
        setVaultVersion(v => v + 1);
        showToast('Entry updated successfully', 'success');
    }, [entries, showToast]);

    const deleteEntry = useCallback(async (id: number) => {
        setEntries(prev => prev.filter(e => e.id !== id));
        setVaultVersion(v => v + 1);
        showToast('Entry deleted', 'success');
    }, [showToast]);

    const syncVault = useCallback(async () => {
        if (isSyncing || !isOnline || !userId) return;
        setIsSyncing(true);
        setSyncError(false);
        console.log('Starting sync...', { vaultVersion, serverVersion, entriesCount: entries.length });

        try {
            const delta = syncService.calculateDelta(entries, serverVersion);

            if (delta.added.length === 0 && delta.updated.length === 0 && delta.deleted.length === 0 && vaultVersion === serverVersion) {
                setIsSyncing(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(delta)
            });

            if (!response.ok) throw new Error('Sync failed');

            const result = await response.json();

            setEntries(result.entries || []);
            setVaultVersion(result.vaultVersion || result.entries.length);
            setServerVersion(result.vaultVersion || result.entries.length);
            setLastSynced(result.lastSyncedAt);
            setSyncError(false);
            console.log('Sync success:', result.vaultVersion);

            showToast('Vault synchronized', 'success');
        } catch (error) {
            console.error('Sync failed', error);
            setSyncError(true);
            showToast('Sync failed. Using offline mode.', 'warning');
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, isOnline, userId, entries, vaultVersion, serverVersion, showToast]);

    return (
        <VaultContext.Provider value={{
            entries,
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

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) throw new Error('useVault must be used within a VaultProvider');
    return context;
};
