import { beforeEach, describe, expect, it } from 'bun:test';
import { resetStore, store } from './helpers/storage';
import * as state from '../src/storage/state';

beforeEach(resetStore);

describe('loadState', () => {
    it('reads the saved mode and on/off state', async () => {
        store.fillMode = 'stretch';
        store.fillEnabled = false;
        await state.loadState();
        expect(state.getMode()).toBe('stretch');
        expect(state.isEnabled()).toBe(false);
    });

    it('starts a fresh install off, with crop selected', async () => {
        await state.loadState();
        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(false);
    });

    it('falls back to crop when the saved mode is unknown', async () => {
        store.fillMode = 'zoom';
        store.fillEnabled = true;
        await state.loadState();
        expect(state.getMode()).toBe('crop');
        expect(state.isEnabled()).toBe(true);
    });

    // Temporary: delete with the `cropEnabled` migration after 1.3.0.
    it('moves the pre-1.3.0 cropEnabled key to fillEnabled', async () => {
        store.cropEnabled = true;
        await state.loadState();
        expect(state.isEnabled()).toBe(true);
        expect(store.fillEnabled).toBe(true);
        expect('cropEnabled' in store).toBe(false);
    });
});

describe('selectMode', () => {
    it('saves the mode and turns fill on', async () => {
        await state.loadState();
        state.selectMode('stretch');
        expect(store.fillMode).toBe('stretch');
        expect(store.fillEnabled).toBe(true);
    });
});
