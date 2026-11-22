import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { addTooltip } from '../src/player/tooltip';

beforeAll(() => GlobalRegistrator.register());
afterAll(() => GlobalRegistrator.unregister());

let button: HTMLButtonElement;
let youtubeTooltip: HTMLElement;
let label: string;

beforeEach(() => {
    document.body.innerHTML = `
        <div id="movie_player">
            <div class="ytp-tooltip ytp-bottom" style="display: none" aria-hidden="true"><span class="ytp-tooltip-text">Settings</span></div>
            <div class="ytp-right-controls"><button id="settings"></button><button id="ours"></button></div>
        </div>`;
    button = document.querySelector<HTMLButtonElement>('#ours')!;
    youtubeTooltip = document.querySelector<HTMLElement>('.ytp-tooltip')!;
    label = 'Fullorama: Crop is on';
    addTooltip(document.querySelector<HTMLElement>('#movie_player')!, button, () => label);
});

function ourTooltipText(): string | null {
    const tooltip = document.querySelector<HTMLElement>('.flrm-tooltip')!;
    return tooltip.getAttribute('aria-hidden') !== 'true' ? tooltip.textContent : null;
}

function showYouTubeTooltip(): void {
    youtubeTooltip.style.display = '';
    youtubeTooltip.removeAttribute('aria-hidden');
}

describe('addTooltip', () => {
    it('shows on hover or keyboard focus and hides when it leaves', () => {
        button.dispatchEvent(new Event('mouseenter'));
        expect(ourTooltipText()).toBe('Fullorama: Crop is on');
        button.dispatchEvent(new Event('mouseleave'));
        expect(ourTooltipText()).toBeNull();

        button.dispatchEvent(new Event('focus'));
        expect(ourTooltipText()).toBe('Fullorama: Crop is on');
        button.dispatchEvent(new Event('blur'));
        expect(ourTooltipText()).toBeNull();
    });

    it('updates its text in place on click and hides on Escape', () => {
        button.dispatchEvent(new Event('mouseenter'));
        label = 'Fullorama: Crop is off';
        button.dispatchEvent(new Event('click'));
        expect(ourTooltipText()).toBe('Fullorama: Crop is off');

        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(ourTooltipText()).toBeNull();
    });

    it('stays hidden while a YouTube tooltip is showing', () => {
        showYouTubeTooltip();
        button.dispatchEvent(new Event('mouseenter'));
        expect(ourTooltipText()).toBeNull();
    });

    it('stays when YouTube then shows a button tooltip, since the first one shown stays', async () => {
        button.dispatchEvent(new Event('focus'));
        showYouTubeTooltip();
        await Promise.resolve(); // let the MutationObserver callback run
        expect(ourTooltipText()).toBe('Fullorama: Crop is on');
    });

    it('gives way to the seek preview', async () => {
        button.dispatchEvent(new Event('focus'));
        youtubeTooltip.classList.add('ytp-preview');
        showYouTubeTooltip();
        await Promise.resolve();
        expect(ourTooltipText()).toBeNull();
    });

    it('hides when YouTube autohides the player controls', async () => {
        button.dispatchEvent(new Event('mouseenter'));
        document.querySelector('#movie_player')!.classList.add('ytp-autohide');
        await Promise.resolve();
        expect(ourTooltipText()).toBeNull();
    });
});
