import express, { Request, Response } from 'express';
import Vault from '../models/Vault';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/vault - Get user's vault
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        let vault = await Vault.findOne({ userId });

        if (!vault) {
            // Create initial empty vault if not exists
            vault = new Vault({ userId, vaultVersion: 0, encryptedEntries: [] });
            await vault.save();
        }

        res.json(vault);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/vault/sync - Sync deltas
router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { baseVersion, added, updated, deleted } = req.body;

        const vault = await Vault.findOne({ userId });
        if (!vault) return res.status(404).json({ error: 'Vault not found' });

        // Conflict check
        if (baseVersion !== vault.vaultVersion) {
            // In a real production system, we might return a conflict state here
            // but for this implementation, we will perform Last-Write-Wins on the server 
            // and return the new unified state.
        }

        let currentEntries = [...vault.encryptedEntries];

        // Apply Deletions
        if (deleted && deleted.length > 0) {
            currentEntries = currentEntries.filter(e => !deleted.includes(e.id));
        }

        // Apply Additions
        if (added && added.length > 0) {
            added.forEach((newEntry: any) => {
                if (!currentEntries.find(e => e.id === newEntry.id)) {
                    currentEntries.push(newEntry);
                }
            });
        }

        // Apply Updates (Last-Write-Wins)
        if (updated && updated.length > 0) {
            updated.forEach((update: any) => {
                const index = currentEntries.findIndex(e => e.id === update.id);
                if (index !== -1) {
                    const existing = currentEntries[index];
                    // Server-side LWW check
                    if (new Date(update.updatedAt) > new Date(existing.updatedAt)) {
                        currentEntries[index] = {
                            ...update,
                            // Preserve history if present
                            conflictHistory: update.conflictHistory || existing.conflictHistory
                        };
                    }
                } else {
                    currentEntries.push(update);
                }
            });
        }

        // Increment Vault Version
        vault.vaultVersion += 1;
        vault.encryptedEntries = currentEntries;
        vault.lastSyncedAt = new Date();

        await vault.save();

        res.json({
            vaultVersion: vault.vaultVersion,
            entries: vault.encryptedEntries,
            lastSyncedAt: vault.lastSyncedAt
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

export default router;
