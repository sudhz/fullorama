# Capture

The real extension on youtube.com, shot frame by frame in slow motion so that every video frame is captured exactly once.

## Browser
- **Chromium 153**, headless (`--headless=new --no-sandbox --autoplay-policy=no-user-gesture-required --mute-audio --hide-scrollbars --force-color-profile=srgb --lang=en-US`), driven by `puppeteer-core`.
- **Extensions:** the Fullorama build (`bun run build` → `dist-chrome`) and uBlock Origin Lite (the latest `chromium` zip from `uBlockOrigin/uBOL-home` releases), which keeps ads out of shot.
- **Cookies:** `PREF=f6=400&hl=en&gl=US` (dark theme, English) and `wide=1` (theater mode).
- **Injected CSS:** hides end screens, cards, tooltips (including `tp-yt-paper-tooltip`), bezels, the spinner, the top chrome, ambient mode, the watermark, paid-content overlays and the autoplay toggle. Two classes on `<html>` force the player controls shown or hidden; the controls' CSS transitions are off. The recommendations column stays, so the page looks like real YouTube.
- **Viewport:** 1680×889 CSS px at **2× density** (3360 px wide), so the theater player is exactly 21:9 (1680×720). After the fullscreen click: 1680×642, still 2×.
- **Mouse rest:** when not acting, the pointer rests at (1150, 800), in empty space right of the video title. Resting on a button shows its tooltip (v1.2.0 had a "Share" tooltip in shot).

## Frame-exact slow motion
- Playback at **0.0625×** (Chrome's minimum); quality forced with the player's `setPlaybackQualityRange("hd2160", "hd2160")`.
- A `requestVideoFrameCallback` hook, installed with `evaluateOnNewDocument`, counts presented frames and records each frame's media time.
- **One shot per media frame,** on the content's native grid: 60 fps for the hero, 24 fps for the second video. The 24 fps video is not interpolated; each frame is held for 2–3 film frames, as on a real 60 Hz screen.
- **A shot is kept only if:** the frame counter didn't change during the screenshot, no YouTube error screen is visible, and `readyState ≥ 2`. Screenshots are JPEG q92 with `optimizeForSpeed`.
- **Missed frames are re-shot:** a gap of more than 1.5 frames in media time, or a discarded shot, triggers a seek back 0.5 s and replay; frames already shot are skipped.
- **Film time = phase start + (media time − media time of the phase's first frame).** Nothing is retimed later.
- **Actions** run right after the shot of the frame whose film time crosses them, so their effect appears from the next frame. Each action logs the element's rectangle, so the drawn cursor and click rings land on it.

## Phases

| Phase | Kind | Notes |
|---|---|---|
| hero | slow, 60 fps | from 56 s, until the Next click |
| nav | wall time × 0.1 | ends when the second video has loaded (title, duration, `readyState ≥ 1`, no ad); then `seekTo(13.5)` off-camera |
| cam1 | slow, 24 fps | until the reload click |
| reload | wall time × 0.35 | `location.reload()`; the old document is marked first, so it can't count as loaded; then `seekTo` back to where it was |
| cam2 | slow, 24 fps | theater toggles, fullscreen click, until 38.35 |

## Recovery (YouTube's quirks)
- **Player failure ("Something went wrong"):** at 1/16 speed the 24 fps stream goes a long time between segment fetches, and the player fails, mostly in fullscreen. Detect it (error element visible, or `readyState 0`, or `currentTime` reset), reload off-camera, restore theater mode and fullscreen (same hover then click as the real one, retried up to 5 times), seek back and continue. The recovery count was 0–9 per run; the frames stay continuous.
- **Reload comes back in the default view:** after the scripted refresh, YouTube can drop theater mode. Click the size button off-camera before continuing, or the later toggles run backwards.
- **8K switch:** a fullscreen viewport wider than the 3840 px stream (2.5× density) makes YouTube switch *The Daily Dweebs* to its 8K stream, which this machine can't decode in time and stalls. Keep 2×.
- **Ads:** uBlock Origin Lite handles them; every phase also waits for `.ad-showing` to clear.

## Close-up re-shoot
The camera zooms to about 2.6× on the Fullorama button, so the 2× capture would be soft at 4K there. That span (see [timeline.md](timeline.md#picture-beats-pic)) is shot again at **3.6× density**, clipped to the page region the camera shows (x 776, y 378, 904×511 CSS px, computed from the composition's own camera with a 12 px margin).
- **Real slow playback, several passes:** seek to 1.2 s before the span, shoot validated frames, repeat until every media frame the main capture has in the span is covered. Before each pass: crop off, button unfocused (`blur()`), mouse at rest. Hover and click are single mouse events on a pre-measured point, so they cost the next frame no time.
- **Why 3.6×:** each shot must finish inside the 267 ms a frame stays on screen. At 4× and 4.8× most shots were lost; 3.6× (about 6 MP) catches about half per pass, and 4–5 passes finish it.
- **Don't pause and step.** Paused, YouTube's idle timer adds `ytp-autohide`, which hides the hover pill, so the frames stop matching the main capture.
- **Reuse the main capture's browser profile.** A fresh profile is a new visitor and can get a different page-layout experiment, which moves the playlist panel.
- **The page under the player:** YouTube reorders the Share/Download/Save buttons during a session, so that static strip comes from one still at the same density, with the buttons in the main capture's order (reorder the DOM if needed). Check it against the main capture before pasting it in.
- **The first frame of the span may never land;** the fade-in covers it with the main capture.

## Checks
- **Capture:** media-time steps exactly 1/fps in every slow phase (no gaps or repeats), film time never goes backwards, no error-screen-like or flat images. The one flat frame is YouTube's real loading page during the refresh, which is expected.
- **Close-up:** every close-up frame, downscaled, against the main frame of the same time: mean difference about 0.4 levels. The only differences are the hover pill right after the click (hidden in the main capture for 11 frames) and JPEG noise.
