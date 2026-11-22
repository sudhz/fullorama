/**
 * State — fill mode and on/off persisted in extension storage.
 */

import { extensionApi } from '../platform/extension-api';

export type FillMode = 'crop' | 'stretch';

export const MODE_NAMES: Record<FillMode, string> = {
    crop: 'Crop',
    stretch: 'Stretch',
};

export function statusText(): string {
    return `${MODE_NAMES[mode]} is ${enabled ? 'on' : 'off'}`;
}

const ENABLED_KEY = 'fillEnabled';
const MODE_KEY = 'fillMode';
const LEGACY_ENABLED_KEY = 'cropEnabled';

let enabled = false;
let mode: FillMode = 'crop';

export function isEnabled(): boolean {
    return enabled;
}

export function getMode(): FillMode {
    return mode;
}

function parseMode(value: unknown): FillMode | null {
    return value === 'crop' || value === 'stretch' ? value : null;
}

export async function loadState(): Promise<void> {
    const result = await extensionApi.storage.local.get([ENABLED_KEY, MODE_KEY, LEGACY_ENABLED_KEY]);
    enabled = result[ENABLED_KEY] === true;
    mode = parseMode(result[MODE_KEY]) ?? 'crop';

    // Temporary: moves the pre-1.3.0 `cropEnabled` key. Remove in the release after 1.3.0.
    if (LEGACY_ENABLED_KEY in result) {
        if (!(ENABLED_KEY in result)) {
            enabled = result[LEGACY_ENABLED_KEY] === true;
            await extensionApi.storage.local.set({ [ENABLED_KEY]: enabled });
        }
        await extensionApi.storage.local.remove(LEGACY_ENABLED_KEY);
    }
}

function saveState(): void {
    extensionApi.storage.local.set({ [ENABLED_KEY]: enabled, [MODE_KEY]: mode });
}

export function selectMode(next: FillMode): void {
    mode = next;
    enabled = true;
    saveState();
}

export function toggleEnabled(): void {
    enabled = !enabled;
    saveState();
}

export function onStorageChange(
    cb: () => void,
): void {
    extensionApi.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }
        const enabledChange = changes[ENABLED_KEY];
        const nextEnabled = enabledChange ? enabledChange.newValue === true : enabled;
        const nextMode = parseMode(changes[MODE_KEY]?.newValue) ?? mode;
        if (nextEnabled === enabled && nextMode === mode) {
            return;
        }
        enabled = nextEnabled;
        mode = nextMode;
        cb();
    });
}
