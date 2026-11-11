/**
 * Popup entrypoint — selects the fill mode and turns it on.
 */

import { canSendFeedbackMetadata, extensionApi } from '../platform/extension-api';
import { FillMode, getMode, isEnabled, loadState, selectMode } from '../storage/state';
import { buildFeedbackUrl, FEEDBACK_URL } from '../feedback';

declare const TARGET_BROWSER: 'chrome' | 'firefox';

const feedbackSource = TARGET_BROWSER === 'firefox'
    ? 'firefox-popup'
    : 'chrome-popup';

const LABELS: Record<FillMode, string> = {
    crop: 'Crop',
    stretch: 'Stretch',
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

function render(): void {
    const mode = getMode();
    const enabled = isEnabled();

    setStatus(
        `${LABELS[mode]} is ${enabled ? 'on' : 'off'}`,
        enabled ? 'is-on' : 'is-off',
    );

    for (const card of document.querySelectorAll<HTMLButtonElement>('.option')) {
        const selected = card.dataset.mode === mode;
        card.classList.toggle('is-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
    }
}

function onModeClick(event: Event): void {
    const mode = (event.currentTarget as HTMLElement).dataset.mode;
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

    for (const card of document.querySelectorAll<HTMLButtonElement>('.option')) {
        card.addEventListener('click', onModeClick);
    }

    try {
        await loadState();
        render();
    } catch {
        setStatus('Status unavailable', 'is-unavailable');
    }
}

void init();
