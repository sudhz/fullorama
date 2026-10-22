# Composition

One 1920×1080 HTML page, rendered at device scale 2 (**3840×2160**). `renderFrame(t)` builds every element as a pure function of film time, then awaits image decoding. A `render` event (detail = time) drives it, and `body[data-frame]` reports completion. Captured frames are looked up as the latest at or before `t + 1/120`.

## Visual identity
- **Colours:** stage near-black with a crimson floor bloom; UI greys from the popup (`#0f0f0f`, `#1c1c1e`, `#2c2c2e`, text `#f1f1f1`); "16:9 video" outline `#ff4d6d`; "on" dot `#2ba640`.
- **Type:** Inter Tight 700 (labels 60 px, benefit lines 72 px), Inter (UI, chips 25 px/600, subtitle 500), Outfit 800 (wordmark).
- **Player button:** the exact geometry from `src/player/button.ts`: `0 0 36 36` viewBox, corner paths `M8 13V8h5`, `M23 8h5v5`, `M28 23v5h-5`, `M13 28H8v-5` (stroke 2.5, round caps), and a white 10×10 centre square (`rx 1`) for ON. The reveal, the logo and the real button share this shape.
- **Sunset tile** (SVG, colours sampled from `icons/128.png`): sky gradient `#fdaf47 → #fda347 → #fb874b → #f96e4d → #f55852 → #ee435c → #e43069 → #da2172`; horizon at 64.4 %; half sun `#fdf4c5`, radius 14.2 % of the tile; ground `#421830`; corner radius 20 %.
- **Wordmark:** live text "Fullorama" in Outfit 800, letter-spaced so its glyph box has the logo lockup's proportions (460×73).
- **Vignette** `radial-gradient(ellipse 75% 75%, transparent 55%, rgba(0,0,0,.32))`, and grain: 8 tiles of 1024 px uniform noise (`noise=alls=40:allf=u`), cycled per frame, overlay blend at 5 %.

Everything above is vector or live text, so it's sharp at 4K. Bitmaps are only the captures and the desk plate.

## Backgrounds (CSS gradients fitted to the v1.2.0 plates)
- **Stage** (with `brightness(.92)`, plus `radial-gradient(ellipse 60% 70% at 50% 38%, transparent 40%, rgba(0,0,0,.45))` on top):
  `radial-gradient(ellipse 62% 26% at 50% 88%, rgba(175,30,30,.95), rgba(125,16,20,.5) 50%, transparent)`, two corner hazes `radial-gradient(ellipse 24% 46% at 0% 0% / 100% 0%, rgba(150,74,30,.8), rgba(70,36,24,.35) 55%, transparent)`, base `radial-gradient(ellipse 60% 64% at 50% 42%, #222124, #141113 70%, #0a0708)`.
- **End card:** floor `radial-gradient(ellipse 40% 32% at 50% 84%, rgba(150,12,12,.82), rgba(100,8,8,.5) 45%, transparent)`, corners `radial-gradient(ellipse 34% 48% at 0% 0% / 100% 0%, rgba(52,30,13,.75), rgba(34,20,12,.4) 55%, transparent)`, centre warmth `radial-gradient(ellipse 42% 34% at 50% 52%, rgba(92,16,16,.55), rgba(60,12,12,.25) 55%, transparent)`, base `radial-gradient(ellipse 60% 55% at 50% 30%, #121212, #0a0808 70%, #060504)`.

Fitting method: render a candidate, blur both images (box 15 px), compare a 9×9 grid of background points; mean max-channel error ended at about 4–6 levels.

## Browser window
1500×838 px, radius 14, a 44 px title bar `#1c1c1e` with traffic lights, back/forward/reload, and the URL `youtube.com/watch?v=<id>` (switching to the second video's ID at the Next click). The captured 1680 px page is scaled by 1500/1680. Shadow `0 40px 110px rgba(0,0,0,.6)`. It rises in over 0–1.3 s (70 px, scale 0.97 → 1).

## Camera
The window sits in a world layer; the camera maps a world point to a screen point at a zoom (interpolated in log space).
- Push in 1.0 → 1.2 from 0 to `blur − 0.1`.
- Fly (ease in-out) to a **2.6×** close-up on the Fullorama button, framed low-right at screen (≥1620, ≥760) so the window's right and bottom edges stay outside the frame. Drift to 2.68× until the click.
- After the click: exponential ease back to 1.0 over `pullBack` → `pullDone + 0.4`.
- Montage: 0.86×, window lowered (screen centre y 594) so the labels fit, over 0.7 s.

## Moments
- **Guides:** the "21:9 display" rectangle draws on (stroke dash), the "16:9 video" rectangle in `#ff4d6d` with hatched side bars (14 px pattern at 45°); tags fade in 0.15 s after each.
- **Brand reveal:** brackets fly in from four directions with up to 30° rotation (expo ease, 0.55 s), span 185 px at (960, 452). The square pops (0.18 s, back ease), then blooms into the tile (expo, 0.44 s; white fades out, radius grows, warm glow). The wordmark rises with a blur-in (0.42 s). Before the flight, the wordmark blurs out and the tile folds back into the square. The brackets then shrink to the real button's glyph size, land on it, and hand over to the captured button within 0.12 s.
- **Close-up overlay:** the 3.6× frames are laid over the region they cover, crossfading as given in [timeline.md](timeline.md#picture-beats-pic).
- **Cursor:** a drawn arrow (white, `#111` outline, drop shadow; 40 px when zoomed, 30 px otherwise) glides between logged button centres with ease-in-out; it presses (scale 0.88) within ±90 ms of each click. Each click leaves a ring expanding over 0.5 s (90 px with a 16 % white flash for the Fullorama click, 46 px for the rest).
- **Montage text:** the "Crop stays on" pill (button glyph, green dot) and one label per spoken item; each label fades out just before the next one.
- **Fullscreen:** from the first fullscreen frame, the window holds its last windowed frame and dissolves into the fullscreen picture over 0.1 s, starting on the theater player's place. The chrome peels away over 0.5 s, and the picture grows to cover the frame. Behind the benefit lines it's blurred 22 px and dimmed 68 %.
- **Desk:** the picture becomes the monitor's screen as the desk plate pulls back (ease in-out, `desk + 0.1` → `deskDone`) until the screen is 1231 px wide. Plate placement: scale 1.3645, offset (−89.3, −135.3) in 1536×1024 plate units.
- **End card** (same layout as v1.2.0): brackets centred at (960, 330), 140 px; tile at 71.3 % of that; wordmark glyph box top 466, height 74; "Free and open source." sized to 412 px wide, centred on y 600, `#d2c4c7`, tracking −0.025 em; chips 66 px tall, radius 33, `#1f1d1e` with a 7 % white border, centred row at y 699 with 12 px gaps, Simple Icons logos at 27 px.

## Desk plate
1. **Generate** with gpt-image-2 (1536×1024, 3:2): a photoreal 34″ 21:9 monitor with thin bezels on a dark walnut desk at night, perfectly frontal and symmetric, warm amber bias light, keyboard and mouse, a plant left, a mug and a shelf with a glowing lamp right, the screen uniform pure green `#00FF00`, and **nothing in the foreground** (the first try had a chair).
2. **Upscale 4×** with Real-ESRGAN x4plus (RRDBNet, 23 blocks), tiled 256 px with 16 px padding on CPU (about 7 minutes) → 6144×4096. Lanczos looked soft on the keyboard and wood grain.
3. **Cut the screen** without keying: find where each row and column crosses 50 % green with sub-pixel accuracy, fit the four edges (least squares), inset 1.25 px, and cut an anti-aliased rectangular hole (alpha = covered fraction per pixel). Neutralise green spill on the bezel (G → max(R, B) within 6 px). Screen in the current plate: x 316.43, y 179.85, 902.18×347.23 plate px (aspect 2.60).
