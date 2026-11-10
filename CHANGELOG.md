# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2026-11-09

### Added

- Stretch mode. It fills the player by scaling the video unevenly on the
  shorter axis instead of trimming the edges. People who prefer seeing the
  whole frame can now choose distortion over cropping.
- The toolbar popup is redesigned around an `Original` frame and two result
  cards, Crop and Stretch. The header reports the current state, a branching
  connector leads from the original to the results, and the selected card gets
  a white outline, a filled radio, and a short mirrored reflection.
- The card previews loop between normal and the mode applied. Crop zooms in and
  clips; stretch widens without clipping. The Original frame above stays still.
- The popup reports the selected mode and whether it is on:
  `Crop is off`, `Crop is on`, `Stretch is off`, `Stretch is on`.

### Changed

- The player button no longer cycles through three states. It turns the mode
  selected in the popup off and on. The popup card is now the only mode
  selector; the player button is the only off switch.
- Clicking a popup card selects that mode and turns it on. Clicking the active
  card keeps it on.
- The selected card is white-outlined with a filled radio, and the header
  status says whether it is on. The player icon still distinguishes the active
  mode: a small square for crop, a wide bar for stretch, and only while it is
  on.
- The popup is 360 px wide. The footer keeps only Share feedback and the
  version; the "Built by" line and View source link are removed.
- The popup is interactive instead of read-only.
- State is stored as `fillMode` (`crop` or `stretch`) and `fillEnabled`
  (`true` or `false`) instead of a single `cropMode` tri-state or the older
  boolean `cropEnabled`. Existing values are migrated once on first load and
  the old keys are removed.
- The README features, FAQ, and How It Works sections describe the split
  controls, the previews, and the two storage keys.

### Implementation

**Why two values instead of one:** the player can be off while still
remembering which mode its button should turn back on. A single
`off | crop | stretch` value cannot represent "stretch is selected but currently
off" without losing the last mode, and two independent booleans would allow the
impossible "crop and stretch both on" state. `fillMode` plus `fillEnabled`
models the interaction exactly: the popup picks the mode, the player button
toggles the boolean.

**Interaction model:** clicking a card calls `selectMode`, which sets the mode
and sets `fillEnabled` to true. The player button calls `toggleEnabled`, which
changes only the boolean. This is why the player button is the only off switch
and why the popup can change modes without a separate toggle.

**Files added:**

- `src/storage/mode.ts` — `FillMode` (`crop | stretch`), `parseFillMode` for the
  new key, and `parseLegacyMode` for the old `off | crop | stretch` form.
  `parseLegacyMode` exists only for migration, so the removed three-state model
  cannot leak into runtime code.
- `src/popup/preview.jpg` — a 560×315 JPEG cropped from
  `store-assets/screenshots/screenshot-before-off-1280x800.png`, above the
  player controls. It shows a real YouTube video frame, keeps the popup package
  around 25 KB, and stays sharp at 2× and 3× display density.
- `tests/mode.test.ts` — accept/reject tables for both parsers.
- `tests/state.test.ts` — drives `loadState`, `selectMode`, and `toggleEnabled`
  against an in-memory `chrome.storage.local` fake: both migration chains, fresh
  install, valid keys untouched, malformed fallback, and writes.
- `tests/fit.test.ts` — drives the renderer with a fake player object (class
  set, style map, fixed geometry), so no browser or `chrome` stub is needed.
- `CHANGELOG.md` — this file.

**Files changed:**

- `src/storage/state.ts` — holds `fillMode` and `fillEnabled` in memory and
  persists both. `loadState` first accepts a valid pair of new keys, then falls
  back through `cropMode` and `cropEnabled`, writes the new pair, and removes
  the legacy keys. `onStorageChange` watches both keys and fires one callback
  per change event, so a popup write and a player-button write both update open
  YouTube tabs.
- `src/player/fit.ts` — now `applyFit(player, enabled, mode)`. Disabled clears
  both mode classes and all scale variables. Crop keeps its original uniform
  scale, `max(playerAspect / videoAspect, videoAspect / playerAspect)`, written
  to `--flrm-scale`. Stretch writes `--flrm-scale-x` and `--flrm-scale-y`: the
  shorter axis gets the ratio, the other stays `1`. Both round to four decimal
  places and only write when the value changes. The mode math is unchanged;
  only the enabled gate and the parameter list changed.
- `src/player/button.ts` — `syncButtonState` now writes the selected mode to
  `data-flrm-mode`, the enabled state to `aria-pressed`, and a label such as
  `Fullorama: crop off` or `Fullorama: stretch on`. Clicking toggles enabled
  instead of advancing a cycle. The icon still contains both overlay shapes;
  CSS reveals only the matching one while the button is pressed.
- `src/content.css` — the icon rules now require
  `[aria-pressed="true"]` as well as the mode attribute, so the square and bar
  disappear when off. The crop and stretch transforms are otherwise unchanged.
  Transforms are used instead of `width`/`height` plus `object-fit` because
  YouTube sizes `.html5-main-video` to the video's own aspect ratio and centers
  it inside the player. On a live page the video was 649×365 at `left: 68px`
  inside a 784×365 player, and its `.html5-video-container` had zero height, so
  percentage sizing is unreliable.
- `src/popup/popup.html` — a header with the Fullorama lockup and status, an
  `Original` preview, a branching connector, two result-card buttons with radio
  controls and two-line captions, and a footer with feedback and version.
- `src/popup/popup.css` — a 360 px popup with 20 px padding, two equal
  `minmax(0, 1fr)` card columns at a 14 px gap, and 21:9 previews holding a 16:9
  still. Crop scales both axes by `21 ÷ 16 = 1.3125`; stretch scales only X by
  the same amount. Both run the same 5-second loop: hold normal, transition,
  hold applied, transition back. The selected card uses a white outline with a
  gap, a filled radio, and a clipped, masked mirror under the preview that works
  in both Chromium and Firefox. `prefers-reduced-motion: reduce` removes the
  animation and holds each card in its applied state.
- `src/popup/popup.ts` — loads shared state, renders the header status and the
  selected card, and calls `selectMode` on a card click. `aria-pressed` marks
  the selected mode; the header status communicates on/off.
- `src/sync/sync.ts`, `src/index.ts` — pass `isEnabled()` and `getMode()` to
  `applyFit`. The navigation, mutation, resize, metadata, fullscreen, and retry
  logic is unchanged; that is what keeps the selected mode and on/off state
  across navigation, refresh, theater mode, and fullscreen.
- `scripts/build.ts` — copies `preview.jpg` into both package roots.
- `package.json` — version 1.3.1. The build reads it and writes it into both
  generated manifests.
- `README.md` — documents choosing a mode in the popup, toggling it from the
  player button, the original/result previews, the two storage keys, and the
  migration path.

**Upgrade path:** no action is required from users. On first load the extension
translates the first key it finds and removes the legacy keys:

| Stored value | Result |
| --- | --- |
| `cropMode: "crop"` | mode crop, enabled |
| `cropMode: "stretch"` | mode stretch, enabled |
| `cropMode: "off"` | mode crop, disabled |
| `cropEnabled: true` | mode crop, enabled |
| `cropEnabled: false` | mode crop, disabled |
| nothing or malformed | mode crop, disabled |

Someone who had crop on stays in crop with it on. Someone who had stretch on
stays in stretch with it on. A fresh install starts in crop, off, outlined in
the popup.

**Testing:** `bun run test` covers mode parsing, both migration chains,
`selectMode`/`toggleEnabled`, the renderer's class and variable transitions, and
the presence of `preview.jpg` in both packages. The popup was rendered in a
360 px stubbed-Chrome harness: the layout resolves to 320 px of content, 153 px
cards, and 66 px previews; the header status, selected card, and radio state
update on click; and the selected card shows its reflection. The previews loop
and hold the applied state under reduced motion. The stretch transform geometry
was checked against a live YouTube player during development. `web-ext lint` reports no errors; its one warning about
`strict_min_version` and Android is pre-existing.
