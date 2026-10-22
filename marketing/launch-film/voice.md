# Voice and mix

The soundtrack is built separately from the picture and muxed as is: AAC 192 kb/s, 48 kHz stereo, 43.15 s.

## Voice: Cartesia Sonic 3.6, "Carson"
- **API:** `POST https://api.cartesia.ai/tts/sse`, headers `X-API-Key` and `Cartesia-Version: 2025-04-16`. Body: `model_id: "sonic-3.6"`, `voice: {mode: "id", id: "86e30c1d-714b-4074-a1f2-1cb6b552fb49"}`, `language: "en"`, `output_format: {container: "raw", encoding: "pcm_s16le", sample_rate: 44100}`, `add_timestamps: true`. The response is server-sent events: `chunk` events carry base64 PCM, and `timestamps` events carry `word_timestamps {words, start, end}`, one per whitespace-separated token. Concurrency limit: 2.
- **Why Carson:** chosen by ear over Corey, Parker and Jameson (Cartesia) and Chris and Will (ElevenLabs v4). ElevenLabs takes needed a style tag like `[friendly, conversational]` and their pause tags were unreliable.

## Takes
Three takes, so that each part keeps a natural read:

| Take | Text | Why |
|---|---|---|
| main | every line not listed below, in order, as one read | natural flow between sentences |
| list | "Turn it on once, and it stays on across new videos, refreshes, theater mode, and fullscreen." | read as one sentence, "videos" rises and the list sounds continuous. Inserting `<break time="1.4s"/>` between items made "videos" fall like a full stop. |
| fullorama | "Fullorama... adds one tiny button, directly to the YouTube player." | the "..." gives a spoken pause after the name, so it lands with the tile's bloom |

Check that the timestamped word count equals the token count; if it doesn't, generate again or rephrase. Keep the takes (MP3 plus words JSON) after every voice change, so the next edit can re-cut without re-voicing. The takes behind the current soundtrack were not kept.

## Cutting and placing sentences
- Sentences are cut whole, never inside a sentence.
- **Cut points:** compute a 10 ms energy envelope in dB (16 kHz mono, 3-frame smoothing). A start cut is the quiet frame closest to the first word, searched between 50 ms before the previous word's end and 60 ms after the first word's start. An end cut is mirrored (60 ms before the last word's end to 50 ms after the next word's start). "Quiet" means within 6 dB of the gap's floor, or 35 dB under the sentence's speech level (90th percentile of its frames); Cartesia's pauses are not digitally silent. The first and last words of a take use 0.12 s and 0.35 s margins.
- **Placement:** start the cut so the first word lands at `on` (or the anchor word at `at`). If it would end after `latest`, pull it earlier. Keep at least 0.10 s, ideally 0.28 s, after the previous sentence.
- **Fades:** 25 ms in, 40 ms out on every piece.

## Mix
1. **Voice stem:** the pieces mixed (`amix normalize=0`), high-pass 70 Hz, normalised to **−18 LUFS** (ebur128 integrated), then `acompressor=threshold=0.18:ratio=2.5:attack=8:release=120`.
2. **Music bed:** the track trimmed from 1.3433 s, mono, set to a target loudness, 0.8 s fade in and 2.4 s fade out, ducked by the voice with `sidechaincompress=threshold=0.02:ratio=6:attack=20:release=350`.
3. **Level match:** measure momentary loudness (100 ms) of voice and ducked music wherever the voice is above −32 LUFS. Adjust the bed until the median gap is **17 dB** (start at −27 LUFS, one correction step, ±0.5 dB tolerance).
4. **Effects** as in [timeline.md](timeline.md#sound-effects-and-music); clips are Kenney CC0 from the [/brag skill](https://github.com/latent-spaces/brag) assets (`assets/sfx/*.ogg`; the music is in `assets/music/`).
5. **Master:** sum everything, duplicate mono to stereo, `alimiter=limit=0.89`, then two-pass `loudnorm=I=-15:TP=-1.2:LRA=9` (measure, then apply with `linear=true`), 48 kHz.

## Checks
- No sentence overruns its `latest`; print the overruns, which should be none.
- Listen to the list: "videos" must end level or rising.
- Check "Fullorama" (FULL-oh-RAH-ma) and every word over clips of several seconds. Short clips make speech-to-text guess.
