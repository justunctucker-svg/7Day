"use strict";
// Part 5 "The Copy": shots, voice cues and sound cues.

// ---------------------------------------------------------------------------
// The clock picks up at Part 4's ending tempo, doubled. After the shot only one
// heart is left and it slows. Subject 08's farmhouse starts again at 60 bpm.
// ---------------------------------------------------------------------------
const SHOT_AT = 40.4, EIGHT_AT = 52.8;
const bpmAt = t => t < SHOT_AT ? 140 : t < EIGHT_AT ? lerp(140, 66, ease(seg(t, SHOT_AT, EIGHT_AT))) : 60;
const CLOCK = makeClock(bpmAt);
heartbeat = CLOCK.heartbeat;
const BEATS = CLOCK.beats(EIGHT_AT);

const BANGS = [12.1, 12.7, 13.2, 15.2, 15.7, 16.1, 16.45, 16.75, 17.05, 17.3, 17.55, 17.8, 18.0];
const sinceBang = t => Math.min(...BANGS.map(b => t >= b ? t - b : 99));
const IMPACTS = [34.1, 35.3, 36.8, 38.2, 39.6];

// ---------------------------------------------------------------------------
// Part 5 set pieces
// ---------------------------------------------------------------------------
// The hatch from inside the bunker: white wall, steel door taking blows
function hatchInside(t, o = {}) {
  const strain = o.strain || 0, sb = sinceBang(t), kick = Math.exp(-sb * 12);
  g.fillStyle = "#b8c0be"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 2;
  for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.save(); g.translate(640 + Math.sin(t * 90) * kick * 6, 380); g.scale(1 + kick * 0.03, 1 + kick * 0.03);
  g.fillStyle = "#2a2e31"; circle(0, 0, 250);
  const gr = g.createRadialGradient(-60, -60, 20, 0, 0, 230); gr.addColorStop(0, "#7a8086"); gr.addColorStop(1, "#3e4448");
  g.fillStyle = gr; circle(0, 0, 228);
  g.fillStyle = `rgba(255,255,255,${0.08 + 0.2 * kick})`; ellipse(-30, -20, 120 * (0.6 + strain * 0.4), 80 * (0.6 + strain * 0.4));
  g.fillStyle = "#24282b"; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; circle(Math.cos(a) * 212, Math.sin(a) * 212, 5); }
  for (let i = 0; i < 3; i++) { g.save(); g.translate(-228, -50 + i * 50); g.rotate((i - 1) * 0.06 * strain + Math.sin(t * 60) * 0.02 * kick); g.fillStyle = "#1f2326"; g.fillRect(-60, -10, 120, 20); g.restore(); }
  if (strain > 0.4) { g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(40, -120); g.lineTo(70, -40); g.lineTo(50, 20); g.lineTo(90, 90); g.stroke(); }
  g.restore();
  const r = rng(Math.floor(t * 4)); g.fillStyle = "rgba(90,85,80,.5)";
  for (let i = 0; i < 24; i++) circle(400 + r() * 480, 120 + ((r() * 500 + sb * 300) % 560), 1.6);
}

// One big monitor: SUBJECT 07's single trace splits into two identical ones
function splitMonitor(lt, t) {
  g.fillStyle = "#0b0f0e"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#04140c"; g.fillRect(80, 60, 1120, 600);
  const split = ease(seg(lt, 0.8, 2.0)), lab = seg(lt, 1.6, 2.2);
  for (const sd of split > 0 ? [-1, 1] : [0]) trace(120, 200 + sd * split * 120, 1040, 300, CLOCK.phaseAt, t, "#a8fff0");
  if (lab <= 0) typed("SUBJECT 07", 120, 120, 34, "#7affc0");
  else { g.save(); g.globalAlpha = lab; typed("SUBJECT 07-A", 120, 120, 34, "#7affc0"); typed("SUBJECT 07-B", 120, 640, 34, "#7affc0"); g.restore(); }
  typed("140 BPM", 960, 120, 30, "#a8fff0");
  if (lab > 0) { g.save(); g.globalAlpha = lab * (0.5 + 0.5 * Math.sin(t * 6)); typed("ORIGINAL: —", 860, 640, 28, "#d0473a"); g.restore(); }
  g.fillStyle = "rgba(255,255,255,.03)"; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
}

function twinForearms(t) {
  const hb = heartbeat(t), o = { grade: "night", glow: 0.75, pulse: 0.8 * hb, rub: 0, sleeve: 0 };
  g.save(); g.beginPath(); g.rect(0, 0, W, 358); g.clip(); g.translate(0, -175); drawForearm(o); g.restore();
  g.save(); g.beginPath(); g.rect(0, 362, W, H); g.clip(); g.translate(W, 175); g.scale(-1, 1); drawForearm(o); g.restore();
  g.fillStyle = "#050707"; g.fillRect(0, 357, W, 6);
}

// Eyes arriving out of the dark at the edges of frame
function darkEyes(t, from, n) {
  const r = rng(71);
  for (let i = 0; i < n; i++) {
    const born = from + r() * 3, side = Math.floor(r() * 4), along = r();
    if (t < born) { r(); continue; }
    const p = ease(seg(t, born, born + 2.5)) * (0.15 + r() * 0.2);
    let x = [along * W, W, along * W, 0][side], y = [0, along * H, H, along * H][side];
    x = lerp(x, 640, p); y = lerp(y, 380, p);
    const a = (0.4 + 0.6 * heartbeat(t)) * seg(t, born, born + 0.2), s = 0.7 + r() * 0.8;
    for (const dx of [-6, 6]) { g.fillStyle = `rgba(175,255,232,${a})`; ellipse(x + dx * s, y, 3 * s, 2 * s); glow(x + dx * s, y, 14 * s, TEAL, 0.4 * a); }
  }
}

function markPoint(x, y, a) {
  glow(x, y, 120, TEAL, 0.35 * a); glow(x, y, 40, "rgba(210,255,240,1)", 0.6 * a);
  g.fillStyle = `rgba(230,255,248,${a})`; circle(x, y, 4);
}

function redRoom(t, flick = 1) {
  bunker(t, [1, 1, 1, 1, 1, 1]);
  fill("#c01a10", 1, "multiply");
  fill("#000", 0.35 + 0.55 * (1 - flick));
  glow(640, 60, 500, "rgba(255,40,30,1)", 0.25 * flick);
}

// Subject 08's farmhouse at dawn: a different house, the same radio
function dawnBedroom(t, lt) {
  planks(0, 560, ["#8a8290", "#80788a", "#908898", "#847c8e"], "#5a5262", 33);
  g.fillStyle = "#6a6070"; g.fillRect(0, 548, W, 14);
  g.fillStyle = vgrad(560, H, ["#6a5a58", "#4a3e3c"]); g.fillRect(0, 562, W, 160);
  g.fillStyle = vgrad(140, 440, ["#f4c6a8", "#e8a8a0", "#b8a8c8"]); g.fillRect(180, 140, 260, 300);
  glow(310, 400, 260, "rgba(255,210,170,1)", 0.4);
  g.strokeStyle = "#efe4cc"; g.lineWidth = 10; g.strokeRect(180, 140, 260, 300); g.beginPath(); g.moveTo(310, 140); g.lineTo(310, 440); g.stroke();
  curtain(136, 118, 84, 354, false, "#e8e0d0", "rgba(80,110,160,.45)"); curtain(400, 118, 84, 354, true, "#e8e0d0", "rgba(80,110,160,.45)");
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.1; g.fillStyle = "#ffd8b0";
  g.beginPath(); g.moveTo(180, 440); g.lineTo(440, 440); g.lineTo(760, 720); g.lineTo(300, 720); g.fill(); g.restore();
  // bed and Subject 08 sitting up
  g.fillStyle = "#e8e2d6"; rrect(440, 470, 300, 110, 12); g.fillStyle = "#7a8aa8"; rrect(430, 520, 330, 90, 14);
  g.fillStyle = "#4a3a30"; g.fillRect(430, 600, 12, 60); g.fillRect(748, 600, 12, 60);
  person(560, 600, 1.35, { pose: "sit", coat: "#c8c0b8", pants: "#7a8aa8", hair: "#6a3a22", facing: 1 });
  g.fillStyle = "#6a3a22"; ellipse(558, 380, 16, 34);
  // nightstand + the old radio, light blinking on the 60 bpm clock
  g.fillStyle = "#5a4636"; g.fillRect(770, 500, 140, 100); g.fillRect(780, 600, 10, 60); g.fillRect(890, 600, 10, 60);
  g.fillStyle = "#4a3322"; rrect(780, 430, 120, 70, 8); g.fillStyle = "#2c2118"; rrect(790, 440, 66, 50, 4);
  g.fillStyle = "#1a1410"; circle(878, 466, 10);
  const hb = heartbeat(t);
  g.fillStyle = `rgba(160,255,225,${0.3 + 0.7 * hb})`; circle(878, 446, 5); glow(878, 446, 80, TEAL, 0.5 * hb);
  fill("#3f4a7e", 0.18, "multiply");
}

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
const tubesOut = t => [0, 1, 2, 3, 4, 5].map(i => t < 27.1 + (5 - i) * 0.25);

const SHOTS = [
  { a: 0, b: 2.2, name: "Thaw", desc: "Part 4's last frame, barrel to barrel. The freeze thaws; the barrels tremble.", draw(lt, t) {
    mirrorTwoShot(t, Math.sin(t * 40) * 2 * seg(lt, 0.5, 1.2), { smile: lerp(0.25, 0.45, seg(lt, 1, 2)) });
    g.save(); g.globalCompositeOperation = "saturation"; g.globalAlpha = 1 - seg(lt, 0.2, 0.7); g.fillStyle = "#808080"; g.fillRect(0, 0, W, H); g.restore();
  } },
  { a: 2.2, b: 5, name: "The copy", desc: "CU the double. Ward, in the room: \"Go on. One of us is the copy.\"", draw(lt, t) {
    g.fillStyle = "#0e1416"; g.fillRect(0, 0, W, H);
    const talk = voiceActive(t) ? 0.12 + 0.15 * Math.abs(Math.sin(t * 17)) : 0;
    face({ eye: 1, smile: talk ? 0 : 0.4, mouth: talk, look: [0, 0], k: 1.3, dy: opts.vert ? -70 : 40, iris: "#5fe3c0", irisGlow: 0.35 + 0.35 * heartbeat(t) });
    fill("#0e2a2a", 0.25, "multiply");
  } },
  { a: 5, b: 6.4, name: "Flick", desc: "ECU Daniel's eyes flick to the monitor wall.", draw(lt, t) {
    g.fillStyle = "#0e1416"; g.fillRect(0, 0, W, H);
    face({ eye: 1.15, brow: 0.6, worry: 0.8, look: [lerp(0, 0.95, ease(seg(lt, 0.4, 0.6))), -0.2], k: 1.9, dy: 230 });
    fill("#0e2a2a", 0.3, "multiply");
  } },
  { a: 6.4, b: 12, name: "07-A / 07-B", desc: "The 07 trace splits into two identical lines. Neither is the original.", draw(lt, t) {
    const z = 1 + lt * 0.015; g.save(); g.translate(640, 360); g.scale(z, z); g.translate(-640, -360);
    splitMonitor(lt, t); g.restore();
  } },
  { a: 12, b: 13.4, name: "BANG", desc: "The hatch behind them buckles inward.", draw(lt, t) { hatchInside(t, { strain: 0.2 }); } },
  { a: 13.4, b: 15, name: "Eyes to the hatch", desc: "Both men glance at the hatch. Neither gun moves.", draw(lt, t) {
    mirrorTwoShot(t, Math.sin(t * 40) * 2, { look: [-0.9, -0.1], look2: [-0.9, -0.1], smile: 0.2 });
  } },
  { a: 15, b: 18, name: "Straining", desc: "Faster blows; the bolts bend; the steel cracks.", draw(lt, t) { hatchInside(t, { strain: lerp(0.3, 1, lt / 3) }); } },
  { a: 18, b: 21, name: "Two marks", desc: "Both forearms, stacked: two identical marks pulsing in unison.", mark: true, draw(lt, t) { twinForearms(t); } },
  { a: 21, b: 24.8, name: "Only one", desc: "CU the double, head tilted toward the hatch. Ward: \"They follow the mark. Only one of us walks out.\"", draw(lt, t) {
    g.fillStyle = "#0e1416"; g.fillRect(0, 0, W, H);
    const talk = voiceActive(t) ? 0.12 + 0.15 * Math.abs(Math.sin(t * 17)) : 0, tilt = ease(seg(lt, 0.2, 1.0)) * -0.12;
    g.save(); g.translate(640, 420); g.rotate(tilt); g.translate(-640, -420);
    face({ eye: 1, mouth: talk, smile: talk ? 0 : 0.3, look: [-0.6, 0], k: 1.3, dy: opts.vert ? -70 : 40, iris: "#5fe3c0", irisGlow: 0.35 + 0.35 * heartbeat(t) });
    g.restore();
    fill("#0e2a2a", 0.25, "multiply");
  } },
  { a: 24.8, b: 26, name: "Resolve", desc: "CU Daniel. His grip tightens.", draw(lt, t) {
    g.fillStyle = "#0e1416"; g.fillRect(0, 0, W, H);
    face({ eye: 0.95, brow: -0.2, worry: 0.3, frown: 0.8, look: [0.4, 0], k: 1.3, dx: Math.sin(t * 33) * 2, dy: opts.vert ? -70 : 40 });
    fill("#0e2a2a", 0.3, "multiply");
  } },
  { a: 26, b: 27, name: "Breach", desc: "The hatch blows in.", draw(lt, t) {
    const p = ease(seg(lt, 0, 0.5));
    g.fillStyle = "#b8c0be"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#050404"; circle(640, 380, 250);
    g.save(); g.translate(640 + p * 200, 380 + p * 120); g.rotate(p * 1.4); g.scale(1 + p * 2.5, 1 + p * 2.5);
    g.fillStyle = "#4e5458"; circle(0, 0, 228); g.restore();
    const r = rng(5); g.fillStyle = "#30302e";
    for (let i = 0; i < 30; i++) { const a = r() * Math.PI * 2, d = p * (300 + r() * 600); g.fillRect(640 + Math.cos(a) * d, 380 + Math.sin(a) * d, 8 + r() * 14, 4 + r() * 8); }
    fill("#fff", Math.max(0, 0.6 - lt * 2), "lighter");
  } },
  { a: 27, b: 29, name: "Blackout", desc: "The fluorescent tubes burst one by one, racing toward camera. Black.", draw(lt, t) {
    const on = tubesOut(t);
    bunker(t, on);
    for (let i = 0; i < 6; i++) { const s = 27.1 + (5 - i) * 0.25; if (t >= s && t < s + 0.15) { const [x, y] = P3(0, -1.18, 1.6 + i * 2); glow(x, y, 400 / (1.6 + i * 2) * 2, "rgba(255,250,230,1)", 0.9); } }
    fill("#000", ease(seg(lt, 1.2, 2.0)));
  } },
  { a: 29, b: 32, name: "They pour in", desc: "Black. Teal eyes flood in from every edge.", draw(lt, t) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    darkEyes(t, 29, 70);
  } },
  { a: 32, b: SHOT_AT, name: "Two lights", desc: "Only the two marks are visible: grappling, circling, crossing. You can't tell which is which.", draw(lt, t) {
    const sh = Math.min(...IMPACTS.map(m => t >= m ? t - m : 9)), kick = Math.exp(-sh * 10);
    g.save(); g.translate(Math.sin(t * 50) * kick * 10, Math.cos(t * 43) * kick * 6);
    g.fillStyle = "#000"; g.fillRect(-20, -20, W + 40, H + 40);
    darkEyes(t, 29, 90);
    const amp = 1 - 0.85 * ease(seg(lt, 6.5, 8.4)), u = lt;
    const ax = 640 + 230 * amp * Math.sin(u * 1.1), ay = 400 + 90 * amp * Math.sin(u * 2.3 + 0.5);
    const bx = 640 - 230 * amp * Math.sin(u * 1.1 + 0.25), by = 400 - 90 * amp * Math.sin(u * 2.3 + 0.9);
    const a = 0.55 + 0.45 * heartbeat(t);
    markPoint(ax, ay, a); markPoint(bx, by, a);
    if (kick > 0.05) glow((ax + bx) / 2, (ay + by) / 2, 90, "rgba(255,255,255,1)", 0.4 * kick);
    g.restore();
  } },
  { a: SHOT_AT, b: 41.6, name: "The shot", desc: "One white frame. Ringing.", draw(lt) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (lt < 0.12) fill("#fffdf4");
    else glow(640, 400, 700, "rgba(255,250,235,1)", 0.25 * Math.exp(-(lt - 0.12) * 5));
  } },
  { a: 41.6, b: 44, name: "One standing", vx: 600, desc: "Red emergency light. One Daniel down; one standing over him, the gun smoking.", draw(lt, t) {
    const flick = lt < 0.6 ? (Math.floor(lt * 14) % 3 ? 1 : 0) : 1;
    redRoom(t, flick);
    person(720, 640, 1.5, { rot: -Math.PI / 2, facing: -1, coat: "#140606", pants: "#140606", skin: "#2a0a08", hair: "#140606", eye: false });
    person(520, 760, 2.8, { coat: "#120404", pants: "#120404", skin: "#120404", hair: "#120404", eye: false });
    g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(220,180,170,.12)"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); for (let k = 0; k < 14; k++) { const x = 600 + Math.sin(k * 0.6 + t) * (4 + k), y = 520 - k * 16; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
  } },
  { a: 44, b: 47.6, name: "They bow", desc: "The infected fill the doorway, stop, and bow their heads in unison.", draw(lt, t) {
    redRoom(t, 1);
    fill("#000", 0.2);
    g.fillStyle = "#060202"; circle(640, 380, 250);
    const bow = ease(seg(t, 45.0, 45.6)), dip = heartbeat(t) * 3;
    g.save(); g.beginPath(); g.arc(640, 380, 248, 0, Math.PI * 2); g.clip();
    for (let row = 0; row < 3; row++) for (let i = -4; i <= 4; i++) {
      const sc = [0.6, 0.85, 1.15][row], x = 640 + i * 70 * sc + (row % 2) * 30, y = 330 + row * 70;
      g.fillStyle = "#1a0606"; ellipse(x, y + 60 * sc, 52 * sc, 40 * sc);
      const hy = y + (bow * 22 + dip) * sc;
      ellipse(x, hy, 28 * sc, 36 * sc);
      if (bow < 0.6) for (const dx of [-9, 9]) { g.fillStyle = `rgba(175,255,232,${0.7 * (1 - bow)})`; circle(x + dx * sc, hy - 4 * sc, 2.6 * sc); }
    }
    g.restore();
    g.strokeStyle = "#2a0a08"; g.lineWidth = 26; g.beginPath(); g.arc(640, 380, 262, 0, Math.PI * 2); g.stroke();
  } },
  { a: 47.6, b: 50, name: "Channel 08", vx: 560, desc: "CU the console dial: CH 07 clicks over to CH 08.", draw(lt, t) {
    g.fillStyle = "#1a0606"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#2a1010"; rrect(240, 160, 800, 400, 20);
    g.fillStyle = "#050202"; rrect(300, 220, 380, 160, 10);
    const ch = t >= 49.0 ? "08" : "07", flick = t >= 48.95 && t < 49.1;
    if (!flick) typed(`CH ${ch}`, 330, 330, 96, "#ff6a5a");
    typed("TX · LIVE", 330, 365, 22, "#ff6a5a");
    const ang = lerp(0, 0.9, ease(seg(t, 48.55, 49.0)));
    g.save(); g.translate(860, 300); g.rotate(ang);
    g.fillStyle = "#3a3236"; circle(0, 0, 90); g.fillStyle = "#1a1416"; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; circle(Math.cos(a) * 86, Math.sin(a) * 86, 4); }
    g.fillStyle = "#ff6a5a"; g.fillRect(-4, -80, 8, 30); g.restore();
    g.fillStyle = "#3a1410"; ellipse(940, 330, 70, 50, 0.4); ellipse(900, 380, 28, 16);
    fill("#ff3020", 0.15, "lighter");
  } },
  { a: 50, b: EIGHT_AT, name: "Eight", desc: "CU the survivor in red light, eyes in shadow. Ward: \"Eight... can you hear me?\"", draw(lt, t) {
    g.fillStyle = "#1a0404"; g.fillRect(0, 0, W, H);
    const talk = voiceActive(t) ? 0.1 + 0.12 * Math.abs(Math.sin(t * 15)) : 0, dy = opts.vert ? -70 : 40;
    face({ eye: 1, mouth: talk, look: [0, 0], k: 1.3, dy });
    g.fillStyle = vgrad(250 + dy, 470 + dy, ["rgba(0,0,0,0)", "rgba(0,0,0,.92)", "rgba(0,0,0,.92)", "rgba(0,0,0,0)"]); g.fillRect(0, 250 + dy, W, 220);
    const hy = opts.vert ? -110 : 0;
    g.strokeStyle = "#111"; g.lineWidth = 16; g.beginPath(); g.arc(640, 210 + hy, 270, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.fillStyle = "#111"; ellipse(388, 400 + hy, 30, 52); ellipse(892, 400 + hy, 30, 52);
    g.strokeStyle = "#111"; g.lineWidth = 6; g.beginPath(); g.moveTo(400, 430 + hy); g.quadraticCurveTo(460, 580 + hy, 560, 560 + hy); g.stroke();
    fill("#d02010", 1, "multiply"); fill("#000", 0.2);
  } },
  { a: EIGHT_AT, b: 55, name: "Day one, again", desc: "Smash cut. Dawn, another farmhouse: a woman's eye opens, green iris. Part 1's first shot.", draw(lt) {
    eyeOpen(lt + 0.4, { iris: ["#6a9a52", "#1f3a1a"], grade: "#9a8ab8", gradeA: 0.3 });
  } },
  { a: 55, b: 56.2, name: "Her mark", vx: MARK.x, desc: "CU her forearm, Part 1's framing: a tiny fresh puncture mark.", mark: true, draw(lt) {
    drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: 0, sleeve: 0, skin: ["#f0d4bc", "#dcb294", "#b88a6c"] });
  } },
  { a: 56.2, b: 58.8, name: "The broadcast", vx: 680, desc: "Her bedroom at dawn. The radio's light blinks. Ward, filtered: \"...don't leave the farmhouse.\"", draw(lt, t) {
    dawnBedroom(t, lt);
    stamp("DAY ONE", lt - 0.2, { small: true, out: 2.4, vat: [30, 575] });
  } },
  titleShot(58.8, 60, "PATIENT 08"),
];
SHOTS.forEach((s, i) => s.n = String(i + 1).padStart(2, "0"));

// Ward only: three lines in the room, then the broadcast. Clips from vo/part-05.js (tools/build_vo.py).
const VO = [
  { id: "ward1", a: 2.4, who: "WARD", text: "Go on. One of us is the copy." },
  { id: "ward2", a: 21.2, who: "WARD", text: "They follow the mark. Only one of us walks out." },
  { id: "ward3", a: 50.3, who: "WARD", text: "Eight... can you hear me?" },
  { id: "ward4", a: 56.5, who: "WARD (V.O., radio)", text: "...don't leave the farmhouse.", radio: true },
];
VO.forEach(v => { v.b = v.a + (window.VO_DATA?.[v.id]?.dur ?? 2.5) + 0.2; });

const MARK_FRAMES = [
  { label: "PART 1 · SH02 · DANIEL'S PLANT", draw: () => drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: 0, sleeve: 0 }) },
  { t: 55.5, label: "PART 5 · SH21 · 00:55:12 · SUBJECT 08" },
];
const MARK_NOTE = "Subject 08's mark sits exactly where Daniel's did: same framing, same spot, new arm.";

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
bed(0, EIGHT_AT, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 220), gn, bus); bedEnv(gn, w, dur, 0.04, 0.3, 0.01); });
// the heartbeat: doubled and racing, then one, slowing
for (const b of BEATS) {
  const both = b < SHOT_AT, hush = VO.some(v => b >= v.a - 0.05 && b < v.b) ? 0.35 : 1;
  const v = (both ? 0.24 : lerp(0.22, 0.12, seg(b, SHOT_AT, EIGHT_AT))) * hush, dub = CLOCK.periodAt(b) * 0.27;
  at(b, w => { tone(w, { f: 62, dur: 0.16, v }); if (both) tone(w, { f: 66, dur: 0.16, v: v * 0.8 }); });
  at(b + dub, w => { tone(w, { f: 55, dur: 0.14, v: v * 0.65 }); if (both) tone(w, { f: 59, dur: 0.14, v: v * 0.5 }); });
}
// doubled monitor beeps under the split
for (const b of BEATS) if (b >= 6.4 && b < 12) at(b, w => { tone(w, { f: 1320, dur: 0.06, v: 0.04 }); tone(w + 0.012, { f: 1320, dur: 0.06, v: 0.04 }); });
// the hatch: blows, strain, breach
for (const b of BANGS) at(b, w => { tone(w, { f: 85, f2: 45, dur: 0.35, v: 0.6 }); [700, 1150].forEach(f => tone(w, { f, dur: 0.25, v: 0.04, type: "triangle" })); hit(w, { f: 600, type: "lowpass", dur: 0.2, v: 0.4 }); });
bed(15, 18.2, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.type = "sawtooth"; o.frequency.setValueAtTime(70 + off * 10, w); o.frequency.linearRampToValueAtTime(110, w + dur); chain(o, filt("lowpass", 500), gn, bus); bedEnv(gn, w, dur, 0.04, 0.3, 0.1); o.start(w); o.stop(w + dur); });
at(26.0, w => { tone(w, { f: 55, f2: 25, dur: 1.2, v: 0.6 }); hit(w, { f: 1200, type: "lowpass", dur: 0.8, v: 0.5 }); hit(w, { f: 3000, type: "highpass", dur: 0.5, v: 0.25 }); });
// tubes popping toward camera, then the shrieks
for (let i = 5; i >= 0; i--) at(27.1 + (5 - i) * 0.25, w => { hit(w, { f: 5000, type: "highpass", dur: 0.06, v: 0.35 }); [2600, 3400].forEach((f, k) => tone(w + k * 0.03, { f, dur: 0.2, v: 0.03, type: "triangle" })); });
for (const s of [28.6, 29.1, 29.8, 30.4, 31.1, 31.8, 33.0, 35.0, 37.2]) bed(s, s + 0.8, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.06);
  lfo.frequency.value = 21; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("bandpass", 1300, 3), gn, bus); bedEnv(gn, w, dur, 0.09, 0.05, 0.4);
});
// the struggle in the dark
bed(32, SHOT_AT, breathing(0.6, 0.08, 1000));
for (const m of IMPACTS) at(m, w => { tone(w, { f: 110, f2: 55, dur: 0.2, v: 0.4 }); hit(w, { f: 900, type: "lowpass", dur: 0.12, v: 0.3 }); });
for (const s of [33.4, 36.2, 38.9]) at(s, w => hit(w, { f: 3600, q: 4, dur: 0.12, v: 0.12 }));
// the shot, the ringing, the red room
at(SHOT_AT, w => { hit(w, { f: 6000, type: "highpass", dur: 0.12, v: 0.36 }); hit(w, { f: 1500, type: "lowpass", dur: 0.6, v: 0.32 }); tone(w, { f: 60, f2: 30, dur: 0.9, v: 0.32 }); });
bed(40.5, 45, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.frequency.value = 4100; chain(o, gn, bus); gn.gain.setValueAtTime(lerp(0.05, 0, off / 4.5), w); gn.gain.linearRampToValueAtTime(0, w + dur); o.start(w); o.stop(w + dur); });
bed(41.6, 50, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.type = "sawtooth"; o.frequency.value = 100; chain(o, filt("bandpass", 200, 3), gn, bus); bedEnv(gn, w, dur, 0.025, 0.1, 0.2); o.start(w); o.stop(w + dur); });
for (let s = 42.2; s < 50; s += 1.4) at(s, w => tone(w, { f: 440, f2: 400, dur: 0.6, v: 0.03 }));
at(45.0, w => hit(w, { f: 400, type: "lowpass", dur: 0.8, v: 0.15 }));
// the dial, the open channel
for (let i = 0; i < 5; i++) at(48.6 + i * 0.09, w => hit(w, { f: 4200, q: 6, dur: 0.02, v: 0.2 }));
bed(49.0, EIGHT_AT, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2600, 0.8), gn, bus); bedEnv(gn, w, dur, 0.025, 0.1, 0.05); });
// day one, again: Part 1's morning (clock, breathing, birds), the radio crackling
for (let s = EIGHT_AT + 0.2; s < 58.8; s += 1) at(s, w => hit(w, { f: 3500, q: 4, dur: 0.035, v: 0.22 }));
bed(EIGHT_AT, 56.2, breathing(2.6, 0.05, 700));
for (const s of [55.3, 56.0, 57.4, 58.2]) at(s, w => { for (let k = 0; k < 3; k++) tone(w + k * 0.09, { f: 3200 + k * 300, f2: 4600, dur: 0.07, v: 0.03 }); });
bed(56.2, 58.8, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2400, 0.7), gn, bus); bedEnv(gn, w, dur, 0.05, 0.15, 0.2); });
// one heartbeat at 60 bpm under the title: the clock has reset
at(59.2, w => { tone(w, { f: 62, dur: 0.18, v: 0.3 }); tone(w + 0.27, { f: 55, dur: 0.16, v: 0.2 }); });
