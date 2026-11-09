import { describe, expect, it } from 'bun:test';
import { applyFit } from '../src/player/fit';

function createPlayer(
    playerWidth = 2560,
    playerHeight = 1080,
    videoWidth = 1920,
    videoHeight = 1080,
) {
    const classes = new Set<string>();
    const styles = new Map<string, string>();
    const video = { videoWidth, videoHeight };

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
        getBoundingClientRect: () => ({ width: playerWidth, height: playerHeight }),
    };

    return {
        player: player as unknown as HTMLElement,
        classes,
        styles,
    };
}

describe('applyFit', () => {
    it('clears crop and stretch state when off', () => {
        const { player, classes, styles } = createPlayer();
        classes.add('flrm-crop-on');
        classes.add('flrm-stretch-on');
        styles.set('--flrm-scale', '1.5');
        styles.set('--flrm-scale-x', '1.5');
        styles.set('--flrm-scale-y', '1.5');

        applyFit(player, 'off');

        expect(classes.has('flrm-crop-on')).toBe(false);
        expect(classes.has('flrm-stretch-on')).toBe(false);
        expect(styles.has('--flrm-scale')).toBe(false);
        expect(styles.has('--flrm-scale-x')).toBe(false);
        expect(styles.has('--flrm-scale-y')).toBe(false);
    });

    it('applies a uniform scale in crop mode', () => {
        const { player, classes, styles } = createPlayer();

        applyFit(player, 'crop');

        expect(classes.has('flrm-crop-on')).toBe(true);
        expect(classes.has('flrm-stretch-on')).toBe(false);
        expect(styles.get('--flrm-scale')).toBe('1.3333');
        expect(styles.has('--flrm-scale-x')).toBe(false);
        expect(styles.has('--flrm-scale-y')).toBe(false);
    });

    it('stretches horizontally for a wide player', () => {
        const { player, classes, styles } = createPlayer();
        classes.add('flrm-crop-on');
        styles.set('--flrm-scale', '1.5');

        applyFit(player, 'stretch');

        expect(classes.has('flrm-stretch-on')).toBe(true);
        expect(classes.has('flrm-crop-on')).toBe(false);
        expect(styles.has('--flrm-scale')).toBe(false);
        expect(styles.get('--flrm-scale-x')).toBe('1.3333');
        expect(styles.get('--flrm-scale-y')).toBe('1');
    });

    it('stretches vertically when the video is wider than the player', () => {
        const { player, classes, styles } = createPlayer(1440, 1080, 1920, 1080);

        applyFit(player, 'stretch');

        expect(classes.has('flrm-stretch-on')).toBe(true);
        expect(styles.get('--flrm-scale-x')).toBe('1');
        expect(styles.get('--flrm-scale-y')).toBe('1.3333');
    });

    it('drops stretch state when returning to crop', () => {
        const { player, classes, styles } = createPlayer();
        classes.add('flrm-stretch-on');
        styles.set('--flrm-scale-x', '1.5');
        styles.set('--flrm-scale-y', '1');

        applyFit(player, 'crop');

        expect(classes.has('flrm-crop-on')).toBe(true);
        expect(classes.has('flrm-stretch-on')).toBe(false);
        expect(styles.get('--flrm-scale')).toBe('1.3333');
        expect(styles.has('--flrm-scale-x')).toBe(false);
        expect(styles.has('--flrm-scale-y')).toBe(false);
    });
});
