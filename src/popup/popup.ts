/**
 * Popup entrypoint — read-only mode status display.
 *
 * Reads `cropMode` from storage.local once when opened and reflects it.
 * It never writes state: the only way to change the mode is the YouTube
 * player button. The popup closes when focus returns to YouTube, so a live
 * storage listener provides no practical benefit.
 */

import { canSendFeedbackMetadata, extensionApi } from '../platform/extension-api';
import { STORAGE_KEY } from '../storage/state';
import { CropMode, parseMode } from '../storage/mode';
import { buildFeedbackUrl, FEEDBACK_URL } from '../feedback';

declare const TARGET_BROWSER: 'chrome' | 'firefox';

const feedbackSource = TARGET_BROWSER === 'firefox'
    ? 'firefox-popup'
    : 'chrome-popup';

const STATUS: Record<CropMode, { text: string; stateClass: string }> = {
    off: { text: 'Off', stateClass: 'is-off' },
    crop: { text: 'Crop is on', stateClass: 'is-on' },
    stretch: { text: 'Stretch is on', stateClass: 'is-on' },
};

function setStatus(text: string, stateClass: string): void {
    const status = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    if (!status || !statusText) {
        return;
    }
    statusText.textContent = text;
    status.classList.remove('is-on', 'is-off', 'is-unavailable');
    status.classList.add(stateClass);
}

async function init(): Promise<void> {
    const version = extensionApi.runtime.getManifest().version;

    const versionEl = document.getElementById('version');
    if (versionEl) {
        versionEl.textContent = version;
    }

    const feedback = document.querySelector<HTMLAnchorElement>('#feedback');
    if (feedback) {
        feedback.href = await canSendFeedbackMetadata()
            ? buildFeedbackUrl(feedbackSource, version)
            : FEEDBACK_URL;
    }

    try {
        const result = await extensionApi.storage.local.get(STORAGE_KEY);
        const mode = parseMode(result[STORAGE_KEY]) ?? 'off';
        const status = STATUS[mode];
        setStatus(status.text, status.stateClass);
    } catch {
        setStatus('Status unavailable', 'is-unavailable');
    }
}

void init();
