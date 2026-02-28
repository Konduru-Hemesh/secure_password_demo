import express, { Response } from 'express';
import { supabase } from '../storage/supabaseClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/vault
 * Retrieves the full vault metadata and entries.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        let { data: syncState } = await supabase
            .from('user_sync_state')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (!syncState) {
            const { data: newState, error } = await supabase
                .from('user_sync_state')
                .insert([{ user_id: userId, vault_version: 0 }])
                .select()
                .single();
            if (error) throw error;
            syncState = newState;
        }

        const { data: entries } = await supabase
            .from('vault_entries')
            .select(`
                id, version, title, username, password, website, category,
                is_favorite, is_deleted, deleted_at, updated_at, device_id, encrypted_history
            `)
            .eq('user_id', userId);

        // Convert the flat postgres rows into the expected JSON format matching the frontend model
        const formattedEntries = (entries || []).map(row => ({
            id: Number(row.id),
            version: row.version,
            title: row.title,
            username: row.username,
            password: row.password,
            website: row.website,
            category: row.category,
            isFavorite: row.is_favorite,
            isDeleted: row.is_deleted,
            deletedAt: row.deleted_at,
            updatedAt: row.updated_at,
            device_id: row.device_id,
            encrypted_history: row.encrypted_history
        }));

        res.json({
            userId,
            vaultVersion: syncState.vault_version,
            encryptedEntries: formattedEntries,
            lastSyncedAt: syncState.last_synced_at
        });
    } catch (error) {
        console.error('Get Vault Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * POST /api/vault/sync
 * Merges missing client deltas.
 */
router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { baseVersion, added, updated, deleted } = req.body;

        const { data: syncState } = await supabase
            .from('user_sync_state')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (!syncState) return res.status(404).json({ error: 'Vault sync state not found' });

        if (baseVersion !== syncState.vault_version) {
            // Fetch current entries to return 409 conflict payload
            const { data: entries } = await supabase
                .from('vault_entries')
                .select('*')
                .eq('user_id', userId);

            const formattedEntries = (entries || []).map(row => ({
                id: Number(row.id),
                version: row.version,
                title: row.title,
                username: row.username,
                password: row.password,
                website: row.website,
                category: row.category,
                isFavorite: row.is_favorite,
                isDeleted: row.is_deleted,
                deletedAt: row.deleted_at,
                updatedAt: row.updated_at,
                device_id: row.device_id,
                encrypted_history: row.encrypted_history
            }));

            return res.status(409).json({
                error: 'Sync Conflict',
                server_base_version: syncState.vault_version,
                vaultVersion: syncState.vault_version,
                encryptedEntries: formattedEntries
            });
        }

        const nextVersion = syncState.vault_version + 1;
        const upserts: any[] = [];

        // Apply Added
        if (added && added.length > 0) {
            added.forEach((entry: any) => {
                upserts.push({
                    id: entry.id,
                    user_id: userId,
                    version: nextVersion,
                    title: entry.title,
                    username: entry.username,
                    password: entry.password,
                    website: entry.website,
                    category: entry.category,
                    is_favorite: entry.isFavorite,
                    is_deleted: entry.isDeleted || false,
                    deleted_at: entry.deletedAt,
                    updated_at: entry.updatedAt,
                    device_id: entry.device_id,
                    encrypted_history: entry.encrypted_history || []
                });
            });
        }

        // Apply Updated
        if (updated && updated.length > 0) {
            updated.forEach((entry: any) => {
                upserts.push({
                    id: entry.id,
                    user_id: userId,
                    version: nextVersion,
                    title: entry.title,
                    username: entry.username,
                    password: entry.password,
                    website: entry.website,
                    category: entry.category,
                    is_favorite: entry.isFavorite,
                    is_deleted: entry.isDeleted || false,
                    deleted_at: entry.deletedAt,
                    updated_at: entry.updatedAt,
                    device_id: entry.device_id,
                    encrypted_history: entry.encrypted_history || []
                });
            });
        }

        // Perform upserts to Vault Entries
        if (upserts.length > 0) {
            const { error: upsertError } = await supabase
                .from('vault_entries')
                .upsert(upserts, { onConflict: 'id' });
            if (upsertError) throw upsertError;
        }

        // Apply Deletions (Physical)
        if (deleted && deleted.length > 0) {
            await supabase
                .from('vault_entries')
                .delete()
                .in('id', deleted)
                .eq('user_id', userId);
        }

        // Update Sync State
        const now = new Date().toISOString();
        await supabase
            .from('user_sync_state')
            .update({ vault_version: nextVersion, last_synced_at: now })
            .eq('user_id', userId);

        // Fetch back final state
        const { data: finalEntries } = await supabase
            .from('vault_entries')
            .select('*')
            .eq('user_id', userId);

        const formattedFinalEntries = (finalEntries || []).map(row => ({
            id: Number(row.id),
            version: row.version,
            title: row.title,
            username: row.username,
            password: row.password,
            website: row.website,
            category: row.category,
            isFavorite: row.is_favorite,
            isDeleted: row.is_deleted,
            deletedAt: row.deleted_at,
            updatedAt: row.updated_at,
            device_id: row.device_id,
            encrypted_history: row.encrypted_history
        }));

        res.json({
            success: true,
            vaultVersion: nextVersion,
            entries: formattedFinalEntries,
            lastSyncedAt: now
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;
