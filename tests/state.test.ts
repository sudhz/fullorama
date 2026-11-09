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
    it('migrates legacy enabled to crop and removes the old key', async () => {
        store.cropEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(store.cropMode).toBe('crop');
        expect('cropEnabled' in store).toBe(false);
        expect(removed).toContainEqual(['cropEnabled']);
    });

    it('migrates a legacy disabled value to off', async () => {
        store.cropEnabled = false;

        await state.loadState();

        expect(state.getMode()).toBe('off');
        expect(store.cropMode).toBe('off');
        expect('cropEnabled' in store).toBe(false);
    });

    it('starts a fresh install at off', async () => {
        await state.loadState();

        expect(state.getMode()).toBe('off');
        expect(store.cropMode).toBe('off');
    });

    it('keeps an existing mode', async () => {
        store.cropMode = 'stretch';

        await state.loadState();

        expect(state.getMode()).toBe('stretch');
        expect(store.cropMode).toBe('stretch');
        expect(removed).toEqual([]);
    });

    it('falls back to migration when the stored mode is invalid', async () => {
        store.cropMode = 'zoom';
        store.cropEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(store.cropMode).toBe('crop');
    });
});

describe('cycleMode', () => {
    it('advances through off, crop, stretch and back', async () => {
        await state.loadState();

        state.cycleMode();
        expect(state.getMode()).toBe('crop');
        expect(store.cropMode).toBe('crop');

        state.cycleMode();
        expect(state.getMode()).toBe('stretch');
        expect(store.cropMode).toBe('stretch');

        state.cycleMode();
        expect(state.getMode()).toBe('off');
        expect(store.cropMode).toBe('off');
    });
});
