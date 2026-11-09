/**
 * Modes — the three player states, persisted in extension storage.
 */

export type CropMode = 'off' | 'crop' | 'stretch';

export function parseMode(value: unknown): CropMode | null {
    return value === 'off' || value === 'crop' || value === 'stretch'
        ? value
        : null;
}

export function nextMode(mode: CropMode): CropMode {
    switch (mode) {
        case 'off':
            return 'crop';
        case 'crop':
            return 'stretch';
        case 'stretch':
            return 'off';
    }
}
