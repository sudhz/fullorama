# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-11-09

### Added

- Stretch mode: fills the player by scaling the video unevenly on the shorter
  axis instead of trimming the edges. People who prefer seeing the whole frame
  can now choose distortion over cropping.
- The player button now cycles through three states: off, crop, stretch, off.

### Changed

- The toolbar popup reports the current mode (`Off`, `Crop is on`,
  `Stretch is on`) instead of a single on/off value.
- The selected mode is stored as `cropMode` (`off`, `crop`, or `stretch`)
  instead of the boolean `cropEnabled`.
- Existing installs are migrated once on first load:
  `cropEnabled: true` becomes `cropMode: "crop"`, `false` or missing becomes
  `"off"`. The old key is then removed so storage has one source of truth.
- The player button keeps its corner brackets, with a small square for crop and
  a wide bar for stretch. Its `title`, `aria-label`, and `data-flrm-mode` follow
  the mode.
- The README features, FAQ, and How It Works sections describe the two fill
  modes and the new storage key.

### Implementation

**Why a third state rather than a toggle:** crop and stretch are different
trade-offs, not two ways of doing the same thing. Crop preserves shape and
trims edges; stretch preserves framing and distorts shape. The user has to be
able to pick one, so the state model is a three-value mode rather than two
independent booleans. One key also avoids an impossible "crop and stretch both
on" state and keeps cross-tab comparison to a single value.

**Files added:**

- `src/storage/mode.ts` — defines `CropMode` and two pure helpers.
  `parseMode` is the single validation point for the stored mode; the legacy
  boolean is read once during migration. `nextMode` is the single definition of
  the button cycle, so the UI cannot drift from the stored order.
- `tests/mode.test.ts` — covers accepted/rejected values and the cycle order.
- `tests/state.test.ts` — drives `loadState` and `cycleMode` against an
  in-memory `chrome.storage.local` fake: legacy true/false, fresh install,
  existing mode, invalid mode fallback, and cycle writes.
- `tests/fit.test.ts` — drives the renderer with a fake player object (class
  set, style map, fixed geometry), so no browser or `chrome` stub is needed.
- `CHANGELOG.md` — this file.

**Files changed:**

- `src/player/crop.ts` → `src/player/fit.ts` — renamed and rewritten as a
  pure renderer. `applyFit(player, mode)` receives the mode instead of reading
  storage, which keeps storage out of the render path and makes the transitions
  testable. Crop keeps its original uniform scale:
  `max(playerAspect / videoAspect, videoAspect / playerAspect)`, written to
  `--flrm-scale`. Stretch writes `--flrm-scale-x` and `--flrm-scale-y`: the
  shorter axis gets the ratio, the other stays `1`. Both round to four decimal
  places and only write when the value changes, matching the original
  write-only-if-needed style.
- `src/content.css` — added the `.flrm-stretch-on` transform. This uses a
  transform instead of `width`/`height` plus `object-fit` because YouTube sizes
  `.html5-main-video` to the video's own aspect ratio and centers it inside the
  player. On a live page the video was 649×365 at `left: 68px` inside a
  784×365 player, and its `.html5-video-container` had zero height, so
  percentage sizing is unreliable. Scaling the element is the same mechanism
  crop already uses and was verified against the live player.
- `src/player/button.ts` — one `syncButtonState` now writes mode, label, and
  `aria-pressed` for both freshly injected and existing buttons. The icon has
  two overlay shapes toggled by CSS, so the DOM is built once and only its
  state changes.
- `src/storage/state.ts` — `cropMode` is now the in-memory and persisted
  value. `loadState` reads both keys, validates the new one with `parseMode`,
  falls back to the legacy boolean, writes the new key, and removes the old
  one. `onStorageChange` compares mode strings instead of booleans. Removed
  `isEnabled`, which had no remaining callers.
- `src/sync/sync.ts`, `src/index.ts` — call `applyFit(getPlayer(), getMode())`.
  The navigation, mutation, resize, metadata, fullscreen, and retry logic is
  unchanged; that is what makes the mode survive navigation, refresh, theater
  mode, and fullscreen.
- `src/popup/popup.ts` — maps the stored mode to text and a status class with
  a `Record<CropMode, ...>`; the popup stays read-only.
- `package.json` — version 1.3.0. The build reads the version from here and
  writes it into both generated manifests.
- `README.md` — documents crop versus stretch, the three-state button, the
  popup text, and the new storage/migration behavior.

**Upgrade path:** no action is required from users. The first content script
load after upgrading translates the old boolean, saves `cropMode`, and removes
`cropEnabled`. Someone who had crop on stays in crop; a fresh install starts
off. If the stored `cropMode` is ever malformed, it falls back through the same
migration path.

**Testing:** `bun run test` covers mode parsing/cycling, the migration paths,
and the renderer's class and variable transitions. The stretch CSS and icon
states were checked against a live YouTube player (geometry coverage and a
visual screenshot). Manual checks cover the parts unit tests cannot: navigation,
refresh, theater/fullscreen, cross-tab sync, the popup, and the legacy storage
migration in a real extension context. `web-ext lint` reports no errors; its one
warning about `strict_min_version` and Android is pre-existing.
