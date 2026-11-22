/**
 * Tooltip — YouTube's tooltip for our button, following YouTube's own tooltip rules.
 */

const TOOLTIP_CLASS = 'flrm-tooltip';
const GAP_PX = 22; // measured on YouTube's own tooltips

function element(tag: string, className: string, ...children: (Node | string)[]): HTMLElement {
    const node = document.createElement(tag);
    node.className = className;
    node.append(...children);
    return node;
}

function isShown(tooltip: HTMLElement): boolean {
    return tooltip.style.display !== 'none' && tooltip.getAttribute('aria-hidden') !== 'true';
}

function hide(tooltip: HTMLElement): void {
    tooltip.setAttribute('aria-hidden', 'true');
}

function getTooltip(player: HTMLElement): HTMLElement {
    const existing = player.querySelector<HTMLElement>(`.${TOOLTIP_CLASS}`);
    if (existing) {
        return existing;
    }

    const tooltip = element('div', `ytp-tooltip ytp-bottom ${TOOLTIP_CLASS}`);
    hide(tooltip);
    player.append(tooltip);

    new ResizeObserver(() => hide(tooltip)).observe(player);
    new MutationObserver((records) => {
        const replaced = records.some(({ target }) => target === player
            ? player.classList.contains('ytp-autohide')
            : (target as HTMLElement).classList.contains('ytp-tooltip-progress-bar-style') && isShown(target as HTMLElement));
        if (replaced) {
            hide(tooltip);
        }
    }).observe(player, { attributes: true, attributeFilter: ['class', 'aria-hidden'], subtree: true });

    return tooltip;
}

export function addTooltip(player: HTMLElement, button: HTMLElement, text: () => string): void {
    const tooltip = getTooltip(player);
    hide(tooltip);

    const show = () => {
        const youtubeTooltips = player.querySelectorAll<HTMLElement>(`.ytp-tooltip:not(.${TOOLTIP_CLASS})`);
        if (!isShown(tooltip) && [...youtubeTooltips].some(isShown)) {
            return;
        }

        tooltip.replaceChildren(
            element('div', 'ytp-tooltip-text-wrapper',
                element('div', 'ytp-tooltip-bottom-text',
                    element('span', 'ytp-tooltip-text', text()))),
        );

        // Bottom, not top: YouTube animates `top`, so a resize would slide it
        const playerRect = player.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        tooltip.style.bottom = `${playerRect.bottom - buttonRect.top + GAP_PX}px`;
        tooltip.style.left = `${buttonRect.left - playerRect.left + (buttonRect.width - tooltip.offsetWidth) / 2}px`;
        tooltip.removeAttribute('aria-hidden');
    };

    button.addEventListener('mouseenter', show);
    button.addEventListener('focus', show);
    button.addEventListener('mouseleave', () => hide(tooltip));
    button.addEventListener('blur', () => hide(tooltip));
    new MutationObserver(() => {
        if (isShown(tooltip)) {
            show();
        }
    }).observe(button, { attributes: true, attributeFilter: ['aria-pressed', 'aria-label'] });
    button.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hide(tooltip);
        }
    });
}
