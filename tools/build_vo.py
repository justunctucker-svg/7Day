#!/usr/bin/env python3
"""Build the scratch voice-over for the animatic.

Synthesizes each line with RHVoice, runs it through a per-character effect
chain (radio, walkie, in-room, TV speaker, whisper), and writes animatic/vo/part-NN.js:
base64 MP3s the animatic loads without a server.

Needs: RHVoice (rhvoice + rhvoice-english), sox, ffmpeg, numpy.
    sudo apt-get install rhvoice rhvoice-english sox ffmpeg
    python3 tools/build_vo.py        # every part
    python3 tools/build_vo.py 2      # just Part 2
"""
import base64
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000

# part -> (rng seed, lines); each line: id, voice, rate %, chain, text
PARTS = {
    1: (7, [
        ("ward1", "alan", 88, "radio", "Daniel Hayes... if you can hear this... don't leave the farmhouse."),
        ("ward2", "alan", 85, "radio", "You've been infected... since day one."),
    ]),
    2: (8, [
        ("ward1", "alan", 88, "walkie", "Good. You didn't open the door."),
        ("ward2", "alan", 85, "walkie", "That mark is how they find you."),
        ("ward3", "alan", 88, "walkie", "Check the closet. I left you something."),
    ]),
    3: (9, [
        ("ward1", "alan", 88, "walkie", "You found it. Good."),
        ("ward2", "alan", 84, "walkie", "It isn't a person anymore... Shoot it."),
        ("ward3", "alan", 80, "walkie", "Good... Now you're ready."),
    ]),
    4: (10, [
        ("ward1", "alan", 86, "walkie", "They heard the shot."),
        ("ward2", "alan", 96, "walkie", "Ninety seconds. Go down... under the floor."),
        ("ward3", "alan", 100, "walkie", "Don't stop. Whatever you hear."),
        ("ward4", "alan", 78, "room", "Hello... Seven."),
    ]),
}


def sh(*cmd, inp=None):
    subprocess.run(cmd, input=inp, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read(path):
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return x if w.getnchannels() == 1 else x.reshape(-1, w.getnchannels()).mean(axis=1)


def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def whisperize(x, rng):
    """Keep the spectral envelope, throw away the pitch: random-phase STFT resynthesis."""
    n, hop = 1024, 256
    win = np.hanning(n).astype(np.float32)
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    out = np.zeros_like(pad); norm = np.zeros_like(pad)
    for i in range(0, len(pad) - n, hop):
        spec = np.fft.rfft(pad[i:i + n] * win)
        mag = np.abs(spec)
        phase = rng.uniform(-np.pi, np.pi, mag.shape)
        frame = np.fft.irfft(mag * np.exp(1j * phase), n) * win
        out[i:i + n] += frame; norm[i:i + n] += win ** 2
    return (out / np.maximum(norm, 1e-3))[n:n + len(x)]


def radio_texture(x, rng):
    """Carrier flutter, static hiss and crackle on top of the band-limited voice."""
    t = np.arange(len(x)) / SR
    flutter = 1 + 0.12 * np.sin(2 * np.pi * 6.3 * t) + 0.06 * np.sin(2 * np.pi * 0.7 * t + 1)
    hiss = rng.normal(0, 1, len(x)).astype(np.float32)
    hiss = np.convolve(hiss, np.ones(3) / 3, mode="same") * 0.035
    crackle = np.zeros(len(x), np.float32)
    for pos in rng.integers(0, len(x), size=int(len(x) / SR * 9)):
        k = int(rng.integers(20, 160))
        crackle[pos:pos + k] += rng.normal(0, 0.25, len(crackle[pos:pos + k])) * np.exp(-np.arange(len(crackle[pos:pos + k])) / 30)
    return x * flutter + hiss + crackle


def squelch(x, rng):
    """Walkie-talkie key-up and release: a burst of open-carrier noise at each end."""
    def burst(sec, decay):
        n = int(sec * SR)
        return rng.normal(0, 0.3, n).astype(np.float32) * np.exp(-np.arange(n) / (decay * SR))
    gap = lambda sec: np.zeros(int(sec * SR), np.float32)
    return np.concatenate([burst(0.14, 0.08), gap(0.06), x, gap(0.1), burst(0.22, 0.09)])


def build(tmp, lid, voice, rate, chain, text, rng):
    raw, base, fx = tmp / f"{lid}_raw.wav", tmp / f"{lid}_base.wav", tmp / f"{lid}_fx.wav"
    sh("RHVoice-test", "-p", voice, "-R", str(SR), "-r", str(rate), "-o", str(raw), inp=text.encode())
    # trim head/tail silence, normalise
    sh("sox", str(raw), "-r", str(SR), str(base), "silence", "1", "0.02", "0.5%", "reverse", "silence", "1", "0.02", "0.5%", "reverse", "gain", "-n", "-3")
    if chain == "dry":
        sh("sox", str(base), str(fx), "highpass", "80", "compand", "0.02,0.2", "-60,-60,-30,-18,0,-8", "-3", "reverb", "12", "50", "40", "gain", "-n", "-4")
    elif chain == "tv":
        # small TV speaker across the room
        sh("sox", str(base), str(fx), "highpass", "260", "lowpass", "4200", "overdrive", "4", "reverb", "35", "50", "60", "gain", "-n", "-6")
    elif chain == "whisper":
        w = whisperize(read(base), rng)
        write(fx, w)
        sh("sox", str(fx), str(tmp / f"{lid}_w.wav"), "highpass", "350", "treble", "+4", "reverb", "8", "gain", "-n", "-8")
        fx = tmp / f"{lid}_w.wav"
    elif chain == "room":
        # Ward in person: same voice and pitch as on the radio, no band-limiting, a little room
        sh("sox", str(base), str(fx), "pitch", "-180", "highpass", "70", "compand", "0.02,0.2", "-60,-60,-30,-18,0,-8", "-3", "reverb", "22", "50", "45", "gain", "-n", "-3")
    elif chain in ("radio", "walkie"):
        # deeper, then an AM-radio band, driven speaker, flutter + static
        sh("sox", str(base), str(tmp / f"{lid}_b.wav"), "pitch", "-180", "highpass", "380", "lowpass", "2900", "overdrive", "14", "gain", "-n", "-4")
        y = radio_texture(read(tmp / f"{lid}_b.wav"), rng)
        write(fx, squelch(y, rng) if chain == "walkie" else y)
        sh("sox", str(fx), str(tmp / f"{lid}_r.wav"), "highpass", "300", "lowpass", "3400", "gain", "-n", "-3")
        fx = tmp / f"{lid}_r.wav"
    mp3 = tmp / f"{lid}.mp3"
    sh("ffmpeg", "-y", "-i", str(fx), "-ac", "1", "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "160k", str(mp3))
    dur = len(read(fx)) / SR
    return base64.b64encode(mp3.read_bytes()).decode(), dur


def build_part(part):
    seed, lines = PARTS[part]
    rng = np.random.default_rng(seed)
    data = {}
    with tempfile.TemporaryDirectory() as d:
        for lid, voice, rate, chain, text in lines:
            b64, dur = build(Path(d), lid, voice, rate, chain, text, rng)
            data[lid] = {"dur": round(dur, 3), "mp3": b64}
            print(f"part {part} {lid:8s} {dur:5.2f}s  {text}")
    out = ROOT / "animatic" / "vo" / f"part-{part:02d}.js"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("// Generated by tools/build_vo.py. Do not edit by hand.\nwindow.VO_DATA = " + json.dumps(data) + ";\n")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


def main():
    for part in [int(a) for a in sys.argv[1:]] or sorted(PARTS):
        build_part(part)


if __name__ == "__main__":
    main()
