"use strict";
// Project Echo 07 animatic engine: drawing, characters, sets, rendering, audio. Shared by every part.
// ---------------------------------------------------------------------------
// Basics
// ---------------------------------------------------------------------------
const cv = document.getElementById("screen");
const g = cv.getContext("2d");
const W = 1280, H = 720, DUR = 60, FPS = 24;
// 9:16 mode: a VW x H window of the 16:9 picture, rendered at 1080x1920
const VW = 405, VS = 1920 / 720;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = t => t * t * (3 - 2 * t);
// Ease between [time, value] keys (used for the 9:16 reframing pans)
function keys(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t < k[i][0]) return lerp(k[i - 1][1], k[i][1], ease(seg(t, k[i - 1][0], k[i][0])));
  return k[k.length - 1][1];
}
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
function circle(x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function ellipse(x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); }
function rrect(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }
function vgrad(y0, y1, stops) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  return gr;
}
function fill(style, alpha = 1, op = "source-over") {
  g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = op;
  g.fillStyle = style; g.fillRect(0, 0, W, H); g.restore();
}
function glow(x, y, r, color, alpha = 1) {
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = alpha;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}

const TEAL = "rgba(95,227,192,1)";

// The radio light and the mark share one heartbeat (lub-dub, ~60 bpm).
function heartbeat(t) {
  const p = ((t % 1) + 1) % 1;
  return Math.exp(-((p / 0.07) ** 2)) + 0.65 * Math.exp(-(((p - 0.27) / 0.07) ** 2));
}

// ---------------------------------------------------------------------------
// The puncture mark. Single source of truth: shots 02, 18 and 20 all call
// drawForearm(), so the mark sits on the same pixel at the same base size.
// ---------------------------------------------------------------------------
const MARK = { x: 692, y: 372, r: 4.5 };

function drawForearm(o) {
  const night = o.grade === "night";
  g.fillStyle = night ? vgrad(0, H, ["#0b1022", "#121a33"]) : vgrad(0, H, ["#2a3346", "#4a4e5c"]);
  g.fillRect(0, 0, W, H);
  // bedsheet folds
  g.strokeStyle = night ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.07)";
  g.lineWidth = 18;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-50, 560 + i * 40); g.bezierCurveTo(400, 520 + i * 50, 800, 640 + i * 20, 1330, 560 + i * 35); g.stroke(); }
  // forearm
  g.fillStyle = vgrad(290, 480, ["#e2b28c", "#c9926c", "#9c6b4e"]);
  g.beginPath();
  g.moveTo(-40, 282);
  g.bezierCurveTo(300, 270, 700, 318, 1040, 330);
  g.lineTo(1040, 455);
  g.bezierCurveTo(700, 452, 300, 488, -40, 498);
  g.closePath(); g.fill();
  // hand
  g.fillStyle = "#d6a27c";
  ellipse(1150, 392, 150, 78, 0.04);
  g.fillStyle = "rgba(0,0,0,.12)";
  for (let i = 0; i < 3; i++) ellipse(1225 + i * 2, 350 + i * 30, 70, 9, 0.1);
  // tendon / vein hints
  g.strokeStyle = "rgba(120,70,60,.18)"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(420, 360); g.bezierCurveTo(600, 350, 800, 370, 1000, 372); g.stroke();
  g.beginPath(); g.moveTo(560, 410); g.bezierCurveTo(700, 400, 850, 416, 1000, 410); g.stroke();
  // the mark: pinprick + faint bruise halo
  g.fillStyle = "rgba(110,50,70,.28)"; circle(MARK.x, MARK.y, MARK.r * 2.6);
  g.fillStyle = "#5a1f2a"; circle(MARK.x, MARK.y, MARK.r);
  // thumb rubbing the mark
  if (o.rub > 0) {
    const dx = Math.sin(o.rubPhase * 14) * 26;
    g.save(); g.globalAlpha = o.rub;
    g.fillStyle = "#d39c76";
    g.beginPath(); g.ellipse(MARK.x + dx, MARK.y - 70, 46, 92, 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e8bfa0"; ellipse(MARK.x + dx - 4, MARK.y - 6, 28, 18, 0.15);
    g.restore();
  }
  // sleeve (cuff edge travels right to cover the mark)
  const cuff = lerp(250, 1060, o.sleeve);
  g.fillStyle = "#3b4a5e";
  g.beginPath(); g.moveTo(-40, 255); g.lineTo(cuff, 300 + (cuff / 1040) * 15); g.lineTo(cuff + 14, 470); g.lineTo(-40, 525); g.closePath(); g.fill();
  g.fillStyle = "#2c384a"; g.fillRect(cuff - 34, 300, 46, 172);
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 4;
  for (let i = 1; i < 5; i++) { const x = cuff - 60 - i * 70; if (x > -40) { g.beginPath(); g.moveTo(x, 300); g.quadraticCurveTo(x + 20, 390, x - 10, 470); g.stroke(); } }
  // lighting grade
  if (night) fill("#16224d", 0.55, "multiply"); else fill("#55678f", 0.35, "multiply");
  // the glow lives under the skin, on top of the grade
  if (o.glow > 0) {
    const r = MARK.r * (1.6 + o.glow * 9 + o.pulse * 16);
    g.save(); g.globalCompositeOperation = "lighter";
    g.strokeStyle = `rgba(95,227,192,${0.35 * o.glow + 0.4 * o.pulse})`; g.lineWidth = 2;
    const veins = [[-1, -0.3], [-0.8, 0.5], [0.9, -0.4], [1, 0.35], [0.1, 1]];
    veins.forEach(([vx, vy], i) => {
      const len = (30 + i * 9) * (o.glow + o.pulse);
      g.beginPath(); g.moveTo(MARK.x, MARK.y);
      g.quadraticCurveTo(MARK.x + vx * len * 0.5 + vy * 8, MARK.y + vy * len * 0.5 - vx * 6, MARK.x + vx * len, MARK.y + vy * len);
      g.stroke();
    });
    g.restore();
    glow(MARK.x, MARK.y, r * 2.2, TEAL, 0.35 + 0.4 * o.glow + 0.5 * o.pulse);
    glow(MARK.x, MARK.y, r, "rgba(210,255,240,1)", 0.5 + 0.5 * o.pulse);
  }
}

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------
function limb(pts, w, c) {
  g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.stroke();
}

// Feet at (x, y). ~180 units tall at s = 1.
function person(x, y, s, o = {}) {
  const pose = o.pose || "stand", ph = o.phase || 0;
  const coat = o.coat || "#34404f", pants = o.pants || "#23272f", skin = o.skin || "#c99572", hair = o.hair || "#2a1d16";
  g.save(); g.translate(x, y); g.scale(s * (o.facing ?? 1), s); if (o.rot) g.rotate(o.rot);
  if (pose === "walk") g.translate(0, -(1 - Math.abs(Math.sin(ph))) * 4);
  g.lineCap = "round"; g.lineJoin = "round";
  let hip = [0, -92], sh = [0, -150], head = [0, -178];
  if (pose === "sit") { hip = [0, -62]; sh = [-4, -122]; head = [-1, -150]; }
  if (pose === "hunch") { hip = [0, -86]; sh = [24, -134]; head = [44, -146]; }
  if (o.pack) { g.fillStyle = "#5b4a36"; rrect(sh[0] - 34, sh[1] - 2, 22, 56, 6); }
  // legs
  if (pose === "walk") {
    const a = Math.sin(ph) * 26;
    limb([0, -92, a * 0.5, -46, a, 0], 15, pants); limb([0, -92, -a * 0.5, -46, -a, 0], 15, pants);
  } else if (pose === "sit") {
    limb([0, -62, 46, -60, 46, 0], 15, pants); limb([0, -62, 40, -58, 40, 0], 15, pants);
  } else if (pose === "hunch") {
    limb([0, -86, -8, -44, -16, 0], 14, pants); limb([0, -86, 12, -46, 18, 0], 14, pants);
  } else {
    limb([0, -92, -6, -46, -8, 0], 15, pants); limb([0, -92, 6, -46, 8, 0], 15, pants);
  }
  const sw = pose === "walk" ? Math.sin(ph) * 0.7 : 0;
  // back arm
  if (pose === "hunch") limb([sh[0], sh[1] + 4, 30, -104, 34, -76], 11, coat);
  else limb([sh[0], sh[1] + 4, -sw * 22, -118, -sw * 40, -88], 11, coat);
  // torso + head
  limb([hip[0], hip[1], sh[0], sh[1]], 32, coat);
  g.fillStyle = skin; circle(head[0], head[1], 18);
  g.fillStyle = hair; g.beginPath(); g.arc(head[0], head[1] - 2, 19, Math.PI * 1.05, Math.PI * 2.05); g.fill();
  if (o.eye !== false) {
    g.fillStyle = o.eyeGlow ? "#9ff5dc" : "#1a1310";
    circle(head[0] + 9, head[1] - 1, o.eyeGlow ? 3 : 2.2);
    if (o.eyeGlow) glow(head[0] + 9, head[1] - 1, 14, TEAL, 0.6);
  }
  // front arm
  let hand = [sw * 40, -88], elbow = [sw * 20, -118];
  if (pose === "sit") { hand = [36, -86]; elbow = [20, -100]; }
  if (pose === "hunch") { hand = [56, -74]; elbow = [44, -104]; }
  if (o.mug != null) { hand = [lerp(30, 24, o.mug), lerp(-104, -168, o.mug)]; elbow = [lerp(24, 40, o.mug), lerp(-118, -128, o.mug)]; }
  if (o.reach != null) { hand = [lerp(30, 62, o.reach), lerp(-104, -116, o.reach)]; elbow = [24, -122]; }
  limb([sh[0], sh[1] + 4, elbow[0], elbow[1], hand[0], hand[1]], 11, coat);
  g.fillStyle = skin; circle(hand[0], hand[1], 6.5);
  if (o.mug != null) { g.fillStyle = "#e9e3d6"; rrect(hand[0] + 2, hand[1] - 14, 15, 18, 3); }
  g.restore();
}

// Close-up face. expr: eye (openness), brow (raise), worry, mouth (open), smile, look
function face(o) {
  const coat = "#34404f", skin = o.skin || "#cf9a74", hair = "#2a1d16";
  g.save(); g.translate(640 + (o.dx || 0), 410 + (o.dy || 0)); g.scale(o.k || 1, o.k || 1);
  g.fillStyle = coat; ellipse(0, 400, 420, 170);
  g.fillStyle = "#b9845f"; g.fillRect(-70, 160, 140, 140);
  g.fillStyle = skin; ellipse(0, 0, 188, 238);
  ellipse(-186, 12, 28, 50); ellipse(186, 12, 28, 50);
  // jaw shadow / stubble
  g.fillStyle = "rgba(60,40,30,.12)"; g.beginPath(); g.ellipse(0, 60, 180, 178, 0, 0.1, Math.PI - 0.1); g.fill();
  // hair
  g.fillStyle = hair;
  g.beginPath(); g.ellipse(0, -150, 200, 112, 0, Math.PI, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-200, -150); g.quadraticCurveTo(-60, -60, 30, -128); g.quadraticCurveTo(110, -80, 200, -150); g.fill();
  const lx = (o.look?.[0] || 0), ly = (o.look?.[1] || 0);
  for (const side of [-1, 1]) {
    const ex = side * 78, ey = -22, open = o.eye ?? 1;
    g.save();
    g.beginPath(); g.ellipse(ex, ey, 42, Math.max(1, 22 * open), 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#efe9e0"; g.fillRect(ex - 50, ey - 50, 100, 100);
    g.fillStyle = "#5a3a22"; circle(ex + lx * 14, ey + ly * 9, 17);
    g.fillStyle = "#120c09"; circle(ex + lx * 14, ey + ly * 9, 7 * (o.pupil || 1));
    g.fillStyle = "#fff"; circle(ex + lx * 14 + 6, ey + ly * 9 - 6, 3.5);
    g.restore();
    g.strokeStyle = "#3a2618"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.ellipse(ex, ey, 44, Math.max(1, 23 * open), 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    const by = ey - 52 - (o.brow || 0) * 18, inner = (o.worry || 0) * 16;
    g.lineWidth = 9; g.beginPath(); g.moveTo(ex - side * 40, by - inner); g.quadraticCurveTo(ex, by - 8 - (o.brow || 0) * 4, ex + side * 42, by + 4); g.stroke();
  }
  g.strokeStyle = "rgba(90,50,35,.5)"; g.lineWidth = 5;
  g.beginPath(); g.moveTo(-8, 20); g.quadraticCurveTo(-28, 72, -2, 80); g.stroke();
  g.strokeStyle = "#7a3f35"; g.lineWidth = 7;
  if ((o.mouth || 0) > 0.05) { g.fillStyle = "#2a1410"; ellipse(0, 128, 22 + o.mouth * 6, 6 + o.mouth * 24); }
  else { g.beginPath(); g.moveTo(-52, 124 - (o.smile || 0) * 6); g.quadraticCurveTo(0, 124 + (o.smile || 0) * 26 - (o.frown || 0) * 14, 52, 124 - (o.smile || 0) * 6); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------------------
// Environment pieces
// ---------------------------------------------------------------------------
const CITY = (() => {
  const r = rng(7), b = [];
  for (let x = 100; x < 640;) {
    const w = 30 + r() * 46, h = 70 + r() * 200;
    const win = []; for (let i = 0; i < 20; i++) win.push([r(), r(), r() > 0.55]);
    b.push({ x, w, h, win, shade: 0.75 + r() * 0.25 }); x += w + 2 + r() * 6;
  }
  return b;
})();

function windowView(t, o) {
  const X = 110, Y = 110, WW = 520, WH = 360, hz = Y + WH - 50;
  g.save(); g.beginPath(); g.rect(X, Y, WW, WH); g.clip();
  g.fillStyle = vgrad(Y, hz, ["#8db7e0", "#d9e6ee", "#f4dfb5"]); g.fillRect(X, Y, WW, WH);
  glow(X + 420, Y + 90, 120, "rgba(255,240,200,1)", 0.6);
  for (const b of CITY) {
    g.fillStyle = `rgba(${86 * b.shade},${100 * b.shade},${122 * b.shade},1)`;
    g.fillRect(b.x, hz - b.h, b.w, b.h);
    g.fillStyle = "rgba(255,236,170,.55)";
    for (const [wx, wy, on] of b.win) if (on) g.fillRect(b.x + 4 + wx * (b.w - 12), hz - b.h + 8 + wy * (b.h - 20), 5, 6);
  }
  // smoke between buildings
  if (o.smoke > 0) {
    for (const [sx, sp] of [[250, 0], [470, 0.4], [370, 0.7]]) {
      for (let i = 0; i < 18; i++) {
        const age = ((t * 0.35 + i / 18 + sp) % 1);
        const rise = age * 240 * o.smoke;
        g.fillStyle = `rgba(70,70,76,${0.45 * (1 - age) * o.smoke})`;
        circle(sx + Math.sin(age * 5 + i) * 18 + age * 60, hz - 60 - rise, 12 + age * 46 * o.smoke);
      }
    }
  }
  // street, cars and people below
  g.fillStyle = "#5d6066"; g.fillRect(X, hz, WW, 34);
  g.fillStyle = "#8c8f94"; g.fillRect(X, hz + 34, WW, 16);
  const cars = [["#b8463c", 70, 0], ["#e8e1cf", -55, 200], ["#3f6ea8", 90, 360], ["#d8b04a", -70, 90]];
  for (const [c, v, off] of cars) {
    const x = X + (((off + t * v) % (WW + 80)) + WW + 80) % (WW + 80) - 40;
    g.fillStyle = c; rrect(x, hz + (v > 0 ? 6 : 18), 34, 11, 3);
  }
  for (let i = 0; i < 6; i++) {
    const x = X + (((i * 97 + t * (i % 2 ? 9 : -7)) % WW) + WW) % WW;
    g.fillStyle = "#2c2f36"; g.fillRect(x, hz + 36, 3, 9); circle(x + 1.5, hz + 35, 2.2);
  }
  g.restore();
  // frame + mullions
  g.strokeStyle = "#e9e1d1"; g.lineWidth = 14; g.strokeRect(X, Y, WW, WH);
  g.lineWidth = 8; g.beginPath(); g.moveTo(X + WW / 2, Y); g.lineTo(X + WW / 2, Y + WH); g.moveTo(X, Y + WH * 0.45); g.lineTo(X + WW, Y + WH * 0.45); g.stroke();
}

function tvScreen(x, y, w, h, t, o) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const k = w / 260;
  if (!o.breaking) {
    g.fillStyle = vgrad(y, y + h, ["#2d5a8c", "#183456"]); g.fillRect(x, y, w, h);
    g.fillStyle = "#c9d6e6"; g.fillRect(x, y + h * 0.66, w, h * 0.06);
    g.fillStyle = "#1a2433"; circle(x + w * 0.5, y + h * 0.36, 16 * k); rrect(x + w * 0.5 - 34 * k, y + h * 0.48, 68 * k, 50 * k, 14 * k);
    g.fillStyle = "#f0f0f0"; g.fillRect(x, y + h * 0.78, w, h * 0.13);
    g.fillStyle = "#183456"; g.font = `bold ${11 * k}px system-ui`; g.textBaseline = "middle";
    g.fillText("ASHFORD MORNING  ·  TRAFFIC CLEAR ON ROUTE 9  ·  SUNNY, HIGH 68°", x + w - ((t * 40 * k) % (w * 2.4)), y + h * 0.845);
    g.fillStyle = "#fff"; g.font = `bold ${10 * k}px system-ui`; g.fillText("CH 7", x + 10 * k, y + 14 * k);
  } else {
    const flash = Math.floor(t * 3) % 2;
    g.fillStyle = vgrad(y, y + h, ["#5a0f12", "#260608"]); g.fillRect(x, y, w, h);
    g.fillStyle = flash ? "#e0362b" : "#b2231b"; g.fillRect(x, y + h * 0.20, w, h * 0.28);
    g.fillStyle = "#fff"; g.font = `900 ${28 * k}px system-ui`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("BREAKING NEWS", x + w / 2, y + h * 0.34);
    g.fillStyle = "#111"; g.fillRect(x, y + h * 0.50, w, h * 0.15);
    g.fillStyle = "#fff"; g.font = `800 ${11.5 * k}px system-ui`;
    g.fillText("ZOMBIE OUTBREAK · DOWNTOWN ASHFORD", x + w / 2, y + h * 0.575);
    g.textAlign = "left";
    g.fillStyle = "#f2d64b"; g.fillRect(x, y + h * 0.78, w, h * 0.13);
    g.fillStyle = "#200"; g.font = `bold ${11 * k}px system-ui`;
    g.fillText("STAY INDOORS — LOCK ALL DOORS — DO NOT APPROACH THE INFECTED — ", x + w - ((t * 55 * k) % (w * 2.6)), y + h * 0.845);
  }
  if (o.static > 0) {
    const r = rng(1 + Math.floor(t * 30));
    g.globalAlpha = o.static;
    for (let i = 0; i < 260; i++) { const v = Math.floor(r() * 255); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x + r() * w, y + r() * h, 4 + r() * 40 * k, 2 * k); }
    g.globalAlpha = 1;
  }
  g.fillStyle = "rgba(0,0,0,.18)"; for (let sy = y; sy < y + h; sy += 3 * k) g.fillRect(x, sy, w, 1);
  g.restore();
}

function apartment(t, o) {
  g.fillStyle = vgrad(0, 560, ["#c7b597", "#ad9a7d"]); g.fillRect(0, 0, W, 560);
  g.fillStyle = vgrad(560, H, ["#6e5a47", "#4e3f32"]); g.fillRect(0, 560, W, 160);
  windowView(t, o);
  // sunlight patch from the window
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16;
  g.fillStyle = "#ffe2a8"; g.beginPath(); g.moveTo(110, 470); g.lineTo(630, 470); g.lineTo(820, 720); g.lineTo(200, 720); g.fill(); g.restore();
  // kitchen counter + coffee maker
  g.fillStyle = "#59473a"; g.fillRect(650, 470, 290, 140);
  g.fillStyle = "#d8d0c2"; g.fillRect(640, 456, 310, 16);
  g.fillStyle = "#2a2a2e"; rrect(680, 388, 54, 70, 5);
  g.fillStyle = "#8fb2c9"; rrect(690, 425, 34, 28, 4);
  if (o.brew) { g.fillStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 3; i++) circle(707 + Math.sin(t * 3 + i) * 5, 410 - ((t * 30 + i * 12) % 36), 4); }
  // TV
  g.fillStyle = "#3a3330"; g.fillRect(990, 470, 220, 18); g.fillRect(1005, 488, 12, 72); g.fillRect(1183, 488, 12, 72);
  g.fillStyle = "#111"; rrect(960, 286, 280, 176, 6);
  tvScreen(970, 296, 260, 156, t, o);
  if (o.breaking) glow(1100, 380, 260, "rgba(220,40,30,1)", 0.12 + 0.06 * (Math.floor(t * 3) % 2));
  person(o.px ?? 860, 642, 1.75, { facing: o.face ?? 1, mug: o.mug, reach: o.reach, coat: "#46546a" });
}

// In 9:16 mode stamps are collected during the shot pass and drawn on top of the crop.
let STAMPS = null;
function stamp(text, lt, so = {}) {
  if (STAMPS) { STAMPS.push([text, lt, so]); return; }
  const small = so.small;
  const k = (small ? 1 : lerp(1.35, 1, ease(seg(lt, 0, 0.14)))) * (so.k || 1);
  const a = small ? seg(lt, 0, 0.3) * (1 - seg(lt, so.out - 0.4, so.out)) : seg(lt, 0, 0.06);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const at = so.at || (small ? [92, 612] : [104, 96]);
  g.translate(at[0], at[1]); g.rotate(-0.035); g.scale(k, k);
  g.font = `700 ${small ? 24 : 40}px "Courier New", ui-monospace, monospace`;
  const tw = g.measureText(text).width, pad = small ? 10 : 14, hh = small ? 38 : 58;
  g.fillStyle = "rgba(10,10,12,.45)"; g.fillRect(-pad, -hh / 2, tw + pad * 2, hh);
  g.strokeStyle = "#e8e2d0"; g.lineWidth = small ? 2 : 3.5; g.strokeRect(-pad, -hh / 2, tw + pad * 2, hh);
  g.fillStyle = "#e8e2d0"; g.textBaseline = "middle"; g.fillText(text, 0, 2);
  // ink wear
  const r = rng(text.length * 31 + 3); g.fillStyle = "rgba(10,10,12,.5)";
  for (let i = 0; i < 40; i++) g.fillRect(-pad + r() * (tw + pad * 2), -hh / 2 + r() * hh, 2 + r() * 3, 1.5);
  g.restore();
}

// Farmhouse living room at night (same house as SH13)
function nightRoom(t, o) {
  planks(0, 560, ["#151b2d", "#121829", "#171e31", "#131a2b"], "#0a0e1a");
  g.fillStyle = "#0a0e1a"; g.fillRect(0, 0, W, 30);
  // moonlit window with curtains
  g.fillStyle = "#1c2a4f"; g.fillRect(150, 110, 260, 280);
  glow(280, 200, 260, "rgba(120,150,220,1)", 0.12);
  g.strokeStyle = "#2a3350"; g.lineWidth = 10; g.strokeRect(150, 110, 260, 280);
  g.beginPath(); g.moveTo(280, 110); g.lineTo(280, 390); g.stroke();
  curtain(108, 88, 84, 334, false, "#262b40", "rgba(110,40,50,.45)");
  curtain(368, 88, 84, 334, true, "#262b40", "rgba(110,40,50,.45)");
  g.save(); g.globalAlpha = 0.08; g.fillStyle = "#9db4ff";
  g.beginPath(); g.moveTo(150, 390); g.lineTo(410, 390); g.lineTo(640, 720); g.lineTo(240, 720); g.fill(); g.restore();
  deerMount(690, 230, 0.8, { plaque: "#1a1622", hide: "#2a2432", light: "#352e3c", dark: "#0b0a10", antler: "#4c4858" });
  g.fillStyle = "#101626"; g.fillRect(0, 560, W, 160);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let i = 1; i < 8; i++) { const y = 560 + i * i * 2.6 + i * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // shelf + radio
  g.fillStyle = "#2a2018"; g.fillRect(900, 300, 280, 14);
  g.fillStyle = "#4a3322"; rrect(960, 222, 150, 80, 8);
  g.fillStyle = "#2c2118"; rrect(972, 234, 84, 56, 4);
  g.fillStyle = "#1a1410"; circle(1084, 262, 12);
  const lit = o.radio ?? 0;
  g.fillStyle = lit > 0.05 ? `rgba(160,255,225,${0.3 + 0.7 * lit})` : "#2a3a35"; circle(1084, 240, 5);
  if (lit > 0.05) glow(1084, 240, 90, TEAL, 0.55 * lit);
  // couch
  g.fillStyle = "#3a2f3b"; rrect(420, 430, 520, 70, 14); rrect(400, 480, 560, 100, 16);
  g.fillStyle = "#2e2530"; rrect(380, 450, 60, 140, 14); rrect(920, 450, 60, 140, 14);
  if (o.daniel === "lie") person(490, 486, 1.0, { rot: -Math.PI / 2, facing: -1, coat: "#3b475a", eye: false });
  if (o.daniel === "sit") person(620 + (o.shift || 0), 560, 1.25, { pose: "sit", coat: "#3b475a", facing: o.faceDir ?? 1 });
  fill("#0b1530", 0.25, "multiply");
}

function door(k, shake, t) {
  g.fillStyle = "#0b0f1d"; g.fillRect(0, 0, W, H);
  g.save(); g.translate(640 + shake * 6, 380); g.scale(k, k);
  g.fillStyle = "#1a1f30"; g.fillRect(-260, -380, 520, 760);
  g.fillStyle = "#3a2c22"; g.fillRect(-200, -340, 400, 680);
  g.strokeStyle = "#2a1f18"; g.lineWidth = 12;
  g.strokeRect(-160, -300, 320, 260); g.strokeRect(-160, -10, 320, 300);
  g.fillStyle = "#8a7a5a"; circle(150, 20, 16);
  g.fillStyle = "#111"; circle(0, -200, 7);
  g.restore();
  // light strip under the door with feet shadows
  const sy = 380 + 340 * k;
  g.save(); g.fillStyle = "rgba(255,220,160,.35)"; g.fillRect(640 - 200 * k, sy, 400 * k, 8 * k);
  g.fillStyle = "rgba(0,0,0,.85)";
  g.fillRect(640 + (-80 + Math.sin(t * 2) * 6) * k, sy, 50 * k, 8 * k); g.fillRect(640 + (20 + Math.sin(t * 2 + 1) * 6) * k, sy, 50 * k, 8 * k);
  g.restore();
}

// ---------------------------------------------------------------------------
// Farmhouse set pieces
// ---------------------------------------------------------------------------
function planks(y0, y1, tones, seam, seed = 21) {
  const r = rng(seed);
  for (let x = 0, i = 0; x < W; x += 58, i++) {
    g.fillStyle = tones[i % tones.length]; g.fillRect(x, y0, 58, y1 - y0);
    g.fillStyle = seam; g.fillRect(x, y0, 3, y1 - y0);
    for (let k = 0; k < 2; k++) if (r() > 0.55) ellipse(x + 14 + r() * 30, y0 + 30 + r() * (y1 - y0 - 60), 3 + r() * 3, 6 + r() * 4);
  }
}

// Gathered gingham curtain; flip mirrors it for the right-hand side of a window
function curtain(x, y, w, h, flip, base, check) {
  g.save();
  if (flip) { g.translate(2 * x + w, 0); g.scale(-1, 1); }
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y);
  g.quadraticCurveTo(x + w * 0.3, y + h * 0.6, x + w * 0.45, y + h); g.lineTo(x, y + h); g.closePath(); g.clip();
  g.fillStyle = base; g.fillRect(x, y, w, h);
  g.fillStyle = check;
  for (let cy = y, row = 0; cy < y + h; cy += 14, row++) for (let cx = x + (row % 2) * 7; cx < x + w; cx += 14) g.fillRect(cx, cy, 7, 7);
  g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 3;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + i * w / 4, y); g.quadraticCurveTo(x + i * w / 6, y + h * 0.6, x + w * 0.3, y + h); g.stroke(); }
  g.restore();
}

function deerMount(x, y, s, c) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = "round";
  g.fillStyle = c.plaque;
  g.beginPath(); g.moveTo(-48, -36); g.lineTo(48, -36); g.lineTo(48, 34); g.quadraticCurveTo(0, 86, -48, 34); g.closePath(); g.fill();
  g.strokeStyle = c.antler; g.lineWidth = 6;
  for (const sd of [-1, 1]) {
    g.beginPath(); g.moveTo(sd * 14, -46); g.quadraticCurveTo(sd * 62, -74, sd * 50, -138); g.stroke();
    for (const [px, py, tx, ty] of [[38, -64, 72, -82], [52, -96, 84, -112], [51, -118, 34, -154], [30, -54, 22, -88]]) {
      g.beginPath(); g.moveTo(sd * px, py); g.lineTo(sd * tx, ty); g.stroke();
    }
  }
  g.fillStyle = c.hide;
  g.beginPath(); g.moveTo(-36, 34); g.quadraticCurveTo(-42, -16, -22, -40); g.lineTo(22, -40); g.quadraticCurveTo(42, -16, 36, 34); g.closePath(); g.fill();
  ellipse(-38, -50, 20, 9, -0.5); ellipse(38, -50, 20, 9, 0.5);
  ellipse(0, -14, 27, 46);
  g.fillStyle = c.light; ellipse(0, 16, 16, 18);
  g.fillStyle = c.dark; ellipse(0, 28, 12, 9); circle(-14, -22, 4.5); circle(14, -22, 4.5);
  g.restore();
}

function fishMount(x, y, s, c) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = c.plaque; ellipse(0, 0, 122, 54);
  g.fillStyle = c.fish;
  g.beginPath(); g.moveTo(-80, 0); g.quadraticCurveTo(-20, -42, 52, -12); g.quadraticCurveTo(72, 0, 52, 12); g.quadraticCurveTo(-20, 38, -80, 0); g.fill();
  g.beginPath(); g.moveTo(-74, 0); g.lineTo(-104, -24); g.lineTo(-96, 0); g.lineTo(-104, 24); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-34, -24); g.lineTo(-12, -44); g.lineTo(18, -24); g.fill();
  g.fillStyle = c.belly; g.beginPath(); g.moveTo(-62, 6); g.quadraticCurveTo(0, 28, 50, 10); g.quadraticCurveTo(0, 18, -62, 6); g.fill();
  g.strokeStyle = c.dark; g.lineWidth = 3; g.beginPath(); g.moveTo(-70, 2); g.lineTo(42, -3); g.stroke();
  g.fillStyle = c.dark; circle(38, -7, 4.5);
  g.beginPath(); g.moveTo(58, -4); g.lineTo(70, -12); g.lineTo(67, 7); g.fill();
  g.fillStyle = c.brass; g.fillRect(-18, 40, 36, 8);
  g.restore();
}

function farmInterior(lt) {
  planks(0, 560, ["#7b4a2b", "#6f4227", "#84502e", "#744629"], "#4a2a17");
  g.fillStyle = "#3a2214"; g.fillRect(0, 0, W, 34); g.fillStyle = "#2c190e"; g.fillRect(0, 34, W, 8);
  g.fillStyle = "#4e2e1b"; g.fillRect(0, 548, W, 14);
  g.fillStyle = vgrad(560, H, ["#5a3720", "#3c2414"]); g.fillRect(0, 562, W, 160);
  g.strokeStyle = "rgba(20,10,5,.45)"; g.lineWidth = 2;
  for (let i = 1; i < 8; i++) { const y = 562 + i * i * 2.6 + i * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // braided rag rug
  ["#8a3b2e", "#c9a86a", "#4f6a7a", "#8a3b2e", "#c9a86a"].forEach((c, i) => { g.fillStyle = c; ellipse(520, 654, 230 - i * 34, 46 - i * 7); });
  // closet, door left ajar
  g.fillStyle = "#2a170c"; g.fillRect(40, 150, 178, 400);
  g.fillStyle = "#8b6a47"; g.fillRect(48, 158, 150, 392);
  g.fillStyle = "#0e0806"; g.fillRect(198, 158, 14, 392);
  g.strokeStyle = "#6c5034"; g.lineWidth = 6; g.strokeRect(66, 178, 114, 150); g.strokeRect(66, 352, 114, 176);
  g.fillStyle = "#c9a85a"; circle(184, 360, 7);
  // trophies
  deerMount(372, 300, 1, { plaque: "#4a2a16", hide: "#8a5a34", light: "#c8a57a", dark: "#1e120b", antler: "#e2d3b4" });
  fishMount(596, 176, 0.92, { plaque: "#4a2a16", fish: "#6f7a3a", belly: "#d8cf96", dark: "#2e3318", brass: "#d9b45a" });
  // shelf: mason jars + oil lantern
  g.fillStyle = "#3e2414"; g.fillRect(430, 318, 290, 12);
  [["#7aa070", 448], ["#e0b060", 482], ["#b84a3a", 516], ["#7aa070", 550]].forEach(([c, x]) => {
    g.fillStyle = "rgba(220,235,225,.5)"; rrect(x, 276, 26, 42, 5);
    g.fillStyle = c; g.fillRect(x + 3, 294, 20, 22);
    g.fillStyle = "#9a8a6a"; g.fillRect(x + 2, 271, 22, 7);
  });
  g.fillStyle = "#2a2a2a"; rrect(640, 262, 40, 56, 6); g.fillRect(652, 252, 16, 10);
  g.fillStyle = "#ffd890"; rrect(648, 276, 24, 30, 8);
  glow(660, 290, 80, "rgba(255,200,120,1)", 0.45);
  // window: white farmhouse trim, sunset over the fields outside
  const X = 760, Y = 140, WW = 300, WH = 320;
  g.save(); g.beginPath(); g.rect(X, Y, WW, WH); g.clip();
  g.fillStyle = vgrad(Y, Y + WH, ["#5a3a6a", "#e07a48", "#f8c46a"]); g.fillRect(X, Y, WW, WH);
  glow(985, 402, 150, "rgba(255,210,130,1)", 0.8); g.fillStyle = "#ffe6a6"; circle(985, 402, 26);
  g.fillStyle = "#b8843c"; g.fillRect(X, 405, WW, 60);
  g.fillStyle = "#2a1a1e"; g.fillRect(796, 370, 62, 36);
  g.beginPath(); g.moveTo(790, 372); g.lineTo(827, 344); g.lineTo(864, 372); g.fill();
  g.fillRect(906, 330, 4, 76);
  for (let i = 0; i < 4; i++) { g.save(); g.translate(908, 330); g.rotate(lt * 1.2 + i * Math.PI / 2); g.fillRect(-2, 0, 4, 26); g.restore(); }
  g.restore();
  g.strokeStyle = "#efe4cc"; g.lineWidth = 12; g.strokeRect(X, Y, WW, WH);
  g.lineWidth = 7; g.beginPath(); g.moveTo(X + WW / 2, Y); g.lineTo(X + WW / 2, Y + WH); g.moveTo(X, Y + WH / 2); g.lineTo(X + WW, Y + WH / 2); g.stroke();
  g.fillStyle = "#e8dcc4"; g.fillRect(X - 16, Y + WH + 4, WW + 32, 12);
  curtain(X - 50, Y - 22, 96, WH + 54, false, "#f2e6d6", "rgba(176,40,34,.7)");
  curtain(X + WW - 46, Y - 22, 96, WH + 54, true, "#f2e6d6", "rgba(176,40,34,.7)");
  g.fillStyle = "#5a3a22"; g.fillRect(X - 62, Y - 30, WW + 124, 9);
  // sunbeam + dust
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16; g.fillStyle = "#ffcf7a";
  g.beginPath(); g.moveTo(760, 140); g.lineTo(1060, 140); g.lineTo(640, 720); g.lineTo(80, 720); g.fill(); g.restore();
  const r = rng(9); g.fillStyle = "rgba(255,230,180,.6)";
  for (let i = 0; i < 40; i++) circle(300 + r() * 700, 200 + ((r() * 500 - lt * 12) % 500), 1.6);
  // rocking chair, facing the window
  g.strokeStyle = "#3a2216"; g.lineCap = "round"; g.lineWidth = 9;
  g.beginPath(); g.moveTo(612, 556); g.lineTo(596, 392); g.moveTo(632, 556); g.lineTo(618, 392); g.stroke();
  g.lineWidth = 6; for (const yy of [420, 452, 484]) { g.beginPath(); g.moveTo(598, yy); g.lineTo(620, yy); g.stroke(); }
  g.lineWidth = 9; g.beginPath(); g.moveTo(624, 572); g.lineTo(616, 650); g.moveTo(716, 572); g.lineTo(726, 650); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(580, 640); g.quadraticCurveTo(670, 676, 768, 640); g.stroke();
  g.fillStyle = "#4a2c18"; g.fillRect(606, 552, 128, 14);
  person(664, 660, 1.9, { pose: "sit", coat: "#46546a", facing: 1 });
}

// Daniel from behind, walking away from camera
function personBack(x, y, s, ph, o = {}) {
  const coat = o.coat || "#2c3446", pants = "#23272f", skin = "#c99572", hair = "#2a1d16";
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, -(1 - Math.abs(Math.sin(ph))) * 4);
  g.lineCap = "round"; g.lineJoin = "round";
  const lift = Math.sin(ph);
  limb([-9, -92, -10, -46, -10, -Math.max(0, lift) * 14], 15, pants);
  limb([9, -92, 10, -46, 10, -Math.max(0, -lift) * 14], 15, pants);
  limb([-24, -144, -30, -116, -30, -88 - Math.max(0, -lift) * 10], 11, coat);
  limb([24, -144, 30, -116, 30, -88 - Math.max(0, lift) * 10], 11, coat);
  g.fillStyle = coat; rrect(-25, -154, 50, 68, 12);
  g.fillStyle = "#5b4a36"; rrect(-18, -148, 36, 48, 7);
  g.fillStyle = "#4a3b2b"; g.fillRect(-18, -128, 36, 4);
  g.fillStyle = skin; g.fillRect(-6, -164, 12, 10);
  g.fillStyle = hair; circle(0, -176, 19);
  g.restore();
}

const wrapf = (x, m) => ((x % m) + m) % m;

function carWreck(x, y) {
  g.save(); g.translate(x, y);
  g.fillStyle = "#7a3a2a"; rrect(-90, -46, 180, 34, 8); rrect(-56, -74, 104, 32, 10);
  g.fillStyle = "#1c2026"; g.fillRect(-46, -68, 40, 22); g.fillRect(2, -68, 38, 22);
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.moveTo(10, -66); g.lineTo(30, -48); g.lineTo(22, -66); g.fill();
  g.fillStyle = "#8e4b36"; g.save(); g.translate(-6, -44); g.rotate(-0.9); g.fillRect(0, 0, 44, 28); g.restore();
  g.fillStyle = "#16181c"; circle(-56, -10, 16); ellipse(56, -4, 18, 9);
  g.restore();
}

function roadSign(x, y) {
  g.fillStyle = "#6c6f75"; g.fillRect(x - 3, y - 130, 6, 130);
  g.fillStyle = "#2f6a3e"; rrect(x - 62, y - 170, 124, 52, 5);
  g.strokeStyle = "#e8eee8"; g.lineWidth = 2; g.strokeRect(x - 58, y - 166, 116, 44);
  g.fillStyle = "#f2f4ef"; g.font = "700 15px system-ui"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("FARM RD 9  →", x, y - 144); g.textAlign = "left";
}

// Side-tracking shot: parallax layers stream past while Ashford falls away behind him
function highwayShot(lt, t) {
  const cam = lt * 240;
  g.save(); g.translate(0, Math.sin(t * 17) * 1.2);
  g.fillStyle = vgrad(0, 470, ["#9db6cc", "#ebe4d2"]); g.fillRect(0, -10, W, 490);
  const ck = lerp(1, 0.7, lt / 3), cx = 330 - cam * 0.05, r = rng(3);
  g.fillStyle = "#7a8190";
  for (let x = -130; x < 130; x += 13) { const h = (24 + r() * 80) * ck; g.fillRect(cx + x * ck, 470 - h, 12 * ck, h); }
  g.fillStyle = "rgba(70,70,76,.45)";
  for (let i = 0; i < 9; i++) circle(cx - 20 * ck + i * 7 * ck, 470 - 100 * ck - i * 28 * ck, (14 + i * 6) * ck);
  g.fillStyle = "#a9a78c"; g.beginPath(); g.moveTo(0, 476);
  for (let x = 0; x <= W; x += 20) { const wx = x + cam * 0.15; g.lineTo(x, 452 - 14 * Math.sin(wx / 160) - 8 * Math.sin(wx / 57)); }
  g.lineTo(W, 476); g.fill();
  for (let i = 0; i < 14; i++) { g.fillStyle = "#6f7354"; ellipse(wrapf(i * 137 - cam * 0.45, 1500) - 100, 474, 34 + (i % 3) * 10, 14); }
  g.fillStyle = vgrad(470, H, ["#c2b48c", "#9e8f68"]); g.fillRect(0, 474, W, 260);
  g.fillStyle = "#8d9096"; g.fillRect(0, 528, W, 6);
  for (let i = 0; i < 18; i++) { g.fillStyle = "#6c6f75"; g.fillRect(wrapf(i * 80 - cam * 0.92, 1440) - 80, 526, 6, 26); }
  g.fillStyle = "#4b4c52"; g.fillRect(0, 552, W, 104);
  g.fillStyle = "#d9d3bf"; g.fillRect(0, 556, W, 3); g.fillRect(0, 650, W, 3);
  g.fillStyle = "#e8d58a"; for (let i = 0; i < 12; i++) g.fillRect(wrapf(i * 140 - cam, 1680) - 140, 602, 70, 4);
  const poles = []; for (let i = 0; i < 4; i++) poles.push(wrapf(i * 420 - cam * 0.98 + 200, 1680) - 200);
  poles.sort((a, b) => a - b);
  g.strokeStyle = "rgba(40,40,44,.7)"; g.lineWidth = 1.5;
  for (let i = 1; i < poles.length; i++) { g.beginPath(); g.moveTo(poles[i - 1] + 34, 224); g.quadraticCurveTo((poles[i - 1] + poles[i]) / 2, 262, poles[i] - 34, 224); g.stroke(); }
  for (const x of poles) { g.fillStyle = "#4a3b2c"; g.fillRect(x - 5, 210, 10, 320); g.fillRect(x - 40, 220, 80, 7); }
  roadSign(820 - cam, 548);
  carWreck(1200 - cam, 556);
  person(600, 640, 1.7, { pose: "walk", phase: t * 8.5, pack: true, coat: "#46546a", facing: 1 });
  g.strokeStyle = "rgba(60,50,30,.8)"; g.lineWidth = 6; g.lineCap = "round";
  for (let i = 0; i < 16; i++) { const x = wrapf(i * 97 - cam * 1.6, 1550) - 120; g.beginPath(); g.moveTo(x, 730); g.lineTo(x + 10, 676 + (i % 3) * 10); g.moveTo(x + 14, 730); g.lineTo(x + 26, 690); g.stroke(); }
  g.restore();
}

// Follow cam from behind: fence posts and wheat come at the camera as he walks to the house
function farmApproach(lt, t) {
  const hz = 430, vpx = 560, F = 290, z = lt * 1.15;
  g.fillStyle = vgrad(0, hz, ["#4b3b6a", "#d9824a", "#f6c46a"]); g.fillRect(0, 0, W, hz);
  glow(860, 420, 260, "rgba(255,200,120,1)", 0.7); g.fillStyle = "#ffe4a0"; circle(860, 420, 44);
  g.fillStyle = vgrad(hz - 4, H, ["#d0a050", "#7a5a2a"]); g.fillRect(0, hz - 4, W, H - hz + 4);
  const k = lerp(0.85, 1.12, ease(lt / 3));
  g.save(); g.translate(vpx, hz + 2); g.scale(k, k); g.fillStyle = "#2a1c22";
  g.fillRect(-70, -70, 140, 70); g.beginPath(); g.moveTo(-84, -68); g.lineTo(0, -122); g.lineTo(84, -68); g.fill();
  g.fillRect(90, -54, 70, 54); g.beginPath(); g.moveTo(84, -52); g.lineTo(125, -86); g.lineTo(166, -52); g.fill();
  g.fillRect(-150, -110, 8, 110); circle(-146, -116, 40);
  g.fillStyle = "#ffcf7a"; g.fillRect(-40, -46, 18, 20); g.fillRect(22, -46, 18, 20);
  g.restore();
  // dirt track to the house
  g.fillStyle = "rgba(140,100,55,.8)";
  g.beginPath(); g.moveTo(vpx - 5, hz); g.lineTo(vpx + 5, hz); g.lineTo(vpx + 0.7 * F, H); g.lineTo(vpx - 0.7 * F, H); g.fill();
  const P = (X, d) => [vpx + X * F / d, hz + F / d];
  const items = [];
  for (let i = 0; i < 14; i++) { const d = 0.6 + wrapf(i * 2 - z, 28); for (const sd of [-1, 1]) items.push({ d, X: sd * 1.5, post: true }); }
  const r = rng(17);
  for (let i = 0; i < 80; i++) { const X = (r() < 0.5 ? -1 : 1) * (1.9 + r() * 7); items.push({ d: 0.6 + wrapf(r() * 28 - z, 28), X, s: r() }); }
  items.sort((a, b) => b.d - a.d);
  for (const sd of [-1, 1]) {
    const tops = items.filter(it => it.post && Math.sign(it.X) === sd).map(it => { const [x, y] = P(it.X, it.d); return [x, y, 0.75 * F / it.d]; });
    g.strokeStyle = "rgba(50,32,18,.8)"; g.lineWidth = 1.5;
    for (const fr of [0.85, 0.45]) { g.beginPath(); tops.forEach(([x, y, h], i) => i ? g.lineTo(x, y - h * fr) : g.moveTo(x, y - h * fr)); g.stroke(); }
  }
  for (const it of items) {
    const [x, y] = P(it.X, it.d), u = F / it.d;
    if (it.post) { g.fillStyle = "#3a2618"; g.fillRect(x - 0.03 * u, y - 0.75 * u, 0.06 * u, 0.75 * u); }
    else {
      g.strokeStyle = it.s > 0.5 ? "#e2b860" : "#b88a3c"; g.lineWidth = Math.max(1, 0.012 * u); g.lineCap = "round";
      for (let b = -1; b <= 1; b++) { g.beginPath(); g.moveTo(x + b * 0.03 * u, y); g.quadraticCurveTo(x + b * 0.05 * u, y - 0.2 * u, x + b * 0.09 * u + Math.sin(t * 2 + it.s * 6) * 0.02 * u, y - 0.36 * u); g.stroke(); }
    }
  }
  // long evening shadow falling back toward the camera
  g.fillStyle = "rgba(40,22,10,.35)";
  g.beginPath(); g.moveTo(588, 700); g.lineTo(612, 700); g.lineTo(650, 760); g.lineTo(560, 760); g.fill();
  personBack(600, 702, 1.45, t * 8);
}


// ---------------------------------------------------------------------------
// Frame rendering
// ---------------------------------------------------------------------------
const grain = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d"), d = x.createImageData(256, 256), r = rng(99);
  for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); return c;
})();

const opts = { subs: true, burn: true, vo: true, mute: false, mark: false, vert: false };
const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];

const vframe = (s, lt) => clamp(typeof s.vx === "function" ? s.vx(lt) : (s.vx ?? 640), VW / 2, W - VW / 2);

function renderShot(t) {
  const s = shotAt(t), lt = t - s.a, vert = opts.vert;
  g.save();
  if (vert) { g.setTransform(VS, 0, 0, VS, -(vframe(s, lt) - VW / 2) * VS, 0); STAMPS = []; }
  s.draw(lt, t);
  g.restore();
  const stamps = STAMPS; STAMPS = null;
  const fw = vert ? VW : W;
  g.save(); if (vert) g.setTransform(VS, 0, 0, VS, 0, 0);
  // vignette + grain
  const v = g.createRadialGradient(fw / 2, 360, vert ? 200 : 300, fw / 2, 360, vert ? 520 : 820);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)");
  g.fillStyle = v; g.fillRect(0, 0, fw, H);
  g.save(); g.globalAlpha = 0.05; g.globalCompositeOperation = "overlay";
  const fr = Math.floor(t * FPS);
  g.translate(-(fr * 37) % 256, -(fr * 91) % 256);
  g.fillStyle = g.createPattern(grain, "repeat"); g.fillRect(0, 0, fw + 256, H + 256);
  g.restore();
  // 9:16 overlays sit inside the platform safe zones (clear of the top bar and the caption/buttons area)
  if (stamps) for (const [text, slt, so] of stamps) stamp(text, slt, { ...so, at: so.small ? [30, 452] : [36, 128], k: so.small ? 0.9 : 0.85 });
  if (vert && s.vover) s.vover(lt, t);
  g.restore();
  return s;
}

function wrapText(text, maxW) {
  const out = []; let line = "";
  for (const w of text.split(" ")) {
    const next = line ? line + " " + w : w;
    if (line && g.measureText(next).width > maxW) { out.push(line); line = w; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

function drawSubs(t) {
  const v = VO.find(v => t >= v.a && t < v.b);
  if (!v) return;
  const a = seg(t, v.a, v.a + 0.15) * (1 - seg(t, v.b - 0.15, v.b)), vert = opts.vert;
  const cx = vert ? VW / 2 : 640, y0 = vert ? 486 : 660, lh = vert ? 25 : 34;
  g.save(); if (vert) g.setTransform(VS, 0, 0, VS, 0, 0);
  g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle";
  const jit = v.radio ? (Math.sin(t * 53) * 1.5) : 0;
  g.font = `italic ${vert ? 19 : 28}px Georgia, serif`;
  const lines = vert ? wrapText(v.text, 340) : [v.text];
  if (vert) { // backing box: vertical frames often put subtitles over bright set pieces
    const bw = Math.max(...lines.map(l => g.measureText(l).width)) + 28;
    g.fillStyle = "rgba(0,0,0,.42)"; rrect(cx - bw / 2, y0 - 40, bw, 54 + (lines.length - 1) * lh, 8);
  }
  g.font = `600 ${vert ? 10 : 13}px system-ui`; g.fillStyle = v.radio ? "#8ff0d4" : "#c9c3b4";
  g.fillText(v.who, cx, y0 - (vert ? 26 : 34));
  g.font = `italic ${vert ? 19 : 28}px Georgia, serif`; g.fillStyle = "#f3efe4";
  g.shadowColor = "rgba(0,0,0,.9)"; g.shadowBlur = 8;
  lines.forEach((l, i) => g.fillText(l, cx + jit, y0 + i * lh));
  g.restore();
}

function tc(t) {
  const fr = Math.round(t * FPS), s = Math.floor(fr / FPS), f = fr % FPS;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

function drawBurn(t, s) {
  g.save(); if (opts.vert) g.setTransform(VS, 0, 0, VS, 0, 0);
  g.font = `${opts.vert ? 9 : 13}px ui-monospace, Menlo, Consolas, monospace`; g.textBaseline = "top";
  const label = `${tc(t)}  SH${s.n}  ${s.name.toUpperCase()}`;
  const w = g.measureText(label).width;
  g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(14, 14, w + 16, 22);
  g.fillStyle = "#cfd6df"; g.fillText(label, 22, 18);
  g.restore();
}

function drawMarkCompare() {
  g.fillStyle = "#0d0f13"; g.fillRect(0, 0, W, H);
  MARK_FRAMES.forEach(({ t, label, draw }, i) => {
    const x = 20 + i * 630, y = 150, sc = 610 / W;
    g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, W * sc, H * sc); g.clip(); g.scale(sc, sc);
    if (draw) draw(); else shotAt(t).draw(t - shotAt(t).a, t);
    g.strokeStyle = "rgba(255,80,80,.9)"; g.lineWidth = 2 / sc;
    g.beginPath(); g.moveTo(MARK.x, 0); g.lineTo(MARK.x, H); g.moveTo(0, MARK.y); g.lineTo(W, MARK.y); g.stroke();
    g.beginPath(); g.arc(MARK.x, MARK.y, 18, 0, Math.PI * 2); g.stroke();
    g.restore();
    g.fillStyle = "#e6e2d8"; g.font = "600 15px system-ui"; g.fillText(label, x, y - 14);
  });
  g.fillStyle = "#8c93a0"; g.font = "14px system-ui";
  g.fillText(`Both shots are drawn by drawForearm() from one MARK constant: x ${MARK.x}, y ${MARK.y}, r ${MARK.r}px. Only the grade and the glow layer differ.`, 20, 560);
  g.fillText(MARK_NOTE, 20, 586);
}

// ---------------------------------------------------------------------------
// Sound (synthesized placeholders, scheduled from the playhead)
// ---------------------------------------------------------------------------
let ac = null, bus = null, noise = null;
function initAudio() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  loadVO(ac).then(() => { if (playing) startVO(now()); });
}
function noiseSrc(when, dur) { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.start(when, Math.random() * 1.5); s.stop(when + dur + 0.05); return s; }
function filt(type, f, q = 1) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function gain(v = 0) { const n = ac.createGain(); n.gain.value = v; return n; }
function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }
// Envelope helper: fade in/out over a bed of `dur` seconds that starts `off` seconds in.
function bedEnv(gn, when, dur, peak, fadeIn = 0.3, fadeOut = 0.3) {
  gn.gain.setValueAtTime(0, when);
  gn.gain.linearRampToValueAtTime(peak, when + Math.min(fadeIn, dur / 2));
  gn.gain.setValueAtTime(peak, when + Math.max(dur - fadeOut, dur / 2));
  gn.gain.linearRampToValueAtTime(0, when + dur);
}
function hit(when, { f = 2000, type = "bandpass", q = 1, dur = 0.05, v = 0.3 } = {}) {
  const gn = gain(); chain(noiseSrc(when, dur), filt(type, f, q), gn, bus);
  gn.gain.setValueAtTime(v, when); gn.gain.exponentialRampToValueAtTime(0.0008, when + dur);
}
function tone(when, { f = 440, f2 = null, type = "sine", dur = 0.2, v = 0.2, atk = 0.005 } = {}) {
  const o = ac.createOscillator(), gn = gain(); o.type = type; o.frequency.setValueAtTime(f, when);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, when + dur);
  chain(o, gn, bus); gn.gain.setValueAtTime(0.0001, when); gn.gain.exponentialRampToValueAtTime(v, when + atk);
  gn.gain.exponentialRampToValueAtTime(0.0001, when + dur); o.start(when); o.stop(when + dur + 0.05);
}

// Each cue: [start, end, play(when, offsetIntoCue, remaining)]
const CUES = [];
const bed = (a, b, f) => CUES.push([a, b, f]);
const at = (t, f) => CUES.push([t, t + 0.01, (w) => f(w)]);


function startAudio(from) {
  if (!ac || opts.mute) return;
  stopAudio();
  bus = gain(0.9); bus.connect(ac.destination);
  const base = ac.currentTime + 0.05;
  // duck the SFX under dialogue
  if (opts.vo) for (const v of VO) {
    if (v.b <= from) continue;
    bus.gain.setTargetAtTime(0.45, base + Math.max(0, v.a - from), 0.06);
    bus.gain.setTargetAtTime(0.9, base + (v.b - from), 0.25);
  }
  for (const [a, b, play] of CUES) {
    if (b <= from) continue;
    const start = Math.max(a, from);
    play(base + (start - from), start - a, b - start);
  }
}
function stopAudio() {
  if (!bus) return;
  const old = bus; bus = null;
  old.gain.setTargetAtTime(0, ac.currentTime, 0.02);
  setTimeout(() => old.disconnect(), 200);
}

// Voice-over clips, on their own bus so "Mute SFX" leaves dialogue alone
const VOBUF = {};
let voBus = null;
async function loadVO(ctx) {
  await Promise.all(Object.entries(window.VO_DATA || {}).map(async ([id, d]) => {
    if (VOBUF[id]) return;
    const bin = Uint8Array.from(atob(d.mp3), c => c.charCodeAt(0));
    VOBUF[id] = await ctx.decodeAudioData(bin.buffer);
  }));
}
function startVO(from) {
  stopVO();
  if (!ac || !opts.vo) return;
  voBus = gain(1); voBus.connect(ac.destination);
  const base = ac.currentTime + 0.05;
  for (const v of VO) {
    const buf = VOBUF[v.id];
    if (!buf || v.a + buf.duration <= from) continue;
    const src = ac.createBufferSource(); src.buffer = buf; src.connect(voBus);
    const start = Math.max(v.a, from);
    src.start(base + (start - from), start - v.a);
  }
}
function stopVO() {
  if (!voBus) return;
  const old = voBus; voBus = null;
  old.gain.setTargetAtTime(0, ac.currentTime, 0.02);
  setTimeout(() => old.disconnect(), 200);
}


const voiceActive = t => VO.some(v => v.radio && t >= v.a && t < v.b);
