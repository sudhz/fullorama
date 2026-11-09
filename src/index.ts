/**
 * Fullorama for YouTube™
 *
 * Adds a button to the YouTube player that turns the selected fill mode on or
 * off. The toolbar popup chooses crop (uniform zoom that trims edges) or
 * stretch (scales one axis and distorts). The mode and on/off state persist in
 * chrome.storage.local across videos, refreshes, and navigation.
 */

import { getMode, isEnabled, loadState, onStorageChange } from './storage/state';
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
        applyFit(getPlayer(), isEnabled(), getMode());
    });

    // Apply the selected mode immediately on resize and fullscreen
    window.addEventListener('resize', applyFitNow, { passive: true });
    document.addEventListener('fullscreenchange', applyFitAndSync);
    document.addEventListener('yt-navigate-finish', retryBurst);
    document.addEventListener('yt-navigate-start', resetObserver);
    document.addEventListener('loadedmetadata', onVideoMetadata, true);

    retryBurst();
}

init();