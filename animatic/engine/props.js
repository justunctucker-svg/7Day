"use strict";
// Props and sets shared by Parts 2 onward: walkie, flashlight, paper, closet, floorboards, end card.

const NIGHT_PLANKS = ["#151b2d", "#121829", "#171e31", "#131a2b"];

function nightWall() {
  planks(0, 560, NIGHT_PLANKS, "#0a0e1a");
  g.fillStyle = "#0a0e1a"; g.fillRect(0, 0, W, 30);
  g.fillStyle = "#101626"; g.fillRect(0, 560, W, 160);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let i = 1; i < 8; i++) { const y = 560 + i * i * 2.6 + i * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// The walkie's LED runs on the heartbeat clock; it goes solid while Ward transmits.
const ledAt = t => voiceActive(t) ? 1 : heartbeat(t);

function walkie(x, y, s, o = {}) {
  const led = o.led ?? 0, buzz = o.talk ? Math.sin(o.t * 90) * 0.8 : 0;
  g.save(); g.translate(x + buzz, y); g.scale(s, s); if (o.rot) g.rotate(o.rot);
  g.fillStyle = "#2a2e33"; rrect(14, -122, 9, 50, 3);
  g.fillStyle = "#1f2226"; rrect(-32, -76, 64, 134, 10);
  g.fillStyle = "#2c3136"; rrect(-26, -90, 14, 16, 3);
  g.fillStyle = "#33383e"; rrect(-26, -66, 52, 54, 6);
  g.fillStyle = "#15171a"; for (let i = 0; i < 6; i++) g.fillRect(-20, -60 + i * 8, 40, 3);
  g.fillStyle = "#3a4046"; rrect(-37, -40, 6, 34, 2);
  g.fillStyle = "#2c3136"; rrect(-22, 2, 44, 34, 4);
  g.fillStyle = "#4a5056"; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) rrect(-18 + c * 13, 7 + r * 14, 10, 9, 2);
  g.fillStyle = `rgba(${o.red ? "255,90,80" : "170,255,230"},${0.25 + 0.75 * led})`; circle(6, -82, 4.5);
  glow(6, -82, 46, o.red ? "rgba(255,60,50,1)" : TEAL, 0.6 * led);
  g.restore();
}

// Forearm outline from drawForearm(), for clipping the wrap to the arm
function forearmPath() {
  g.beginPath(); g.moveTo(-40, 282); g.bezierCurveTo(300, 270, 700, 318, 1040, 330);
  g.lineTo(1040, 455); g.bezierCurveTo(700, 452, 300, 488, -40, 498); g.closePath();
}

// Flashlight pool: darkness everywhere except a warm circle
function flashlight(cx, cy, r) {
  const gr = g.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.7, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,.96)");
  g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3);
  glow(cx, cy, r * 0.6, "rgba(255,225,170,1)", 0.12);
}

function paper(x, y, w, h, rot = 0) {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
  g.fillStyle = "#ece6d6"; g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
}

function typed(text, x, y, size, color = "#2a2622", weight = 700) {
  g.fillStyle = color; g.font = `${weight} ${size}px "Courier New", ui-monospace, monospace`; g.textBaseline = "alphabetic"; g.fillText(text, x, y);
}

function redStamp(text, x, y, size, rot, p) {
  if (p <= 0) return;
  const k = lerp(1.5, 1, ease(seg(p, 0, 0.5)));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = seg(p, 0, 0.2) * 0.9;
  g.font = `900 ${size}px "Courier New", ui-monospace, monospace`; g.textAlign = "center"; g.textBaseline = "middle";
  const w = g.measureText(text).width + size * 0.8;
  g.strokeStyle = "#b8231b"; g.lineWidth = size * 0.12; g.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  g.fillStyle = "#b8231b"; g.fillText(text, 0, 2);
  g.restore();
}

function shelfBg() {
  g.fillStyle = "#1a120c"; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 46) { g.fillStyle = y % 92 ? "#2a1c12" : "#24180f"; g.fillRect(0, y, W, 44); }
}

function floorboards(off) {
  g.fillStyle = "#1c130c"; g.fillRect(0, 0, W, H);
  for (let i = -2; i < 12; i++) {
    const y = i * 80 - (off % 80);
    g.fillStyle = (i + Math.floor(off / 80)) % 2 ? "#3a2818" : "#33231a"; g.fillRect(0, y + 4, W, 74);
  }
}

// ECU: a teal eye seen through the gap in the closet floorboards (Part 2 end, Part 3 open)
function eyeInGap(t, open) {
    floorboards(70);
    g.fillStyle = "#020203"; g.fillRect(0, 300, W, 120);
    const hb = heartbeat(t);
    // almond: two arcs meeting in points, lids close to a line on the blink
    const eyeShape = (rx, ry) => { g.beginPath(); g.moveTo(640 - rx, 360); g.quadraticCurveTo(640, 360 - ry * 2, 640 + rx, 360); g.quadraticCurveTo(640, 360 + ry * 2, 640 - rx, 360); g.closePath(); };
    g.save(); eyeShape(230, Math.max(1, 52 * open)); g.clip();
    g.fillStyle = "#9fae9f"; g.fillRect(400, 240, 480, 240);
    g.strokeStyle = "rgba(150,40,40,.55)"; g.lineWidth = 2;
    for (const [x0, y0, x1, y1] of [[430, 352, 560, 362], [450, 372, 560, 366], [850, 350, 720, 360], [830, 374, 720, 366], [470, 340, 540, 356]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 + 8, x1, y1); g.stroke(); }
    const gr = g.createRadialGradient(640, 360, 6, 640, 360, 64); gr.addColorStop(0, "#e8fff6"); gr.addColorStop(0.45, "#5fe3c0"); gr.addColorStop(1, "#164a3e");
    g.fillStyle = gr; circle(640, 360, 64);
    g.fillStyle = "#020203"; ellipse(640, 360, 7, 50);
    g.fillStyle = "rgba(255,255,255,.6)"; circle(662, 342, 6);
    g.restore();
    g.strokeStyle = "#0a0806"; g.lineWidth = 7; eyeShape(232, Math.max(1, 53 * open)); g.stroke();
    glow(640, 360, 300, TEAL, (0.2 + 0.4 * hb) * open);
    flashlight(640, 360, 560);
}

// --- from Part 2: front wall, dresser, cornfield rows, boarded window
function dresser(x, y) {
  g.fillStyle = "#2a2228"; g.fillRect(x + 8, y - 12, 12, 12); g.fillRect(x + 180, y - 12, 12, 12);
  g.fillStyle = "#3a2c30"; g.fillRect(x, y - 196, 200, 186);
  g.fillStyle = "#2c2024"; g.fillRect(x - 6, y - 204, 212, 12);
  g.strokeStyle = "#221a1e"; g.lineWidth = 5;
  for (let i = 0; i < 3; i++) g.strokeRect(x + 12, y - 184 + i * 58, 176, 48);
  g.fillStyle = "#7a6a58"; for (let i = 0; i < 3; i++) { circle(x + 60, y - 160 + i * 58, 5); circle(x + 140, y - 160 + i * 58, 5); }
}

// Living-room wall with the front door (peephole, knob, moonlight strip under it)
function frontWall(t, o = {}) {
  nightWall();
  g.fillStyle = "#0b0f1c"; g.fillRect(866, 150, 208, 412);
  g.fillStyle = "#2a2230"; g.fillRect(876, 160, 188, 402);
  g.strokeStyle = "#1c1622"; g.lineWidth = 8; g.strokeRect(898, 190, 144, 140); g.strokeRect(898, 350, 144, 180);
  g.fillStyle = "#6a6258"; circle(1046, 372, 9);
  g.fillStyle = "#000"; circle(970, 250, 4);
  g.fillStyle = "rgba(170,190,240,.35)"; g.fillRect(876, 557, 188, 5);
  // coat on a hook
  g.fillStyle = "#3a3026"; g.fillRect(740, 210, 8, 12);
  g.fillStyle = "#2a2c3a"; g.beginPath(); g.moveTo(744, 218); g.lineTo(706, 250); g.lineTo(716, 400); g.lineTo(774, 400); g.lineTo(784, 250); g.closePath(); g.fill();
  if (o.dresser != null) dresser(o.dresser, 562);
  if (o.daniel) person(o.daniel[0], 640, 1.55, { pose: "walk", phase: o.daniel[1], facing: 1, coat: "#3b475a" });
  fill("#0b1530", 0.25, "multiply");
}

function cornRow(y, h, col, t, seed) {
  const r = rng(seed);
  g.strokeStyle = col; g.lineCap = "round";
  for (let x = -40; x < W + 40; x += 9 + r() * 8) {
    const sway = Math.sin(t * 1.3 + x * 0.02) * 4, top = y - h * (0.8 + r() * 0.3);
    g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sway * 0.5, (y + top) / 2, x + sway, top); g.stroke();
    g.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const ly = lerp(y, top, 0.3 + k * 0.22), d = k % 2 ? 1 : -1; g.beginPath(); g.moveTo(x + sway * 0.4, ly); g.quadraticCurveTo(x + d * 14, ly - 6, x + d * 22 + sway, ly + 4); g.stroke(); }
  }
}

function boardedWindow(lt, t, o) {
  nightWall();
  const X = 440, Y = 140, WW = 400, WH = 330;
  g.save(); g.beginPath(); g.rect(X, Y, WW, WH); g.clip();
  g.fillStyle = vgrad(Y, Y + WH, ["#1c2a4f", "#2a3a64"]); g.fillRect(X, Y, WW, WH);
  glow(X + 300, Y + 80, 220, "rgba(150,170,230,1)", 0.25);
  for (const [fx, fs] of (o.figures || [])) person(fx, Y + WH + 40, fs, { pose: "hunch", facing: -1, coat: "#05070d", skin: "#05070d", hair: "#05070d", eyeGlow: true });
  if (o.hand > 0) {
    const hx = 560, hy = 300 + o.hand * 26;
    g.fillStyle = "#06080e"; ellipse(hx, hy, 38, 44);
    [[-26, -58, -0.25], [-9, -70, -0.08], [9, -70, 0.08], [26, -60, 0.22]].forEach(([dx, dy, rot]) => { g.save(); g.translate(hx + dx, hy + dy); g.rotate(rot); rrect(-8, -30, 16, 52, 8); g.restore(); });
    g.save(); g.translate(hx + 44, hy + 2); g.rotate(0.7); rrect(-8, -26, 16, 40, 8); g.restore();
    g.strokeStyle = "rgba(190,205,240,.18)"; g.lineWidth = 3; g.beginPath(); g.ellipse(hx, hy, 40, 46, 0, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
  g.strokeStyle = "#2a3350"; g.lineWidth = 12; g.strokeRect(X, Y, WW, WH);
  g.lineWidth = 7; g.beginPath(); g.moveTo(X + WW / 2, Y); g.lineTo(X + WW / 2, Y + WH); g.moveTo(X, Y + WH / 2); g.lineTo(X + WW, Y + WH / 2); g.stroke();
  curtain(X - 46, Y - 22, 96, WH + 54, false, "#262b40", "rgba(110,40,50,.45)");
  curtain(X + WW - 50, Y - 22, 96, WH + 54, true, "#262b40", "rgba(110,40,50,.45)");
  // boards: [cx, cy, rotation, drop-in progress]
  for (const [cx, cy, rot, p] of (o.boards || [])) {
    if (p <= 0) continue;
    g.save(); g.translate(cx, cy - (1 - ease(p)) * 160); g.rotate(rot + (1 - ease(p)) * 0.4);
    g.fillStyle = "#4a3a2c"; g.fillRect(-250, -24, 500, 48);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-250, -6); g.lineTo(250, -4); g.moveTo(-250, 10); g.lineTo(250, 12); g.stroke();
    g.fillStyle = "#9a9aa0"; for (const nx of [-220, 220]) { circle(nx, -10, 4); circle(nx, 10, 4); }
    g.restore();
  }
  fill("#0b1530", 0.3, "multiply");
}

// --- from Part 3: revolver, rounds, torch and beam, closet wall, Subject 06, gun hands
// Revolver in side profile, barrel pointing +x, origin at the cylinder. open swings the cylinder out.
function revolver(x, y, s, o = {}) {
  const open = o.open || 0;
  g.save(); g.translate(x, y); g.scale(s, s); if (o.rot) g.rotate(o.rot);
  g.fillStyle = "#5a3a22";
  g.beginPath(); g.moveTo(-40, 8); g.lineTo(-18, 8); g.lineTo(-36, 92); g.quadraticCurveTo(-50, 104, -70, 96); g.lineTo(-62, 20); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-56 + i * 4, 32 + i * 14); g.lineTo(-32 + i * 2, 30 + i * 14); g.stroke(); }
  g.fillStyle = "#3a3e44";
  g.beginPath(); g.moveTo(-44, -26); g.lineTo(34, -26); g.lineTo(34, 18); g.lineTo(-18, 18); g.lineTo(-40, 14); g.closePath(); g.fill();
  g.fillStyle = "#43484f"; g.fillRect(30, -24, 120, 18); g.fillRect(30, -6, 80, 8);
  g.fillStyle = "#2a2d32"; g.fillRect(140, -30, 8, 6);
  g.beginPath(); g.moveTo(-44, -24); g.lineTo(-58, -40); g.lineTo(-50, -44); g.lineTo(-34, -26); g.fill();
  g.strokeStyle = "#3a3e44"; g.lineWidth = 5; g.beginPath(); g.arc(-8, 22, 16, 0, Math.PI); g.stroke();
  g.strokeStyle = "#2a2d32"; g.lineWidth = 4; g.beginPath(); g.moveTo(-6, 18); g.quadraticCurveTo(-2, 28, -10, 32); g.stroke();
  if (open > 0) { g.fillStyle = "#111316"; g.fillRect(-24, -24, 52, 38); }
  g.save(); g.translate(-8 * open, 34 * open); g.rotate(-0.3 * open);
  g.fillStyle = "#555b63"; rrect(-26, -28, 54, 44, 8);
  g.fillStyle = "rgba(0,0,0,.35)"; for (const yy of [-18, -6, 6]) g.fillRect(-20, yy, 42, 4);
  g.restore();
  g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(30, -24, 120, 4);
  g.restore();
}

const chamberAt = (i, r, rot = 0) => { const a = i * Math.PI / 3 - Math.PI / 2 + rot; return [Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6]; };

// The cylinder seen end-on: six chambers, brass where a round is seated
function cylinderFace(cx, cy, r, loaded, rot = 0) {
  g.save(); g.translate(cx, cy);
  g.fillStyle = "#2c3036"; circle(0, 0, r * 1.04);
  g.fillStyle = "#4f555d"; circle(0, 0, r);
  g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.arc(0, 0, r * 0.95, Math.PI * 1.1, Math.PI * 1.6); g.lineTo(0, 0); g.fill();
  g.fillStyle = "#3a3f46"; circle(0, 0, r * 0.2); g.fillStyle = "#16181c"; circle(0, 0, r * 0.08);
  for (let i = 0; i < 6; i++) {
    const [x, y] = chamberAt(i, r, rot);
    if (loaded[i]) { g.fillStyle = "#b8903e"; circle(x, y, r * 0.2); g.fillStyle = "#e0c070"; circle(x - r * 0.03, y - r * 0.03, r * 0.15); g.fillStyle = "#8a6a2a"; circle(x, y, r * 0.06); }
    else { g.fillStyle = "#0a0b0d"; circle(x, y, r * 0.2); }
  }
  g.restore();
}

// A round seen from its base (for loading) or from the side (rolling on the floor)
function roundBase(x, y, r) { g.fillStyle = "#b8903e"; circle(x, y, r); g.fillStyle = "#e0c070"; circle(x - r * 0.15, y - r * 0.15, r * 0.75); g.fillStyle = "#8a6a2a"; circle(x, y, r * 0.3); }

function roundSide(x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = "#c9a04a"; g.fillRect(-16, -6, 26, 12); g.fillStyle = "#a8803a"; g.fillRect(-18, -7, 4, 14);
  g.fillStyle = "#8a8a90"; g.beginPath(); g.moveTo(10, -6); g.quadraticCurveTo(22, 0, 10, 6); g.fill();
  g.restore();
}

// Torch lying on the floor; returns where its head points so the beam can follow
function torch(x, y, rot, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = "#2a2c30"; rrect(-70, -14, 110, 28, 6); g.fillStyle = "#3a3d42"; rrect(36, -20, 34, 40, 5);
  g.fillStyle = "#fff4d8"; g.fillRect(68, -16, 4, 32);
  g.restore();
  return [x + Math.cos(rot) * 72 * s, y + Math.sin(rot) * 72 * s];
}

// Lit cone from a point along an angle, then darkness everywhere the cone and pool don't reach
function beam(hx, hy, rot, len = 900, spread = 0.32) {
  const cx = hx + Math.cos(rot) * len * 0.45, cy = hy + Math.sin(rot) * len * 0.45;
  flashlight(cx, cy, len * 0.55);
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.1;
  const gr = g.createRadialGradient(hx, hy, 0, hx, hy, len);
  gr.addColorStop(0, "#fff0d0"); gr.addColorStop(1, "rgba(255,240,208,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(hx, hy);
  g.lineTo(hx + Math.cos(rot - spread) * len, hy + Math.sin(rot - spread) * len);
  g.lineTo(hx + Math.cos(rot + spread) * len, hy + Math.sin(rot + spread) * len);
  g.closePath(); g.fill(); g.restore();
}

function closetWall() {
  g.fillStyle = "#120c08"; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 58) { g.fillStyle = (x / 58) % 2 ? "#22170f" : "#1d140d"; g.fillRect(x, 0, 56, 640); }
  g.fillStyle = "#2a1c12"; g.fillRect(0, 120, W, 14); g.fillRect(0, 300, W, 14);
  g.fillStyle = "#1a120c"; g.fillRect(0, 640, W, 80);
}

// Subject 06: gaunt, grey, teal veins, torn gown, the same mark on its chest. Baseline at y (waist/floor).
function subject06(x, y, s, o = {}) {
  const hb = o.hb ?? 0, va = o.veins ?? 1, tilt = o.tilt || 0, hand = o.hand || 0, reach = o.reach || 0;
  const skin = "#767c75", gown = "#4e5862";
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = "round"; g.lineJoin = "round";
  limb([-58, -270, -80, -180, lerp(-70, -40, reach), lerp(-96, -300, reach)], 16, skin);
  g.fillStyle = gown; g.beginPath(); g.moveTo(-40, -292); g.lineTo(40, -292); g.quadraticCurveTo(66, -284, 64, -250); g.lineTo(78, 0);
  for (let i = 0; i <= 10; i++) g.lineTo(78 - i * 15.6, i % 2 ? -18 : 0);
  g.lineTo(-64, -250); g.quadraticCurveTo(-66, -284, -40, -292);
  g.closePath(); g.fill();
  g.fillStyle = "rgba(40,30,30,.35)"; ellipse(30, -120, 18, 30, 0.3); ellipse(-40, -60, 14, 22);
  g.fillStyle = skin; g.beginPath(); g.moveTo(-28, -284); g.lineTo(28, -284); g.lineTo(0, -226); g.closePath(); g.fill();
  g.fillRect(-12, -314, 24, 36);
  g.save(); g.translate(0, -312); g.rotate(tilt);
  g.fillStyle = skin; ellipse(0, -44, 34, 48);
  g.fillStyle = "#2a2e2c"; ellipse(-13, -48, 10, 8); ellipse(13, -48, 10, 8);
  g.fillStyle = `rgba(175,255,232,${(0.5 + 0.5 * hb) * va})`; circle(-13, -48, 3.2); circle(13, -48, 3.2);
  glow(-13, -48, 16, TEAL, 0.4 * va); glow(13, -48, 16, TEAL, 0.4 * va);
  g.strokeStyle = "#3a3e3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -18); g.lineTo(10, -18); g.stroke();
  g.strokeStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.moveTo(-24, -36); g.quadraticCurveTo(-17, -26, -22, -12); g.moveTo(24, -36); g.quadraticCurveTo(17, -26, 22, -12); g.stroke();
  g.restore();
  const hx = lerp(lerp(72, 118, hand), 44, reach), hy = lerp(lerp(-100, -232, hand), -300, reach);
  limb([58, -270, lerp(86, 130, hand), lerp(-180, -200, hand), hx, hy], 16, skin);
  g.fillStyle = skin; ellipse(hx + 6 * hand, hy - 4, 16, 10 + 4 * hand);
  if (hand > 0.3 || reach > 0.3) for (let i = 0; i < 4; i++) ellipse(hx - 5 + i * 7 + 6, hy - 16 - (i % 2) * 3, 3.5, 9);
  g.fillStyle = "#e8e6de"; g.save(); g.translate(lerp(hx, 118, 0.25), hy + 16); g.rotate(-0.6 * hand); g.fillRect(-11, -4, 22, 8); g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(95,227,192,${va * (0.25 + 0.55 * hb)})`; g.lineWidth = 2;
  const vein = p => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
  vein([0, -250, -14, -270, -10, -300, -16, -330]); vein([0, -250, 18, -268, 40, -276, 60, -268]); vein([0, -250, -20, -262, -46, -272, -60, -262]);
  vein([0, -250, 6, -282, 2, -314]); vein([58, -268, 76, -220, hx - 6, hy + 22]); vein([-58, -268, -76, -210, -72, -150]);
  g.restore();
  g.fillStyle = `rgba(215,255,242,${(0.4 + 0.6 * hb) * Math.max(va, 0.15)})`; circle(0, -250, 3.6);
  glow(0, -250, 30 + 30 * hb, TEAL, va * (0.35 + 0.5 * hb));
  g.restore();
}

// Daniel's hands round the revolver, from behind his shoulder
function gunHands(x, y, s, rot, t, tremble) {
  const j = tremble * Math.sin(t * 41) * 3;
  g.save(); g.translate(x + j, y + j * 0.6);
  g.strokeStyle = "#2c3446"; g.lineCap = "round"; g.lineWidth = 70 * s / 2.4;
  g.beginPath(); g.moveTo(-260, 520); g.lineTo(-40, 60); g.moveTo(-80, 560); g.lineTo(-10, 80); g.stroke();
  revolver(0, 0, s, { rot });
  g.fillStyle = "#b7896a"; ellipse(-60 * s / 2.4, 70 * s / 2.4, 46 * s / 2.4, 40 * s / 2.4, 0.4); ellipse(-20 * s / 2.4, 90 * s / 2.4, 40 * s / 2.4, 34 * s / 2.4, 0.2);
  g.restore();
}

// End card shared by Parts 2+: PATIENT 07 — TO BE CONTINUED
function titleShot(a, b) {
  return { a, b, name: "Title", desc: "PATIENT 07 — TO BE CONTINUED", vover(lt, t) {
    const a = ease(seg(lt, 0.3, 1.1));
    g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#e8e2d0"; g.font = "700 40px \"Courier New\", ui-monospace, monospace";
    g.letterSpacing = "7px"; g.fillText("PATIENT 07", VW / 2 + 3, 340);
    g.font = "400 13px \"Courier New\", ui-monospace, monospace"; g.letterSpacing = "5px"; g.fillStyle = "#8c93a0";
    g.fillText("TO BE CONTINUED", VW / 2 + 2, 384);
    g.restore();
    glow(VW / 2 + 100, 340, 40, TEAL, 0.3 * a * heartbeat(t));
  }, draw(lt, t) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (opts.vert) return;
    const a = ease(seg(lt, 0.3, 1.1));
    g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#e8e2d0"; g.font = "700 64px \"Courier New\", ui-monospace, monospace";
    g.letterSpacing = "14px"; g.fillText("PATIENT 07", 647, 340);
    g.font = "400 20px \"Courier New\", ui-monospace, monospace"; g.letterSpacing = "8px"; g.fillStyle = "#8c93a0";
    g.fillText("TO BE CONTINUED", 644, 410);
    g.restore();
    glow(800, 340, 60, TEAL, 0.3 * a * heartbeat(t));
  } };
}
