import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength } from './passwordStrength';

describe('calculatePasswordStrength', () => {
    it('should return score 0 for empty password', () => {
        const result = calculatePasswordStrength('');
        expect(result.score).toBe(0);
        expect(result.label).toBe('None');
    });

    it('should score 4 for a strong password', () => {
        // Length > 12, Mixed Case, Number, Special Char
        const strongPass = 'StrongPass123!';
        const result = calculatePasswordStrength(strongPass);
        expect(result.score).toBe(4);
        expect(result.label).toBe('Strong');
    });

    it('should score lower for weak passwords', () => {
        const weakPass = 'weak';
        const result = calculatePasswordStrength(weakPass);
        expect(result.score).toBeLessThan(2);
    });
});
