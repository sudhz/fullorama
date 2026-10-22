# Render, check, publish

## Render
- Serve the composition over HTTP (fonts and fetches need it), open it in its own headless Chromium at 1920×1080, device scale 2, and step frames 0–2588 (`t = n / 60`). Save each as JPEG q96. Make it resumable (skip existing files) and retry a frame on a fresh page if it hangs.
- About **33 minutes** for 2,589 frames on 3 cores, about 2.4 GB of JPEGs.

## Encode

```bash
ffmpeg -framerate 60 -i frames/%05d.jpg -i soundtrack.m4a -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level 5.2 -pix_fmt yuv420p \
  -x264-params keyint=120:min-keyint=60 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy -t 43.15 -movflags +faststart fullorama-demo-4k.mp4
```

- **4K:** about 165 MB, 9 minutes.
- **1080p (for the README and web players):** add `-vf scale=1920:1080:flags=lanczos`, use CRF 17 and level 4.2. About 24 MB, 2 minutes.
- **Poster:** frame 2220 (the desk shot), scaled to 1920×1080.

## Checks
Run all of these before publishing:
- **Motion:** the mean absolute change from the previous frame (downscaled 4×) for every frame.
  - **Repeated frames inside motion** (change < 0.05 with both neighbours > 0.6) are fine only in the 24 fps stretch, where they're its 2–3 cadence.
  - **Isolated jumps** (> 6 and more than 4× both neighbours) must each be a real event: the click, Next, the refresh, theater mode, fullscreen, or a scene cut in *Big Buck Bunny*. Anything else is a bug.
- **Sharpness** (Laplacian variance) across both close-up crossfades: no pop.
- **Encode quality:** PSNR of the encoded 4K against the rendered frames. The current film has a mean of 51.6 dB and a worst frame of 46.6 dB, the desk pull-back with grain.
- **By eye:**
  - contact sheets of the whole film every 0.5 s;
  - full-resolution crops, frame by frame, of every transition: close-up in and out, Next, refresh, fullscreen, the desk pull-back, the end card;
  - the end card side by side with the v1.2.0 one.
- **Camera shake in the footage:** if the second video changes, measure frame-to-frame motion on its sky and roofline with phase correlation. Choose a window with no shake: under about 1 px per frame at 480p, apart from smooth drifts.

## Publish
- **Release asset:** `gh release upload v1.2.0 "fullorama-demo-4k.mp4#Fullorama for YouTube — demo video (4K60)"`, then `gh release delete-asset` the old file and edit the notes link. Editing a release doesn't trigger the store-publish workflow, which only runs on `published`.
- **README inline video:** GitHub only plays `user-attachments` videos inline. Upload the 1080p file with the `gh` token:

  ```bash
  RID=$(gh api repos/sudhz/fullorama --jq .id)
  curl -sS "https://uploads.github.com/user-attachments/assets?name=fullorama-demo.mp4&content_type=video/mp4&repository_id=$RID" \
    -X POST -H "Authorization: Bearer $(gh auth token)" -H "Accept: application/json" \
    -H "Content-Type: video/mp4" --data-binary @fullorama-demo-1080p.mp4
  ```

  Put the returned `https://github.com/user-attachments/assets/<id>` URL alone on a line in the README.
  - The bare URL returns 404 to logged-out `curl`. That's normal: GitHub rewrites it into a signed `private-user-images` link for each viewer.
  - Test in a logged-out browser: the README must show a `<video>` that plays. `gh api markdown` shows the rewrite too.
- **YouTube:** upload the 4K file with the "FIXED" thumbnail (1280×720, under 2 MB: before/after ultrawide monitors with a generic mountain landscape). Current video: <https://www.youtube.com/watch?v=hQ6AZAaAgBY>.
- **Chrome Web Store:** the listing video field takes a YouTube link only; set it in the Developer Dashboard → Store listing.
- **Firefox Add-ons:** listing previews are images only; link the video in the description.

**Share copy:** Bought a 21:9 monitor, still watching YouTube with two fat black bars? Fullorama adds one tiny button to the player: click it once and every video fills the screen you paid for, across new videos, refreshes, theater mode and fullscreen. Free and open source for Chrome and Firefox.
