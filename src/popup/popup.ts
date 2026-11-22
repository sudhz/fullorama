/**
 * Popup entrypoint — selects the fill mode and turns it on.
 */

import { canSendFeedbackMetadata, extensionApi } from '../platform/extension-api';
import { getMode, isEnabled, loadState, MODE_NAMES, selectMode, statusText, toggleEnabled } from '../storage/state';
import { buildFeedbackUrl, FEEDBACK_URL } from '../feedback';

declare const TARGET_BROWSER: 'chrome' | 'firefox';

const feedbackSource = TARGET_BROWSER === 'firefox'
    ? 'firefox-popup'
    : 'chrome-popup';

const status = document.querySelector<HTMLButtonElement>('#status');
const statusLabel = document.getElementById('status-text');

function render(): void {
    const mode = getMode();

    if (status && statusLabel) {
        statusLabel.textContent = statusText();
        status.setAttribute('aria-label', MODE_NAMES[mode]);
        status.setAttribute('aria-checked', String(isEnabled()));
        status.disabled = false;
    }

    for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="mode"]')) {
        radio.checked = radio.value === mode;
    }
}

function onStatusClick(): void {
    toggleEnabled();
    render();
}

function onModeClick(event: Event): void {
    const mode = (event.currentTarget as HTMLInputElement).value;
    if (mode === 'crop' || mode === 'stretch') {
        selectMode(mode);
        render();
    }
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

    for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="mode"]')) {
        radio.addEventListener('click', onModeClick);
    }
    status?.addEventListener('click', onStatusClick);

    try {
        await loadState();
        render();
    } catch {
        if (statusLabel) {
            statusLabel.textContent = 'Status unavailable';
        }
    }
}

void init();
