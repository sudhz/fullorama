# Timeline

Every time is **film seconds** at 60 fps; the film is **43.15 s** (2,589 frames). The capture performs `ACT` for real in the browser, the composition draws from `PIC`, and the mix places `VOICE`, `SFX` and the music. These are the exact values in the published film.

## Storyboard

| Time | Voiceover | Picture |
|---|---|---|
| 0.0–3.0 | "If you have an ultrawide monitor, you've seen this." | A floating dark browser rises onto the stage. YouTube theater mode, crop off, *Big Buck Bunny* with black side bars. |
| 3.0–6.8 | "A 21:9 display… playing YouTube like it's 16:9." | Slow push in. A "21:9 display" outline around the player, then a red "16:9 video" outline with hatched side bars. |
| 6.8–11.8 | "So, I fixed it. Fullorama…" | The browser blurs and dims. Four corner brackets fly in and lock; the white "on" square pops and blooms into the sunset tile; the wordmark rises. |
| 11.8–14.3 | "…adds one tiny button, directly to the YouTube player." | Tile and wordmark fold away; the brackets fly onto the real Fullorama button as the camera zooms to the player's bottom-right corner. |
| 14.3–15.7 | "Click it…" | The cursor glides onto the button. Real click at 15.52; the music drop lands on it, with a ring and a soft flash. The black bars disappear. |
| 15.7–19.4 | "…and the video instantly fills your ultrawide display. That's it." | Fast pull back: the video fills the 21:9 player. |
| 19.4–24.3 | "Turn it on once, and it stays on across new videos," | Montage framing, "Crop stays on" pill, label "New video"; the cursor clicks YouTube's Next button → *The Daily Dweebs*, still cropped. |
| 24.3–26.6 | "refreshes," | Label "Refresh"; real page reload (YouTube's loading page); the video comes back, still cropped. |
| 26.6–28.9 | "theater mode," | Label "Theater mode"; click to the default view (playlist and recommendations) and back; the crop re-fits each time. |
| 28.9–30.7 | "and fullscreen." | Label "Fullscreen"; real fullscreen click; the browser chrome peels away and the picture grows to fill the frame. |
| 30.7–34.9 | "No account. No tracking, nothing else to configure." | The same playback, blurred and dark, one line per phrase. |
| 34.9–37.9 | "Just YouTube, using the screen you paid for." | The picture sharpens and the camera pulls back: it's the screen of an ultrawide monitor on a desk. |
| 38.2–43.15 | "Fullorama. Free and open source." | End card: brackets, sunset tile, wordmark, "Free and open source.", Chrome Web Store · Firefox Add-ons · GitHub chips. |

## Videos

| Role | YouTube ID | Starts at | Native fps | Notes |
|---|---|---|---|---|
| Hero | `aqz-KE-bpKQ` (*Big Buck Bunny* 60fps 4K) | 56 s | 60 | 2160p stream. |
| Second (after Next) | `RJnKaAtBPhA` (*The Daily Dweebs*) | 13.5 s | 24 | 2160p stream (mastered 8K). Camera locked off from 11.3 to 36 s; outside that the giant chicken's stomps shake it, so the ~15.5 s clip must start between 11.3 and 20. Loaded check: title contains "Dweebs", duration 50–70 s. |

Both play in an anonymous playlist (`watch_videos?video_ids=<hero>,<second>`), so YouTube's own Next button opens the second. Navigation runs in wall time at **0.1×** film speed, the reload at **0.35×**.

## Browser actions (`ACT`)

| Action | Time | | Action | Time |
|---|---|---|---|---|
| controls on | 11.3951 | | controls on | 26.4167 |
| hover Fullorama button | 14.4167 | | hover size button | 26.6167 |
| **click Fullorama button** | **15.5167** | | click size button (to default view) | 26.7667 |
| controls off | 17.2667 | | hover size button | 27.3167 |
| controls on | 20.9167 | | click size button (back to theater) | 27.5667 |
| hover Next | 21.5167 | | controls off | 27.7167 |
| **click Next** | **22.0667** | | controls on | 28.6167 |
| **click reload** | **24.4667** | | hover fullscreen | 28.8167 |
| | | | **click fullscreen** | **29.0667** |
| | | | controls off | 29.4667 |
| | | | capture ends | 38.35 (end card + 0.15) |

## Picture beats (`PIC`)

| Beat | Time | Beat | Time |
|---|---|---|---|
| "21:9 display" tag | 3.3 | montage framing | 19.3167 |
| "16:9 video" tag | 6.0 | "Crop stays on" pill | 19.5167 |
| browser blurs | 7.7 | label "New video" | 21.7167 |
| brackets fly in | 7.8 | label "Refresh" | 24.2167 |
| "on" square pops | 9.45 | label "Theater mode" | 26.5167 |
| tile blooms | 9.65 | label "Fullscreen" | 28.8167 |
| wordmark in | 9.78 | chrome peels away | 29.1667 → 30.4667 |
| brackets fly to the button | 11.8167 → 12.5667 | benefits blur in | 30.4667 |
| cursor glides in | 13.9667 | "No account." | 30.7167 |
| pull back after the click | 15.7167 → 16.8667 | "No tracking." | 31.9167 |
| | | "Nothing else to configure." | 32.9 |
| | | pull back to the desk | 34.9 → 36.5 |
| | | fade to black | 37.9 |
| | | end card: brackets, wordmark | 38.2 |
| | | end card: tile | 38.65 |
| | | "Free and open source." | 39.45 |
| | | store chips | 39.85 (+0.06, +0.16) |

**Close-up** (see [capture.md](capture.md#close-up-re-shoot)): spans `flyLand − 0.15` to `pullBack + 0.02`; fades in over `flyLand − 0.12` → `flyLand + 0.03`, hands back over `pullBack − 0.005` → `pullBack + 0.017`. Shot at 3.6× density.

## Voice (`VOICE`)

Each sentence is placed so that it starts at **on** (or so that the **anchor** word lands at **at**) and ends by **latest**. Lines marked *list* come from a separate take read as one sentence; *fullorama* is read alone, as "Fullorama... adds one tiny button…".

| Line | on | anchor @ at | latest | take |
|---|---|---|---|---|
| If you have an ultrawide monitor, you've seen this. | 0.4 | | 3.2 | main |
| A twenty-one by nine display... playing YouTube like it's sixteen by nine. | | "twenty-one" @ 3.35 | 7.6 | main |
| So, I fixed it. | 7.9 | | 9.55 | main |
| Fullorama adds one tiny button, directly to the YouTube player. | 9.65 | | 14.2167 | fullorama |
| Click it... | 14.3167 | | 15.4667 | main |
| and the video instantly fills your ultrawide display. | 15.6667 | | 18.4167 | main |
| That's it. | 18.4667 | | 19.5667 | main |
| Turn it on once, and it stays on across new videos, | | "videos," @ 21.8167 | 24.1167 | list |
| refreshes, | 24.2667 | | 26.4167 | list |
| theater mode, | 26.5667 | | 28.7167 | list |
| and fullscreen. | 28.8667 | | 30.4667 | list |
| No account. | 30.7167 | | 31.8467 | main |
| No tracking. | 31.9167 | | 32.816 | main |
| Nothing else to configure. | 32.9 | | 34.8 | main |
| Just YouTube, using the screen you paid for. | 35.1 | | 37.85 | main |
| Fullorama. | 38.2 | | 39.1333 | main |
| Free and open source. | 39.45 | | 42.35 | main |

## Sound effects and music

| Time | Sound | Level |
|---|---|---|
| 7.75 | whoosh | 0.10 |
| 12.5467 | `interface/switch_002` (brackets land) | 0.22 |
| click − 0.02 (15.4967) | `ui/mouseclick1` | 0.55 |
| click + 0.05 (15.5667) | whoosh | 0.16 |
| each later click − 0.02 (22.0467, 24.4467, 26.7467, 27.5467, 29.0467) | `ui/mouseclick1` | 0.32 |
| 29.2167 | whoosh | 0.08 |
| 34.95 | whoosh | 0.07 |
| 38.65 | `interface/select_008` | 0.20 |

"Whoosh" is 0.5 s of pink noise, band-passed at 1450 Hz (3700 Hz wide), 0.2 s fade in, 0.25 s fade out. Every effect gets `aecho=0.8:0.5:60:0.18`.

**Music:** ende.app "Happy Beats / Business Moves Vol. 11". The track's drop (16.86 s into it) lands on the click at 15.5167, so the track starts 1.3433 s in. 0.8 s fade in, 2.4 s fade out.
