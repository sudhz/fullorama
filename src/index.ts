/**
 * Fullorama for YouTube™
 *
 * Adds a mode button to the YouTube player that cycles through off, crop,
 * and stretch. Crop zooms the video to fill the player; stretch scales it
 * to fill. The mode persists in chrome.storage.local across videos,
 * refreshes, and navigation.
 */

import { getMode, loadState, onStorageChange } from './storage/state';
import { updateButton } from './player/button';
import { applyFit } from './player/fit';
import { getPlayer } from './player/dom';
import {
    applyFitAndSync,
    applyFitNow,
    onVideoMetadata,
    resetObserver,
    retryBurst,
} from './sync/sync';

async function init(): Promise<void> {
    await loadState();

    // Sync from other tabs
    onStorageChange(() => {
        updateButton();
        applyFit(getPlayer(), getMode());
    });

    // Apply crop immediately on resize and fullscreen
    window.addEventListener('resize', applyFitNow, { passive: true });
    document.addEventListener('fullscreenchange', applyFitAndSync);
    document.addEventListener('yt-navigate-finish', retryBurst);
    document.addEventListener('yt-navigate-start', resetObserver);
    document.addEventListener('loadedmetadata', onVideoMetadata, true);

    retryBurst();
}

init();