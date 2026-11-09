import { describe, expect, it } from 'bun:test';
import { nextMode, parseMode } from '../src/storage/mode';

describe('parseMode', () => {
    it('accepts the three known modes', () => {
        expect(parseMode('off')).toBe('off');
        expect(parseMode('crop')).toBe('crop');
        expect(parseMode('stretch')).toBe('stretch');
    });

    it('rejects unknown values', () => {
        expect(parseMode(undefined)).toBeNull();
        expect(parseMode(null)).toBeNull();
        expect(parseMode(true)).toBeNull();
        expect(parseMode('CROP')).toBeNull();
        expect(parseMode('on')).toBeNull();
        expect(parseMode(1)).toBeNull();
    });
});

describe('nextMode', () => {
    it('cycles off -> crop -> stretch -> off', () => {
        expect(nextMode('off')).toBe('crop');
        expect(nextMode('crop')).toBe('stretch');
        expect(nextMode('stretch')).toBe('off');
    });
});
