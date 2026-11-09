import { describe, expect, it } from 'bun:test';
import { parseFillMode, parseLegacyMode } from '../src/storage/mode';

describe('parseFillMode', () => {
    it('accepts crop and stretch', () => {
        expect(parseFillMode('crop')).toBe('crop');
        expect(parseFillMode('stretch')).toBe('stretch');
    });

    it('rejects unknown values', () => {
        expect(parseFillMode(undefined)).toBeNull();
        expect(parseFillMode(null)).toBeNull();
        expect(parseFillMode(true)).toBeNull();
        expect(parseFillMode('off')).toBeNull();
        expect(parseFillMode('CROP')).toBeNull();
        expect(parseFillMode('on')).toBeNull();
        expect(parseFillMode(1)).toBeNull();
    });
});

describe('parseLegacyMode', () => {
    it('accepts the three legacy modes', () => {
        expect(parseLegacyMode('off')).toBe('off');
        expect(parseLegacyMode('crop')).toBe('crop');
        expect(parseLegacyMode('stretch')).toBe('stretch');
    });

    it('rejects unknown values', () => {
        expect(parseLegacyMode(undefined)).toBeNull();
        expect(parseLegacyMode(null)).toBeNull();
        expect(parseLegacyMode(true)).toBeNull();
        expect(parseLegacyMode('CROP')).toBeNull();
        expect(parseLegacyMode('on')).toBeNull();
        expect(parseLegacyMode(1)).toBeNull();
    });
});
