/**
 * Simple crypto service for demonstration.
 * In a real production app, this would use Web Crypto API (SubtleCrypto)
 * with proper key derivation (PBKDF2/Argon2) from a master password.
 */

const SECRET_PREFIX = 'ENC:';

export const cryptoService = {
    encrypt: async (text: string, _key: string): Promise<string> => {
        // Mock encryption: Base64 + prefix
        // In reality: await window.crypto.subtle.encrypt(...)
        return SECRET_PREFIX + btoa(text);
    },

    decrypt: async (encryptedText: string, _key: string): Promise<string> => {
        if (!encryptedText.startsWith(SECRET_PREFIX)) return encryptedText;
        try {
            // Mock decryption: remove prefix + atob
            return atob(encryptedText.substring(SECRET_PREFIX.length));
        } catch {
            return encryptedText;
        }
    }
};
