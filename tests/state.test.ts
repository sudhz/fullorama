import { beforeEach, describe, expect, it } from 'bun:test';

type Store = Record<string, unknown>;

let store: Store = {};
let removed: string[][] = [];

(globalThis as { chrome?: unknown }).chrome = {
    storage: {
        local: {
            get: async (keys: string | string[]) => {
                const list = Array.isArray(keys) ? keys : [keys];
                return Object.fromEntries(
                    list.filter((key) => key in store).map((key) => [key, store[key]]),
                );
            },
            set: async (values: Store) => {
                Object.assign(store, values);
            },
            remove: async (keys: string | string[]) => {
                const list = Array.isArray(keys) ? keys : [keys];
                removed.push(list);
                for (const key of list) {
                    delete store[key];
                }
            },
        },
        onChanged: {
            addListener: () => {},
        },
    },
};

beforeEach(() => {
    store = {};
    removed = [];
});

const state = await import('../src/storage/state');

describe('loadState', () => {
    it('keeps existing fill keys', async () => {
        store.fillEnabled = false;
        store.fillMode = 'stretch';

        await state.loadState();

        expect(state.getMode()).toBe('stretch');
        expect(state.isEnabled()).toBe(false);
        expect(store.fillEnabled).toBe(false);
        expect(store.fillMode).toBe('stretch');
        expect(removed).toEqual([]);
    });

    it('migrates the legacy tri-state crop', async () => {
        store.cropMode = 'crop';

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('crop');
        expect(store.fillEnabled).toBe(true);
        expect('cropMode' in store).toBe(false);
    });

    it('migrates the legacy tri-state stretch', async () => {
        store.cropMode = 'stretch';

        await state.loadState();

        expect(state.getMode()).toBe('stretch');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('stretch');
        expect(store.fillEnabled).toBe(true);
        expect('cropMode' in store).toBe(false);
    });

    it('migrates the legacy tri-state off to a disabled crop', async () => {
        store.cropMode = 'off';

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(false);
        expect(store.fillMode).toBe('crop');
        expect(store.fillEnabled).toBe(false);
    });

    it('migrates the legacy boolean on to crop on', async () => {
        store.cropEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('crop');
        expect(store.fillEnabled).toBe(true);
        expect('cropEnabled' in store).toBe(false);
    });

    it('migrates the legacy boolean off to a disabled crop', async () => {
        store.cropEnabled = false;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(false);
        expect(store.fillMode).toBe('crop');
        expect(store.fillEnabled).toBe(false);
        expect('cropEnabled' in store).toBe(false);
    });

    it('starts a fresh install with crop off', async () => {
        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(false);
        expect(store.fillMode).toBe('crop');
        expect(store.fillEnabled).toBe(false);
    });

    it('falls back through legacy values when the new mode is invalid', async () => {
        store.fillMode = 'zoom';
        store.fillEnabled = true;
        store.cropEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('crop');
        expect('cropEnabled' in store).toBe(false);
    });
});

describe('selectMode', () => {
    it('selects a mode and turns fill on', async () => {
        await state.loadState();

        state.selectMode('stretch');

        expect(state.getMode()).toBe('stretch');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('stretch');
        expect(store.fillEnabled).toBe(true);
    });

    it('keeps fill on when re-selecting the active mode', async () => {
        store.fillEnabled = true;
        store.fillMode = 'crop';
        await state.loadState();

        state.selectMode('crop');

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
    });
});

describe('toggleEnabled', () => {
    it('flips only the enabled flag', async () => {
        store.fillEnabled = false;
        store.fillMode = 'stretch';
        await state.loadState();

        state.toggleEnabled();

        expect(state.isEnabled()).toBe(true);
        expect(state.getMode()).toBe('stretch');
        expect(store.fillEnabled).toBe(true);
        expect(store.fillMode).toBe('stretch');

        state.toggleEnabled();

        expect(state.isEnabled()).toBe(false);
        expect(store.fillEnabled).toBe(false);
    });
});
