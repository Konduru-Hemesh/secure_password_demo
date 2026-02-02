import mongoose, { Schema, Document } from 'mongoose';

export interface IVault extends Document {
    userId: string;
    vaultVersion: number;
    encryptedEntries: any[];
    lastSyncedAt: Date;
}

const VaultSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vaultVersion: { type: Number, default: 0 },
    encryptedEntries: { type: Array, default: [] },
    lastSyncedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVault>('Vault', VaultSchema);
