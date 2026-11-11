import { beforeEach, describe, expect, it } from 'bun:test';
import { removed, resetStore, store } from './helpers/storage';

beforeEach(() => {
    resetStore();
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

    // Temporary: delete this test with the `cropEnabled` migration after 1.3.0.
    it('migrates the pre-1.3.0 cropEnabled key', async () => {
        store.cropEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillEnabled).toBe(true);
        expect(store.fillMode).toBe('crop');
        expect('cropEnabled' in store).toBe(false);
    });

    it('starts a fresh install with crop off', async () => {
        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(false);
        expect(store.fillEnabled).toBe(false);
        expect(store.fillMode).toBe('crop');
    });

    it('falls back to crop when the stored mode is invalid', async () => {
        store.fillMode = 'zoom';
        store.fillEnabled = true;

        await state.loadState();

        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
        expect(store.fillMode).toBe('crop');
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
