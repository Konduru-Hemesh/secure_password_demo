import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { supabase } from '../storage/supabaseClient';

const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis()
};

jest.mock('../storage/supabaseClient', () => ({
    supabase: {
        from: jest.fn()
    }
}));


let token: string;
const userId = '123e4567-e89b-12d3-a456-426614174000'; // UUID format

beforeAll(() => {
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
});

beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
});

describe('Vault API', () => {
    describe('GET /api/vault', () => {
        it('should create new sync state if none exists', async () => {
            // 1st single() call: sync_state lookup returns null
            // 2nd single() call: insert returns new sync_state
            mockBuilder.single
                .mockResolvedValueOnce({ data: null })
                .mockResolvedValueOnce({ data: { vault_version: 0, last_synced_at: 'now' } });

            // vault_entries lookup eq() returns empty array
            mockBuilder.eq.mockResolvedValueOnce({ data: [] });

            const res = await request(app)
                .get('/api/vault')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.vaultVersion).toBe(0);
        });
    });

    describe('POST /api/vault/sync', () => {
        it('should return 409 Conflict when baseVersion != serverVersion', async () => {
            // sync_state mock
            mockBuilder.single.mockResolvedValueOnce({
                data: { vault_version: 10, last_synced_at: 'now' }
            });

            // entries mock (for conflict payload)
            mockBuilder.eq.mockResolvedValueOnce({ data: [] });

            const delta = {
                baseVersion: 5,
                eventId: 'event-stale',
                added: [],
                updated: [],
                deleted: []
            };

            const response = await request(app)
                .post('/api/vault/sync')
                .set('Authorization', `Bearer ${token}`)
                .send(delta);

            expect(response.status).toBe(409);
            expect(response.body.error).toBe('Sync Conflict');
            expect(response.body.server_base_version).toBe(10);
        });
    });
});
