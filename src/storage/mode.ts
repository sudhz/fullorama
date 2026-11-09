/**
 * Modes — the two fill modes and their legacy three-state form.
 */

export type FillMode = 'crop' | 'stretch';

export type LegacyMode = 'off' | 'crop' | 'stretch';

export function parseFillMode(value: unknown): FillMode | null {
    return value === 'crop' || value === 'stretch' ? value : null;
}

export function parseLegacyMode(value: unknown): LegacyMode | null {
    return value === 'off' || value === 'crop' || value === 'stretch'
        ? value
        : null;
}
