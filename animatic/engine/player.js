"use strict";
// Playback, scrubbing, toggles and the shot list. Load after core.js and the part's shots file.
// ---------------------------------------------------------------------------
// Transport + UI
// ---------------------------------------------------------------------------
let playhead = 0, playing = false, wall0 = 0, head0 = 0;
const $ = id => document.getElementById(id);
const playBtn = $("play"), scrub = $("scrub"), timeEl = $("time"), headEl = $("head"), overlay = $("overlay");

const track = $("track"), list = $("shots");
SHOTS.forEach((s, i) => {
  const bar = document.createElement("i"); bar.style.width = `${(s.b - s.a) / DUR * 100}%`; bar.title = `SH${s.n} ${s.name}`; track.appendChild(bar);
  const li = document.createElement("li");
  li.innerHTML = `<div class="tc">SH${s.n} · ${tc(s.a)}–${tc(s.b)}</div><div class="nm"></div><div class="ds"></div>`;
  li.querySelector(".nm").textContent = s.name; li.querySelector(".ds").textContent = s.desc;
  li.addEventListener("click", () => seek(s.a + 0.001));
  list.appendChild(li);
});

function now() { return playing ? Math.min(DUR, head0 + (performance.now() - wall0) / 1000) : playhead; }

function play() {
  initAudio(); if (ac.state === "suspended") ac.resume();
  if (playhead >= DUR - 0.01) playhead = 0;
  overlay.hidden = true;
  if (opts.mark) setOpt("mark", false);
  playing = true; head0 = playhead; wall0 = performance.now();
  startAudio(playhead); startVO(playhead);
  playBtn.textContent = "❚❚ Pause";
}
function pause() {
  playhead = now(); playing = false; stopAudio(); stopVO();
  playBtn.textContent = "▶ Play";
}
function seek(t) {
  const was = playing; if (was) pause();
  playhead = clamp(t, 0, DUR); overlay.hidden = true;
  if (opts.mark) setOpt("mark", false);
  if (was) play(); else draw();
}

let lastShot = null;
function draw() {
  const t = now();
  if (opts.mark) {
    if (opts.vert) { g.fillStyle = "#0d0f13"; g.fillRect(0, 0, cv.width, cv.height); g.save(); g.setTransform(1080 / W, 0, 0, 1080 / W, 0, (1920 - H * 1080 / W) / 2); }
    drawMarkCompare();
    if (opts.vert) g.restore();
  }
  else {
    const s = renderShot(Math.min(t, DUR - 0.0001));
    if (opts.subs) drawSubs(t);
    if (opts.burn) drawBurn(t, s);
  }
  const s = shotAt(Math.min(t, DUR - 0.0001));
  if (s !== lastShot) {
    [...list.children].forEach((li, i) => li.classList.toggle("on", SHOTS[i] === s));
    [...track.children].forEach((el, i) => el.classList.toggle("on", SHOTS[i] === s));
    lastShot = s;
  }
  scrub.value = t; headEl.style.left = `calc(${t / DUR * 100}% - 1px)`;
  timeEl.textContent = `${tc(t)} / 01:00`;
}

function loop() {
  if (playing) {
    if (now() >= DUR) { playhead = DUR; pause(); }
    draw();
  }
  requestAnimationFrame(loop);
}

function setOpt(key, val) {
  opts[key] = val;
  const id = { subs: "tSubs", burn: "tBurn", vo: "tVO", mute: "tMute", mark: "tMark", vert: "tVert" }[key];
  $(id).setAttribute("aria-pressed", String(val));
  if (key === "mute") { if (val) stopAudio(); else if (playing) startAudio(now()); }
  if (key === "vo") { if (playing) { startAudio(now()); startVO(now()); } else stopVO(); }
  if (key === "mark" && val && playing) pause();
  if (key === "vert") { cv.width = val ? 1080 : W; cv.height = val ? 1920 : H; $("stage").classList.toggle("vert", val); }
  draw();
}

playBtn.addEventListener("click", () => playing ? pause() : play());
overlay.addEventListener("click", play);
scrub.addEventListener("input", () => seek(parseFloat(scrub.value)));
$("tSubs").addEventListener("click", () => setOpt("subs", !opts.subs));
$("tBurn").addEventListener("click", () => setOpt("burn", !opts.burn));
$("tVO").addEventListener("click", () => setOpt("vo", !opts.vo));
$("tMute").addEventListener("click", () => setOpt("mute", !opts.mute));
$("tMark").addEventListener("click", () => { overlay.hidden = true; setOpt("mark", !opts.mark); });
$("tVert").addEventListener("click", () => setOpt("vert", !opts.vert));
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT" && e.key !== " ") return;
  if (e.key === " ") { e.preventDefault(); playing ? pause() : play(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); seek(now() + (e.shiftKey ? 1 / FPS : 1)); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); seek(now() - (e.shiftKey ? 1 / FPS : 1)); }
  else if (e.key === "Home") { e.preventDefault(); seek(0); }
});

// Deep link: #t=53 opens at that time (handy for review notes); #vert opens in 9:16
const m = location.hash.match(/t=([\d.]+)/);
if (m) { playhead = clamp(parseFloat(m[1]), 0, DUR); overlay.hidden = true; }
if (/vert/.test(location.hash)) setOpt("vert", true);
draw();
requestAnimationFrame(loop);

// Hook for headless frame checks
window.__animatic = { renderAt(t) { overlay.hidden = true; playhead = t; draw(); }, SHOTS, MARK, setOpt };
