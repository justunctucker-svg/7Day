# Project Echo 07

2D animated short series, ~60 s per part.

- Part 1: **"The Last Broadcast"**
- Part 2: **"Don't Open the Door"**
- Part 3: **"Subject 06"**
- Part 4: **"Ninety Seconds"**
- Part 5: **"The Copy"**

| Path | What |
|---|---|
| [`script/part-01-the-last-broadcast.md`](script/part-01-the-last-broadcast.md) | Beat sheet, shot list with timecodes, production notes |
| [`script/part-02-dont-open-the-door.md`](script/part-02-dont-open-the-door.md) | Part 2 beat sheet, shot list, production notes |
| [`script/part-03-subject-06.md`](script/part-03-subject-06.md) | Part 3 beat sheet, shot list, production notes |
| [`script/part-04-ninety-seconds.md`](script/part-04-ninety-seconds.md) | Part 4 beat sheet, shot list, production notes |
| [`script/part-05-the-copy.md`](script/part-05-the-copy.md) | Part 5 beat sheet, shot list, production notes |
| [`animatic/index.html`](animatic/index.html) | Part 1 playable animatic: rough 2D boards, timing, day stamps, subtitles, synthesized scratch SFX |
| [`animatic/part-02.html`](animatic/part-02.html) | Part 2 playable animatic |
| [`animatic/part-03.html`](animatic/part-03.html) | Part 3 playable animatic |
| [`animatic/part-04.html`](animatic/part-04.html) | Part 4 playable animatic |
| [`animatic/part-05.html`](animatic/part-05.html) | Part 5 playable animatic |
| [`animatic/renders/echo07-part01-animatic-v2.mp4`](animatic/renders/echo07-part01-animatic-v2.mp4) | 1280×720 / 24 fps render with voices and scratch SFX mixed in (subtitles burned) |
| [`animatic/renders/echo07-part01-animatic-v2-9x16.mp4`](animatic/renders/echo07-part01-animatic-v2-9x16.mp4) | 1080×1920 / 24 fps vertical cut for Shorts, Reels and TikTok, reframed per shot, with voices |
| [`animatic/renders/echo07-part02-animatic-v1.mp4`](animatic/renders/echo07-part02-animatic-v1.mp4) | Part 2, 1280×720 / 24 fps |
| [`animatic/renders/echo07-part02-animatic-v1-9x16.mp4`](animatic/renders/echo07-part02-animatic-v1-9x16.mp4) | Part 2, 1080×1920 / 24 fps vertical |
| [`animatic/renders/echo07-part03-animatic-v1.mp4`](animatic/renders/echo07-part03-animatic-v1.mp4) | Part 3, 1280×720 / 24 fps |
| [`animatic/renders/echo07-part03-animatic-v1-9x16.mp4`](animatic/renders/echo07-part03-animatic-v1-9x16.mp4) | Part 3, 1080×1920 / 24 fps vertical |
| [`animatic/renders/echo07-part04-animatic-v1.mp4`](animatic/renders/echo07-part04-animatic-v1.mp4) | Part 4, 1280×720 / 24 fps |
| [`animatic/renders/echo07-part04-animatic-v1-9x16.mp4`](animatic/renders/echo07-part04-animatic-v1-9x16.mp4) | Part 4, 1080×1920 / 24 fps vertical |
| [`animatic/renders/echo07-part05-animatic-v1.mp4`](animatic/renders/echo07-part05-animatic-v1.mp4) | Part 5, 1280×720 / 24 fps |
| [`animatic/renders/echo07-part05-animatic-v1-9x16.mp4`](animatic/renders/echo07-part05-animatic-v1-9x16.mp4) | Part 5, 1080×1920 / 24 fps vertical |
| [`animatic/engine/`](animatic/engine) | Shared animatic engine: drawing, characters, sets, rendering, audio (`core.js`), props, sets, the variable-tempo heartbeat clock and the end card shared across parts (`props.js`) and playback controls (`player.js`) |
| `animatic/part-NN/shots.js` | Each part's shots, voice cues and sound cues |
| [`animatic/vo/`](animatic/vo) | Scratch voice-over clips per part (generated) |
| [`tools/build_vo.py`](tools/build_vo.py) | Rebuilds the voice-over: RHVoice synthesis plus the radio effect |

## Running the animatic

Open `animatic/index.html` (Part 1) or `animatic/part-02.html` to `part-05.html` in a browser. It loads its scripts from the folder next to it, with no build step and no network access.

- **Space**: play/pause. **← / →**: step 1 s (hold Shift for 1 frame). **Home**: back to start.
- Click any shot in the shot list to jump to it.
- **Voices** toggles the scratch voice-over. **Mute SFX** mutes everything except the voices.
- **9:16 vertical** switches to the vertical cut (or open `index.html#vert`).
- **Mark match** shows the 00:03 puncture-mark frame next to the 00:53 glowing-mark frame with a crosshair, to check the callback lines up.

## Voices

Only Ward speaks: two lines over the radio in Part 1, three each over a walkie-talkie in Parts 2 and 3 (same chain plus a squelch at each end), in Part 4 three on the walkie plus one in the room with no radio filter, and in Part 5 three in the room plus one broadcast. They are synthetic scratch VO (RHVoice `alan`, pitched down) through an AM-radio chain: band-limited, overdriven speaker, carrier flutter, static and crackle. The script also has `dry`, `tv` and `whisper` chains ready if other characters get lines later.

To change a line or its timing, edit `PARTS` in `tools/build_vo.py` and the matching entry in `VO` in that part's `shots.js`, then run:

```sh
sudo apt-get install rhvoice rhvoice-english sox ffmpeg
python3 tools/build_vo.py 2   # one part, or no argument for all
```

To use real recordings later, drop them through the same script or replace the clips in `animatic/vo/part-NN.js`.
