-- Supabase Schema for Zero Vault

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vault Entries table
CREATE TABLE IF NOT EXISTS vault_entries (
    id BIGINT PRIMARY KEY, -- We use client timestamp as ID currently
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(255),
    username VARCHAR(255),
    password TEXT NOT NULL, -- Encrypted
    website VARCHAR(255),
    category VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id VARCHAR(255),
    encrypted_history JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_vault_entries_user_id ON vault_entries(user_id);
CREATE INDEX idx_vault_entries_updated_at ON vault_entries(updated_at);

-- 3. Sync State (Optional, but good for tracking the user's latest vault version)
CREATE TABLE IF NOT EXISTS user_sync_state (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vault_version INTEGER NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
