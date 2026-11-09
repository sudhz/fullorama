/**
 * Button — injects and manages the mode button in YouTube's player.
 */

import { getMode, isEnabled, toggleEnabled } from '../storage/state';
import { applyFit } from './fit';
import { getPlayer } from './dom';

const BUTTON_ATTR = 'data-flrm-btn';
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgElement<T extends SVGElement>(
    tagName: string,
    attributes: Record<string, string>,
): T {
    const element = document.createElementNS(SVG_NS, tagName) as T;
    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }
    return element;
}

function createIcon(): SVGSVGElement {
    const svg = svgElement<SVGSVGElement>('svg', {
        viewBox: '0 0 36 36',
        width: '24',
        height: '24',
        'aria-hidden': 'true',
        focusable: 'false',
    });

    const group = svgElement<SVGGElement>('g', {
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    });

    for (const d of [
        'M8 13V8h5',
        'M23 8h5v5',
        'M28 23v5h-5',
        'M13 28H8v-5',
    ]) {
        group.append(svgElement<SVGPathElement>('path', { d }));
    }

    svg.append(
        group,
        svgElement<SVGRectElement>('rect', {
            class: 'flrm-crop',
            x: '13',
            y: '13',
            width: '10',
            height: '10',
            rx: '1',
            fill: 'currentColor',
            stroke: 'none',
        }),
        svgElement<SVGRectElement>('rect', {
            class: 'flrm-stretch',
            x: '10',
            y: '15',
            width: '16',
            height: '6',
            rx: '1',
            fill: 'currentColor',
            stroke: 'none',
        }),
    );

    return svg;
}

function syncButtonState(button: HTMLElement): void {
    const mode = getMode();
    const enabled = isEnabled();
    const label = `Fullorama: ${mode} ${enabled ? 'on' : 'off'}`;
    const pressed = String(enabled);

    if (button.dataset.flrmMode !== mode) {
        button.dataset.flrmMode = mode;
    }
    if (button.title !== label) {
        button.title = label;
    }
    if (button.getAttribute('aria-label') !== label) {
        button.setAttribute('aria-label', label);
    }
    if (button.getAttribute('aria-pressed') !== pressed) {
        button.setAttribute('aria-pressed', pressed);
    }
}

function onButtonClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    toggleEnabled();
    updateButton();
    applyFit(getPlayer(), isEnabled(), getMode());
}

export function injectButton(
    player: HTMLElement,
    controls: HTMLElement,
): void {
    if (player.querySelector('[' + BUTTON_ATTR + ']')) {
        return;
    }

    const button = document.createElement('button');
    button.setAttribute(BUTTON_ATTR, '');
    button.className = 'ytp-button flrm-btn';
    button.append(createIcon());
    button.addEventListener('click', onButtonClick);
    syncButtonState(button);

    controls.insertBefore(
        button,
        controls.children.item(controls.children.length - 2),
    );
}

export function updateButton(): void {
    const btn = document.querySelector<HTMLElement>(
        '#movie_player [' + BUTTON_ATTR + ']',
    );
    if (btn) {
        syncButtonState(btn);
    }
}
