# Project Echo 07

2D animated short series. Part 1: **"The Last Broadcast"** (~60 s).

| Path | What |
|---|---|
| [`script/part-01-the-last-broadcast.md`](script/part-01-the-last-broadcast.md) | Beat sheet, shot list with timecodes, production notes |
| [`animatic/index.html`](animatic/index.html) | Playable 60-second animatic: rough 2D boards, timing, day stamps, subtitles, synthesized scratch SFX |
| [`animatic/renders/echo07-part01-animatic-v2.mp4`](animatic/renders/echo07-part01-animatic-v2.mp4) | 1280×720 / 24 fps render with voices and scratch SFX mixed in (subtitles burned) |
| [`animatic/renders/echo07-part01-animatic-v2-9x16.mp4`](animatic/renders/echo07-part01-animatic-v2-9x16.mp4) | 1080×1920 / 24 fps vertical cut for Shorts, Reels and TikTok, reframed per shot, with voices |
| [`animatic/vo/vo.js`](animatic/vo/vo.js) | Scratch voice-over clips used by the animatic (generated) |
| [`tools/build_vo.py`](tools/build_vo.py) | Rebuilds the voice-over: RHVoice synthesis plus radio, TV and whisper effects |

## Running the animatic

Open `animatic/index.html` in a browser. It is a single self-contained file with no build step and no network access.

- **Space**: play/pause. **← / →**: step 1 s (hold Shift for 1 frame). **Home**: back to start.
- Click any shot in the shot list to jump to it.
- **Voices** toggles the scratch voice-over. **Mute SFX** mutes everything except the voices.
- **9:16 vertical** switches to the vertical cut (or open `index.html#vert`).
- **Mark match** shows the 00:03 puncture-mark frame next to the 00:53 glowing-mark frame with a crosshair, to check the callback lines up.

## Voices

The scratch voice-over is synthetic (RHVoice) and stands in for real recordings:

| Character | Voice | Treatment |
|---|---|---|
| Daniel | `bdl` (US male) | Dry and close; the DAY 5 line is a whisper (pitch removed, breathy) |
| News anchor | `slt` (US female) | Small TV speaker across the room |
| Ward | `alan`, pitched down | AM-radio band, overdriven speaker, carrier flutter, static and crackle |

To change a line or its timing, edit `LINES` in `tools/build_vo.py` and the matching entry in `VO` in `animatic/index.html`, then run:

```sh
sudo apt-get install rhvoice rhvoice-english sox ffmpeg
python3 tools/build_vo.py
```

To use real recordings later, drop them through the same script or replace the clips in `animatic/vo/vo.js`.
