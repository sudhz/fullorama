import { beforeEach, describe, expect, it } from 'bun:test';
import { resetStore } from './helpers/storage';

const state = await import('../src/storage/state');
const { applyFill } = await import('../src/player/fill');

beforeEach(async () => {
    resetStore();
    await state.loadState();
});

function createPlayer(
    playerWidth = 2560,
    playerHeight = 1080,
    videoWidth = 1920,
    videoHeight = 1080,
) {
    const classes = new Set<string>();
    const styles = new Map<string, string>();
    const video = { videoWidth, videoHeight };
    const size = { width: playerWidth, height: playerHeight };

    const player = {
        classList: {
            add: (name: string) => {
                classes.add(name);
            },
            remove: (...names: string[]) => {
                for (const name of names) {
                    classes.delete(name);
                }
            },
            contains: (name: string) => classes.has(name),
        },
        style: {
            getPropertyValue: (name: string) => styles.get(name) ?? '',
            setProperty: (name: string, value: string) => {
                styles.set(name, value);
            },
            removeProperty: (name: string) => {
                styles.delete(name);
            },
        },
        querySelector: () => video,
        getBoundingClientRect: () => size,
    };

    return {
        player: player as unknown as HTMLElement,
        classes,
        styles,
        setSize: (width: number, height: number) => {
            size.width = width;
            size.height = height;
        },
    };
}

describe('applyFill', () => {
    it('clears fill state when disabled', () => {
        state.selectMode('stretch');
        const { player, classes, styles } = createPlayer();
        classes.add('flrm-fill-on');
        styles.set('--flrm-scale-x', '1.5');
        styles.set('--flrm-scale-y', '1');

        state.toggleEnabled();
        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(false);
        expect(styles.has('--flrm-scale-x')).toBe(false);
        expect(styles.has('--flrm-scale-y')).toBe(false);
    });

    it('applies a uniform scale in crop mode', () => {
        state.selectMode('crop');
        const { player, classes, styles } = createPlayer();

        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(styles.get('--flrm-scale-x')).toBe('1.3333');
        expect(styles.get('--flrm-scale-y')).toBe('1.3333');
    });

    it('stretches horizontally for a wide player', () => {
        state.selectMode('stretch');
        const { player, classes, styles } = createPlayer();

        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(styles.get('--flrm-scale-x')).toBe('1.3333');
        expect(styles.get('--flrm-scale-y')).toBe('1');
    });

    it('stretches vertically when the video is wider than the player', () => {
        state.selectMode('stretch');
        const { player, classes, styles } = createPlayer(1440, 1080, 1920, 1080);

        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(styles.get('--flrm-scale-x')).toBe('1');
        expect(styles.get('--flrm-scale-y')).toBe('1.3333');
    });

    it('uses one player class for both modes', () => {
        state.selectMode('crop');
        const { player, classes } = createPlayer();

        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(classes.has('flrm-crop-on')).toBe(false);
        expect(classes.has('flrm-stretch-on')).toBe(false);

        state.selectMode('stretch');
        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(classes.has('flrm-crop-on')).toBe(false);
        expect(classes.has('flrm-stretch-on')).toBe(false);
    });

    it('clears the previous mode while the player size is unknown', () => {
        state.selectMode('crop');
        const { player, classes, styles, setSize } = createPlayer();
        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(true);
        expect(styles.get('--flrm-scale-x')).toBe('1.3333');

        setSize(0, 0);
        state.selectMode('stretch');
        applyFill(player);

        expect(classes.has('flrm-fill-on')).toBe(false);
        expect(styles.has('--flrm-scale-x')).toBe(false);
        expect(styles.has('--flrm-scale-y')).toBe(false);
    });
});
