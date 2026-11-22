import { beforeEach, describe, expect, it } from 'bun:test';
import { resetStore } from './helpers/storage';
import * as state from '../src/storage/state';
import { applyFill } from '../src/player/fill';

beforeEach(async () => {
    resetStore();
    await state.loadState();
});

/** Fake #movie_player with a 16:9 video. */
function createPlayer(width: number, height: number) {
    const classes = new Set<string>();
    const styles = new Map<string, string>();
    const size = { width, height };

    const element = {
        classList: {
            toggle: (name: string, force: boolean) => (force ? classes.add(name) : classes.delete(name)),
        },
        style: {
            getPropertyValue: (name: string) => styles.get(name) ?? '',
            setProperty: (name: string, value: string) => styles.set(name, value),
            removeProperty: (name: string) => styles.delete(name),
        },
        querySelector: () => ({ videoWidth: 1920, videoHeight: 1080 }),
        getBoundingClientRect: () => size,
    };

    return {
        element: element as unknown as HTMLElement,
        resize: (w: number, h: number) => Object.assign(size, { width: w, height: h }),
        isFilled: () => classes.has('flrm-fill-on'),
        scale: () => [styles.get('--flrm-scale-x'), styles.get('--flrm-scale-y')],
    };
}

describe('applyFill', () => {
    it('crops by scaling both axes evenly', () => {
        state.selectMode('crop');
        const player = createPlayer(2560, 1080);
        applyFill(player.element);
        expect(player.isFilled()).toBe(true);
        expect(player.scale()).toEqual(['1.3333', '1.3333']);
    });

    it('stretches the width when the player is wider than the video', () => {
        state.selectMode('stretch');
        const player = createPlayer(2560, 1080);
        applyFill(player.element);
        expect(player.scale()).toEqual(['1.3333', '1']);
    });

    it('stretches the height when the video is wider than the player', () => {
        state.selectMode('stretch');
        const player = createPlayer(1440, 1080);
        applyFill(player.element);
        expect(player.scale()).toEqual(['1', '1.3333']);
    });

    it('restores the video when turned off', () => {
        state.selectMode('stretch');
        const player = createPlayer(2560, 1080);
        applyFill(player.element);
        state.toggleEnabled();
        applyFill(player.element);
        expect(player.isFilled()).toBe(false);
        expect(player.scale()).toEqual([undefined, undefined]);
    });

    it('clears the previous mode while the player size is unknown', () => {
        state.selectMode('crop');
        const player = createPlayer(2560, 1080);
        applyFill(player.element);
        player.resize(0, 0);
        state.selectMode('stretch');
        applyFill(player.element);
        expect(player.isFilled()).toBe(false);
        expect(player.scale()).toEqual([undefined, undefined]);
    });
});
