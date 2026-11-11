/**
 * Fill — applies the selected fill mode to #movie_player when enabled.
 * Crop zooms the video uniformly to fill; stretch scales each axis to fill.
 * The actual transform is defined in content.css.
 */

import { getMode, isEnabled } from '../storage/state';

const PLAYER_CLASS = 'flrm-fill-on';
const SCALE_X_VAR = '--flrm-scale-x';
const SCALE_Y_VAR = '--flrm-scale-y';

type Aspects = {
    video: number;
    player: number;
};

function readAspects(player: HTMLElement): Aspects | null {
    const video = player.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (!video) {
        return null;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
        return null;
    }

    const rect = player.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return null;
    }

    return {
        video: vw / vh,
        player: rect.width / rect.height,
    };
}

function removeClass(player: HTMLElement, name: string): void {
    if (player.classList.contains(name)) {
        player.classList.remove(name);
    }
}

function removeVar(player: HTMLElement, name: string): void {
    if (player.style.getPropertyValue(name)) {
        player.style.removeProperty(name);
    }
}

function setVar(player: HTMLElement, name: string, value: string): void {
    if (player.style.getPropertyValue(name) !== value) {
        player.style.setProperty(name, value);
    }
}

function round(value: number): number {
    return Math.round(value * 10000) / 10000;
}

export function applyFill(player: HTMLElement | null): void {
    if (!player) {
        return;
    }

    if (!isEnabled()) {
        removeClass(player, PLAYER_CLASS);
        removeVar(player, SCALE_X_VAR);
        removeVar(player, SCALE_Y_VAR);
        return;
    }

    const aspects = readAspects(player);
    if (!aspects) {
        // The size is not known yet. Clear any previous fill so a mode change
        // cannot leave stale geometry on the player.
        removeClass(player, PLAYER_CLASS);
        removeVar(player, SCALE_X_VAR);
        removeVar(player, SCALE_Y_VAR);
        return;
    }

    let scaleX: number;
    let scaleY: number;

    if (getMode() === 'stretch') {
        const wider = aspects.player >= aspects.video;
        scaleX = wider ? aspects.player / aspects.video : 1;
        scaleY = wider ? 1 : aspects.video / aspects.player;
    } else {
        const scale = Math.max(
            aspects.player / aspects.video,
            aspects.video / aspects.player,
        );
        scaleX = scale;
        scaleY = scale;
    }

    setVar(player, SCALE_X_VAR, String(round(scaleX)));
    setVar(player, SCALE_Y_VAR, String(round(scaleY)));
    if (!player.classList.contains(PLAYER_CLASS)) {
        player.classList.add(PLAYER_CLASS);
    }
}
