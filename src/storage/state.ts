/**
 * State — fill mode and on/off persisted in extension storage.
 */

import { extensionApi } from '../platform/extension-api';
import { FillMode, parseFillMode, parseLegacyMode } from './mode';

const ENABLED_KEY = 'fillEnabled';
const MODE_KEY = 'fillMode';
const LEGACY_CROP_MODE_KEY = 'cropMode';
const LEGACY_CROP_ENABLED_KEY = 'cropEnabled';

let enabled = false;
let mode: FillMode = 'crop';

export function isEnabled(): boolean {
    return enabled;
}

export function getMode(): FillMode {
    return mode;
}

function save(): void {
    extensionApi.storage.local.set({
        [ENABLED_KEY]: enabled,
        [MODE_KEY]: mode,
    });
}

export async function loadState(): Promise<void> {
    const result = await extensionApi.storage.local.get([
        ENABLED_KEY,
        MODE_KEY,
        LEGACY_CROP_MODE_KEY,
        LEGACY_CROP_ENABLED_KEY,
    ]);

    const storedEnabled = result[ENABLED_KEY];
    const storedMode = parseFillMode(result[MODE_KEY]);

    if (typeof storedEnabled === 'boolean' && storedMode) {
        enabled = storedEnabled;
        mode = storedMode;
        return;
    }

    const legacyMode = parseLegacyMode(result[LEGACY_CROP_MODE_KEY]);
    if (legacyMode) {
        enabled = legacyMode !== 'off';
        mode = legacyMode === 'stretch' ? 'stretch' : 'crop';
    } else {
        enabled = result[LEGACY_CROP_ENABLED_KEY] === true;
        mode = 'crop';
    }

    await extensionApi.storage.local.set({
        [ENABLED_KEY]: enabled,
        [MODE_KEY]: mode,
    });
    await extensionApi.storage.local.remove([
        LEGACY_CROP_MODE_KEY,
        LEGACY_CROP_ENABLED_KEY,
    ]);
}

export function selectMode(next: FillMode): void {
    mode = next;
    enabled = true;
    save();
}

export function toggleEnabled(): void {
    enabled = !enabled;
    save();
}

export function onStorageChange(
    cb: () => void,
): void {
    extensionApi.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }

        let changed = false;

        const enabledChange = changes[ENABLED_KEY];
        if (enabledChange) {
            const next = enabledChange.newValue === true;
            if (next !== enabled) {
                enabled = next;
                changed = true;
            }
        }

        const modeChange = changes[MODE_KEY];
        if (modeChange) {
            const next = parseFillMode(modeChange.newValue);
            if (next && next !== mode) {
                mode = next;
                changed = true;
            }
        }

        if (changed) {
            cb();
        }
    });
}
