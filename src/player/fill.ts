/**
 * Fill — applies the selected mode by adding a class + scale variables to #movie_player.
 * The actual transform is defined in content.css.
 */

import { FillMode, getMode, isEnabled } from '../storage/state';

const FILL_CLASS = 'flrm-fill-on';
const SCALE_X_VAR = '--flrm-scale-x';
const SCALE_Y_VAR = '--flrm-scale-y';

export function applyFill(player: HTMLElement | null): void {
    if (!player) {
        return;
    }

    // Also clear while the video size is unknown, or the previous mode stays applied
    const ratio = isEnabled() ? playerToVideoRatio(player) : null;
    if (!ratio) {
        player.classList.toggle(FILL_CLASS, false);
        setVar(player, SCALE_X_VAR, '');
        setVar(player, SCALE_Y_VAR, '');
        return;
    }

    const [scaleX, scaleY] = fillScale(getMode(), ratio);
    setVar(player, SCALE_X_VAR, toCssNumber(scaleX));
    setVar(player, SCALE_Y_VAR, toCssNumber(scaleY));
    player.classList.toggle(FILL_CLASS, true);
}

function playerToVideoRatio(player: HTMLElement): number | null {
    const video = player.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (!video?.videoWidth || !video.videoHeight) {
        return null;
    }

    const rect = player.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return null;
    }

    return (rect.width / rect.height) / (video.videoWidth / video.videoHeight);
}

function fillScale(mode: FillMode, ratio: number): [number, number] {
    if (mode === 'crop') {
        const scale = Math.max(ratio, 1 / ratio);
        return [scale, scale];
    }
    return ratio >= 1 ? [ratio, 1] : [1, 1 / ratio];
}

function setVar(player: HTMLElement, name: string, value: string): void {
    if (player.style.getPropertyValue(name) === value) {
        return;
    }
    if (value) {
        player.style.setProperty(name, value);
    } else {
        player.style.removeProperty(name);
    }
}

// Round so small resizes don't rewrite the style
function toCssNumber(value: number): string {
    return String(Math.round(value * 10000) / 10000);
}
