/**
 * Fullorama for YouTube™
 *
 * Adds a button to the YouTube player that turns the selected fill mode on or
 * off. The toolbar popup chooses crop (uniform zoom that trims edges) or
 * stretch (scales one axis and distorts). The mode and on/off state persist in
 * chrome.storage.local across videos, refreshes, and navigation.
 */

import { loadState, onStorageChange } from './storage/state';
import { updateButton } from './player/button';
import { applyFill } from './player/fill';
import { getPlayer } from './player/dom';
import {
    applyFillAndSync,
    applyFillNow,
    onVideoMetadata,
    resetObserver,
    retryBurst,
} from './sync/sync';

async function init(): Promise<void> {
    await loadState();

    // Sync from other tabs
    onStorageChange(() => {
        updateButton();
        applyFill(getPlayer());
    });

    // Apply the selected mode immediately on resize and fullscreen
    window.addEventListener('resize', applyFillNow, { passive: true });
    document.addEventListener('fullscreenchange', applyFillAndSync);
    document.addEventListener('yt-navigate-finish', retryBurst);
    document.addEventListener('yt-navigate-start', resetObserver);
    document.addEventListener('loadedmetadata', onVideoMetadata, true);

    retryBurst();
}

init();