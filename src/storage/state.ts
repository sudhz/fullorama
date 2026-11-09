/**
 * State — player mode persisted in extension storage.
 */

import { extensionApi } from '../platform/extension-api';
import { CropMode, nextMode, parseMode } from './mode';

export const STORAGE_KEY = 'cropMode';
const LEGACY_STORAGE_KEY = 'cropEnabled';

let mode: CropMode = 'off';

export function getMode(): CropMode {
    return mode;
}

function setMode(next: CropMode): void {
    mode = next;
    extensionApi.storage.local.set({ [STORAGE_KEY]: next });
}

export async function loadState(): Promise<void> {
    const result = await extensionApi.storage.local.get([
        STORAGE_KEY,
        LEGACY_STORAGE_KEY,
    ]);

    const stored = parseMode(result[STORAGE_KEY]);
    if (stored) {
        mode = stored;
        return;
    }

    mode = result[LEGACY_STORAGE_KEY] === true ? 'crop' : 'off';
    await extensionApi.storage.local.set({ [STORAGE_KEY]: mode });
    await extensionApi.storage.local.remove(LEGACY_STORAGE_KEY);
}

export function cycleMode(): void {
    setMode(nextMode(mode));
}

export function onStorageChange(
    cb: () => void,
): void {
    extensionApi.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }
        const change = changes[STORAGE_KEY];
        if (change) {
            const next = parseMode(change.newValue) ?? 'off';
            if (mode === next) {
                return;
            }
            mode = next;
            cb();
        }
    });
}
