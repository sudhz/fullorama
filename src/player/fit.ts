/**
 * Fit — applies the active mode to #movie_player.
 * Crop zooms the video uniformly to fill; stretch scales each axis to fill.
 * The actual transforms are defined in content.css.
 */

import { CropMode } from '../storage/mode';

const CROP_CLASS = 'flrm-crop-on';
const STRETCH_CLASS = 'flrm-stretch-on';
const SCALE_VAR = '--flrm-scale';
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

export function applyFit(player: HTMLElement | null, mode: CropMode): void {
    if (!player) {
        return;
    }

    if (mode === 'off') {
        removeClass(player, CROP_CLASS);
        removeClass(player, STRETCH_CLASS);
        removeVar(player, SCALE_VAR);
        removeVar(player, SCALE_X_VAR);
        removeVar(player, SCALE_Y_VAR);
        return;
    }

    const aspects = readAspects(player);
    if (!aspects) {
        return;
    }

    if (mode === 'stretch') {
        removeClass(player, CROP_CLASS);
        removeVar(player, SCALE_VAR);

        const wider = aspects.player >= aspects.video;
        const scaleX = wider ? aspects.player / aspects.video : 1;
        const scaleY = wider ? 1 : aspects.video / aspects.player;

        setVar(player, SCALE_X_VAR, String(round(scaleX)));
        setVar(player, SCALE_Y_VAR, String(round(scaleY)));
        if (!player.classList.contains(STRETCH_CLASS)) {
            player.classList.add(STRETCH_CLASS);
        }
        return;
    }

    removeClass(player, STRETCH_CLASS);
    removeVar(player, SCALE_X_VAR);
    removeVar(player, SCALE_Y_VAR);

    const scale = Math.max(
        aspects.player / aspects.video,
        aspects.video / aspects.player,
    );

    setVar(player, SCALE_VAR, String(round(scale)));
    if (!player.classList.contains(CROP_CLASS)) {
        player.classList.add(CROP_CLASS);
    }
}
