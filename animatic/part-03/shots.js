"use strict";
// Part 3 "Subject 06": shots, voice cues and sound cues.

// ---------------------------------------------------------------------------
// Part 3 props
// ---------------------------------------------------------------------------
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

function ammoCarton(x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = "#8a2a22"; g.fillRect(-60, -36, 120, 72);
  g.fillStyle = "#e6dcc4"; g.fillRect(-52, -14, 104, 28);
  typed("CARTRIDGES · 6", -46, 6, 12, "#3a1a14");
  g.restore();
}

function tagProp(x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = "#cfc2a0"; g.lineWidth = 2; g.beginPath(); g.moveTo(-70, 0); g.quadraticCurveTo(-110, -30, -150, -10); g.stroke();
  g.fillStyle = "#d8c49a"; g.beginPath(); g.moveTo(-60, -34); g.lineTo(60, -34); g.lineTo(60, 34); g.lineTo(-60, 34); g.lineTo(-76, 18); g.lineTo(-76, -18); g.closePath(); g.fill();
  g.fillStyle = "#bfa878"; circle(-58, 0, 8); g.fillStyle = "#2a2018"; circle(-58, 0, 4);
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

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
const LOADS = [16.5, 17.25, null, 20.9];   // seat times; the third round slips at 18.4
const loadedAt = t => [t >= LOADS[0], t >= LOADS[1], t >= LOADS[3], false, false, false];
const DOUBLE = [25.2, 46.4];                // two marks pulsing together

const SHOTS = [
  { a: 0, b: 1.2, name: "The eye", desc: "ECU through the floorboard gap, as Part 2 ended. Daniel jerks back.", draw(lt, t) {
    const jolt = seg(lt, 0.7, 0.85), k = 1 - 0.12 * ease(seg(lt, 0.7, 1.2));
    g.save(); g.translate(640 + Math.sin(lt * 80) * 10 * jolt * (1 - seg(lt, 0.85, 1.1)), 360); g.scale(k, k); g.translate(-640, -360);
    eyeInGap(t, 1); g.restore();
  } },
  { a: 1.2, b: 3.6, name: "Flashlight drop", vx: lt => lerp(520, 780, 1 - Math.exp(-lt * 1.6)) + 90, desc: "Top-down. The torch hits the boards and rolls, its beam spinning across the walls.", draw(lt) {
    floorboards(70);
    const roll = 7 * (1 - Math.exp(-lt * 1.4)), x = lerp(520, 780, 1 - Math.exp(-lt * 1.6)), y = 420 + Math.sin(lt * 9) * 6 * Math.exp(-lt * 2);
    const [hx, hy] = torch(x, y, roll + 0.4, 1.6);
    beam(hx, hy, roll + 0.4, 820);
    g.fillStyle = "#020203"; g.globalAlpha = 0.6; g.fillRect(0, 300, W, 120); g.globalAlpha = 1;
  } },
  { a: 3.6, b: 4.6, name: "Scramble", desc: "CU Daniel in the passing beam, scrambling back.", draw(lt, t) {
    g.fillStyle = "#050608"; g.fillRect(0, 0, W, H);
    face({ eye: 1.4, brow: 1, worry: 0.9, mouth: 0.5, pupil: 0.6, look: [0.6, 0.6], k: 1.3, dx: lerp(0, -80, ease(lt)), dy: 30 });
    const sweep = Math.max(0, Math.sin(lt * 9));
    fill("#000", 0.75 - 0.55 * sweep);
    glow(lerp(200, 1100, (lt * 1.5) % 1), 380, 420, "rgba(255,225,170,1)", 0.25 * sweep);
  } },
  { a: 4.6, b: 7.6, name: "Fingers", desc: "Grey fingers push up through the gap and pry at the board.", draw(lt, t) {
    const lift = ease(seg(lt, 1.6, 2.8)) * 18 + Math.sin(t * 30) * 2 * seg(lt, 1.6, 3);
    floorboards(70);
    g.fillStyle = "#020203"; g.fillRect(0, 300, W, 120);
    g.save(); g.translate(0, -lift); g.fillStyle = "#3a2818"; g.fillRect(0, 230, W, 74); g.fillStyle = "rgba(255,240,210,.12)"; g.fillRect(0, 300, W, 4); g.restore();
    for (let i = 0; i < 4; i++) {
      const len = ease(seg(lt, 0.3 + i * 0.12, 1.4 + i * 0.12)) * (70 + (i % 2) * 14), x = 560 + i * 34, wig = Math.sin(t * 6 + i) * 4;
      if (len <= 0) continue;
      g.save(); g.translate(x + wig, 330); g.rotate(-0.08 + i * 0.05);
      g.fillStyle = "#7d837c"; rrect(-11, -len, 22, len + 30, 10);
      g.fillStyle = "#3a3e3a"; ellipse(0, -len + 7, 7, 6);
      g.strokeStyle = "rgba(95,227,192,.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-3, 26); g.lineTo(2, -len * 0.5); g.stroke();
      g.restore();
    }
    flashlight(640 + Math.sin(t * 3) * 80, 330, 360);
  } },
  { a: 7.6, b: 8.6, name: "Box tips", vx: 700, desc: "He hits the shelves. A steel box tips off the top shelf.", draw(lt, t) {
    shelfBg();
    const tip = ease(seg(lt, 0.05, 0.5)) * 1.7, fall = seg(lt, 0.45, 1.0) ** 2 * 700;
    g.save(); g.translate(780, 300 + fall); g.rotate(tip);
    g.fillStyle = "#4a5a4e"; g.fillRect(-180, -110, 180, 110);
    g.fillStyle = "#3a4840"; g.fillRect(-180, -110, 180, 20); g.fillStyle = "#9a9a90"; g.fillRect(-100, -96, 20, 14);
    g.restore();
    g.fillStyle = "#3a2a1c"; g.fillRect(0, 300, W, 16);
    flashlight(700 + Math.sin(t * 5) * 60, 300, 420);
  } },
  { a: 8.6, b: 10, name: "Box bursts", desc: "It crashes open: an oilcloth bundle, a carton of rounds, a paper tag.", draw(lt, t) {
    floorboards(70);
    g.fillStyle = "#020203"; g.fillRect(0, 300, W, 30);
    const bounce = Math.abs(Math.sin(lt * 10)) * Math.exp(-lt * 6), sp = ease(seg(lt, 0.05, 0.8));
    g.save(); g.translate(660, 470 - bounce * 40); g.rotate(0.2);
    g.fillStyle = "#4a5a4e"; g.fillRect(-120, -70, 240, 140); g.fillStyle = "#1a201c"; g.fillRect(-110, -60, 220, 120); g.restore();
    g.save(); g.translate(lerp(660, 900, sp), lerp(450, 180, sp)); g.rotate(sp * 2.4);
    g.fillStyle = "#3a4840"; g.fillRect(-120, -14, 240, 28); g.restore();
    g.save(); g.translate(lerp(660, 520, sp), lerp(470, 520, sp)); g.rotate(-0.3 * sp);
    g.fillStyle = "#4a4a2c"; rrect(-120, -40, 240, 80, 20); g.restore();
    ammoCarton(lerp(660, 820, sp), lerp(470, 560, sp), 0.9, 0.5 * sp);
    tagProp(lerp(660, 690, sp), lerp(470, 600, sp), 0.8, -0.4 * sp);
    for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(160,150,130,${0.3 * (1 - sp)})`; circle(660 + Math.cos(i) * 160 * sp, 470 + Math.sin(i * 1.7) * 90 * sp, 18 * sp + 4); }
    const settle = ease(seg(lt, 0, 1.2));
    flashlight(lerp(900, 650, settle), lerp(300, 500, settle), 420);
  } },
  { a: 10, b: 12, name: "The tag", vx: 668, desc: "CU, handwritten: FOR 07. ONLY IF IT COMES UP. — W.", draw(lt, t) {
    floorboards(70);
    tagProp(680, 380, 4.2, -0.06);
    g.save(); g.translate(680, 380); g.rotate(-0.06);
    g.fillStyle = "#2a2018"; g.font = "italic 700 34px Georgia, serif"; g.textBaseline = "middle";
    g.fillText("For 07.", -190, -76);
    g.font = "italic 30px Georgia, serif"; g.fillText("Only if it comes up.", -190, -10);
    g.font = "italic 700 34px Georgia, serif"; g.fillText("— W.", 110, 76);
    g.restore();
    flashlight(660, 400, 470);
  } },
  { a: 12, b: 14, name: "Unwrap", desc: "His hands peel back the oilcloth: a revolver.", draw(lt) {
    floorboards(70);
    revolver(640, 400, 1.7, { rot: -0.08 });
    const p = ease(seg(lt, 0.2, 1.5));
    g.fillStyle = "#4a4a2c";
    g.beginPath(); g.moveTo(640 - p * 330, 250); g.lineTo(650 - p * 300, 250); g.lineTo(640 - p * 290, 560); g.lineTo(340 - p * 120, 560); g.lineTo(360 - p * 140, 250); g.fill();
    g.beginPath(); g.moveTo(640 + p * 330 - 10, 250); g.lineTo(920 + p * 140, 250); g.lineTo(940 + p * 120, 560); g.lineTo(640 + p * 290, 560); g.closePath(); g.fill();
    g.fillStyle = "#b7896a"; ellipse(400 - p * 200, 300, 44, 34, -0.4); ellipse(880 + p * 200, 300, 44, 34, 0.4);
    flashlight(640, 410, 460);
  } },
  { a: 14, b: 16, name: "Empty", vx: 680, desc: "He swings the cylinder out. Empty.", draw(lt) {
    g.fillStyle = "#0a0806"; g.fillRect(0, 0, W, H);
    revolver(600, 360, 2.6, { open: ease(seg(lt, 0.2, 0.6)), rot: 0.05 });
    g.fillStyle = "#b7896a"; ellipse(420, 520, 90, 70, 0.4); ellipse(560, 470 + ease(seg(lt, 0.2, 0.6)) * 30, 34, 22, -0.3);
    flashlight(620, 380, 520);
  } },
  { a: 16, b: 19.2, name: "Loading", desc: "Insert, cylinder end-on: one round, two. The third slips from his fingers.", draw(lt, t) {
    g.fillStyle = "#0a0806"; g.fillRect(0, 0, W, H);
    const r = 210, cx = 640, cy = 360;
    cylinderFace(cx, cy, r, loadedAt(t));
    for (const [i, ti] of [[0, LOADS[0]], [1, LOADS[1]]]) {
      const p = seg(t, ti - 0.45, ti); if (p <= 0 || p >= 1) continue;
      const [x, y] = chamberAt(i, r); const e = ease(p);
      roundBase(lerp(cx + 420, cx + x, e), lerp(cy + 300, cy + y, e), r * 0.2);
      g.fillStyle = "#b7896a"; ellipse(lerp(cx + 470, cx + x + 50, e), lerp(cy + 340, cy + y + 40, e), 50, 34, -0.5);
    }
    const s3 = seg(t, 17.9, 18.35), slip = seg(t, 18.35, 18.9);
    if (s3 > 0 && slip < 1) {
      const [x, y] = chamberAt(2, r);
      const px = lerp(cx + 420, cx + x + 30, ease(s3)) + slip * 260, py = lerp(cy + 300, cy + y + 20, ease(s3)) + slip * slip * 520;
      roundBase(px, py, r * 0.2 * (1 - slip * 0.3));
      if (slip < 0.3) { g.fillStyle = "#b7896a"; ellipse(px + 50, py + 40, 50, 34, -0.5); }
    }
    g.save(); g.translate(Math.sin(t * 37) * 2, 0); flashlight(640, 360, 560); g.restore();
  } },
  { a: 19.2, b: 20.4, name: "Lost round", desc: "Top-down. The round rolls across the boards and drops into the gap.", draw(lt) {
    floorboards(70);
    g.fillStyle = "#020203"; g.fillRect(0, 300, W, 120);
    const p = seg(lt, 0, 0.75), drop = seg(lt, 0.75, 1.05);
    if (drop < 1) roundSide(lerp(380, 640, ease(p)), lerp(560, 360, p) + drop * 30, 2.2 * (1 - drop * 0.7), p * 9);
    flashlight(lerp(420, 640, ease(p)), 430, 380);
  } },
  { a: 20.4, b: 21.5, name: "Fourth round", desc: "Cylinder end-on. Another round goes in: three loaded.", draw(lt, t) {
    g.fillStyle = "#0a0806"; g.fillRect(0, 0, W, H);
    const r = 210, cx = 640, cy = 360;
    cylinderFace(cx, cy, r, loadedAt(t));
    const p = seg(t, LOADS[3] - 0.45, LOADS[3]);
    if (p > 0 && p < 1) { const [x, y] = chamberAt(2, r), e = ease(p); roundBase(lerp(cx + 420, cx + x, e), lerp(cy + 300, cy + y, e), r * 0.2); g.fillStyle = "#b7896a"; ellipse(lerp(cx + 470, cx + x + 50, e), lerp(cy + 340, cy + y + 40, e), 50, 34, -0.5); }
    flashlight(640, 360, 560);
  } },
  { a: 21.5, b: 23.9, name: "Snap shut", vx: 680, desc: "He snaps the cylinder home. Ward: \"You found it. Good.\"", draw(lt, t) {
    g.fillStyle = "#0a0806"; g.fillRect(0, 0, W, H);
    const close = ease(seg(lt, 0.05, 0.2));
    g.save(); g.translate(0, Math.exp(-Math.max(0, lt - 0.2) * 25) * 6 * (lt > 0.2 ? 1 : 0));
    revolver(600, 360, 2.6, { open: 1 - close, rot: 0.05 });
    g.fillStyle = "#b7896a"; ellipse(420, 520, 90, 70, 0.4);
    g.restore();
    walkie(1080, 640, 0.9, { led: ledAt(t), talk: voiceActive(t), t, rot: 0.3 });
    flashlight(700, 400, 560);
  } },
  { a: 23.9, b: 25.2, name: "Board bursts", desc: "The board explodes upward out of the floor.", draw(lt, t) {
    const shake = Math.exp(-lt * 6) * 8;
    g.save(); g.translate(Math.sin(t * 70) * shake, Math.cos(t * 63) * shake);
    floorboards(70);
    g.fillStyle = "#020203"; g.fillRect(0, 230, W, 190);
    const p = ease(seg(lt, 0, 0.6));
    g.save(); g.translate(640, 270 - p * 300); g.rotate(p * 0.8); g.scale(1 + p * 1.5, 1 + p * 1.5);
    g.fillStyle = "#3a2818"; g.fillRect(-420, -37, 840, 74); g.restore();
    const r = rng(8);
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = p * (200 + r() * 500); g.fillStyle = "#5a3e26"; g.save(); g.translate(640 + Math.cos(a) * d, 320 + Math.sin(a) * d * 0.6); g.rotate(a + p * 4); g.fillRect(-14, -3, 28, 6); g.restore(); }
    for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(150,140,120,${0.35 * (1 - seg(lt, 0.3, 1.3))})`; circle(640 + (r() - 0.5) * 700 * p, 320 + (r() - 0.5) * 300 * p, 30 + 60 * p); }
    g.restore();
    flashlight(640, 400, 520);
  } },
  { a: 25.2, b: 28.6, name: "It rises", desc: "Subject 06 climbs out of the hole into the beam. Its chest mark pulses with his.", draw(lt, t) {
    closetWall();
    g.fillStyle = "#000"; ellipse(640, 660, 300, 50);
    const rise = ease(seg(lt, 0.1, 2.8));
    g.save(); g.beginPath(); g.rect(0, 0, W, 655); g.clip();
    subject06(640, lerp(1060, 690, rise), 1.25, { hb: heartbeat(t), tilt: Math.sin(lt * 1.3) * 0.08 });
    g.restore();
    beam(240, 760, -0.62, 1000, 0.42);
    fill("#000", 0.15);
  } },
  { a: 28.6, b: 29.5, name: "His mark", vx: MARK.x, desc: "CU forearm. Daniel's mark pulses...", mark: true, draw(lt, t) {
    drawForearm({ grade: "night", glow: 0.7, pulse: 0.8 * heartbeat(t), rub: 0, sleeve: 0 });
  } },
  { a: 29.5, b: 30.4, name: "Its mark", desc: "CU Subject 06's chest. ...and its mark pulses on the same beat.", draw(lt, t) {
    g.fillStyle = "#06080a"; g.fillRect(0, 0, W, H);
    subject06(640, 1040, 2.6, { hb: heartbeat(t) });
    flashlight(640, 400, 520);
  } },
  { a: 30.4, b: 32.4, name: "Standoff", vx: 520, desc: "OTS. Daniel aims, the barrel trembling. It stands in the beam.", draw(lt, t) {
    closetWall();
    g.fillStyle = "#000"; ellipse(720, 680, 260, 40);
    subject06(720, 740, 1.05, { hb: heartbeat(t) });
    beam(180, 760, -0.55, 1000, 0.42);
    gunHands(300, 600, 1.7, -0.2, t, 1);
  } },
  { a: 32.4, b: 34.4, name: "Open hand", desc: "MS. It tilts its head and raises an open hand, palm up.", draw(lt, t) {
    closetWall();
    subject06(640, 800, 1.5, { hb: heartbeat(t), tilt: ease(seg(lt, 0.2, 1.0)) * 0.35, hand: ease(seg(lt, 0.6, 1.8)) });
    beam(200, 800, -0.6, 1000, 0.45);
  } },
  { a: 34.4, b: 38, name: "Shoot it", desc: "CU Daniel, under-lit, shaking. Ward: \"It isn't a person anymore. Shoot it.\"", draw(lt, t) {
    g.fillStyle = "#050608"; g.fillRect(0, 0, W, H);
    face({ eye: 1.2, brow: 0.6, worry: 1, frown: 0.4, look: [0.2, 0], k: 1.25, dx: Math.sin(t * 33) * 2, dy: 20 });
    fill(vgrad(0, H, ["rgba(0,0,0,.85)", "rgba(0,0,0,.25)"]));
    glow(640, 900, 520, "rgba(255,210,150,1)", 0.3);
    glow(1100, 400, 300, TEAL, 0.12 + 0.12 * heartbeat(t));
  } },
  { a: 38, b: 40.6, name: "The wristband", desc: "CU its wrist in the beam: SUBJECT 06 — WARD, E.", draw(lt, t) {
    g.fillStyle = "#06080a"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#7d837c"; rrect(520, 300, 240, 520, 60);
    g.fillStyle = "#7b817a";
    for (let i = 0; i < 4; i++) { g.save(); g.translate(560 + i * 54, 150); g.rotate((i - 1.5) * 0.14); rrect(-22, -150, 44, 170, 22); g.restore(); }
    g.save(); g.translate(790, 250); g.rotate(0.9); rrect(-22, -110, 44, 130, 22); g.restore();
    ellipse(640, 230, 160, 130);
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 3; g.beginPath(); g.moveTo(560, 190); g.quadraticCurveTo(640, 240, 720, 200); g.stroke();
    g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(95,227,192,${0.25 + 0.5 * heartbeat(t)})`; g.lineWidth = 3;
    for (const [x0, x1] of [[580, 600], [660, 690], [720, 700]]) { g.beginPath(); g.moveTo(x0, 720); g.quadraticCurveTo((x0 + x1) / 2 + 20, 560, x1, 470); g.stroke(); }
    g.restore();
    g.fillStyle = "#ece9e0"; rrect(440, 380, 400, 100, 14);
    g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(440, 462, 400, 18);
    typed("PROJECT ECHO · SUBJECT 06", 456, 412, 15, "#4a4440");
    typed("WARD, E.", 456, 452, 30);
    g.fillStyle = "#2a2622"; for (let i = 0; i < 12; i++) g.fillRect(752 + i * 6, 424, i % 3 ? 2 : 4, 36);
    flashlight(640 + Math.sin(t * 2) * 8, 420, 420);
  } },
  { a: 40.6, b: 42.2, name: "Who is Ward?", desc: "CU Daniel's eyes: wristband... walkie... wristband.", draw(lt, t) {
    g.fillStyle = "#050608"; g.fillRect(0, 0, W, H);
    const lk = lt < 0.5 ? [-0.6, -0.3] : lt < 1.1 ? [0.7, 0.9] : [-0.6, -0.3];
    face({ eye: 1.1, brow: 0.9, worry: 0.7, look: lk, k: 1.9, dy: 230 });
    fill(vgrad(0, H, ["rgba(0,0,0,.8)", "rgba(0,0,0,.3)"]));
    glow(640, 900, 520, "rgba(255,210,150,1)", 0.25);
  } },
  { a: 42.2, b: 44, name: "The walkie", desc: "Top-down. The walkie on the floorboards, LED on the heartbeat.", draw(lt, t) {
    const z = 1 + lt * 0.04; g.save(); g.translate(640, 360); g.scale(z, z); g.translate(-640, -360);
    floorboards(70);
    walkie(640, 380, 2.0, { led: heartbeat(t), rot: 0.25 });
    g.restore();
    flashlight(640, 380, 420);
  } },
  { a: 44, b: 45.4, name: "Feedback", desc: "The walkie shrieks with feedback, the LED strobing.", draw(lt, t) {
    floorboards(70);
    const strobe = Math.floor(t * 28) % 2;
    walkie(640 + Math.sin(t * 90) * 4, 380, 2.0, { led: strobe, rot: 0.25 });
    const r = rng(3 + Math.floor(t * 24)); g.fillStyle = "rgba(220,240,255,.15)";
    for (let i = 0; i < 14; i++) g.fillRect(0, r() * H, W, 1 + r() * 3);
    flashlight(640, 380, 420);
    fill("#bff", 0.05 * strobe, "lighter");
  } },
  { a: 45.4, b: 46.4, name: "Lunge", desc: "It lunges at the camera.", draw(lt, t) {
    closetWall();
    const k = lerp(1.3, 3.6, ease(seg(lt, 0, 0.95)));
    subject06(640, 280 + 300 * k, k, { hb: heartbeat(t), reach: 1 });
    g.strokeStyle = "rgba(200,220,215,.12)"; g.lineWidth = 3;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(640 + Math.cos(a) * 200, 360 + Math.sin(a) * 200); g.lineTo(640 + Math.cos(a) * 700, 360 + Math.sin(a) * 700); g.stroke(); }
    beam(200, 800, -0.6, 1100, 0.5);
  } },
  { a: 46.4, b: 48.6, name: "The shot", desc: "One white frame on the trigger pull, then black. Ringing.", draw(lt) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (lt < 0.1) fill("#fffdf4");
    else glow(640, 360, 700, "rgba(255,250,235,1)", 0.25 * Math.exp(-(lt - 0.1) * 5));
  } },
  { a: 48.6, b: 54.6, name: "Aftermath", vx: lt => lerp(560, 720, lt / 6), desc: "Floor level. Smoke in the beam. Subject 06 slumped; its glow goes out.", draw(lt, t) {
    g.fillStyle = "#0a0705"; g.fillRect(0, 0, W, H);
    g.fillStyle = vgrad(300, H, ["#1a120c", "#2a1c12"]); g.fillRect(0, 300, W, H - 300);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const y = 300 + i * i * 3.2 + i * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.fillStyle = "#000"; ellipse(860, 360, 220, 30);
    const fade = 1 - ease(seg(lt, 0.8, 3.2));
    g.save(); g.translate(820, 380); g.rotate(-Math.PI / 2 + 0.15); g.scale(0.7, 0.7);
    g.beginPath(); g.rect(-700, -900, 1400, 1000); g.clip();
    subject06(0, 0, 1, { hb: heartbeat(t) * fade, veins: fade });
    g.restore();
    const [hx, hy] = torch(250, 600, -0.25, 1.4);
    beam(hx, hy, -0.25, 1100, 0.3);
    g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(200,200,210,.07)"; g.lineCap = "round";
    for (let i = 0; i < 9; i++) { g.lineWidth = 3 + (i % 3) * 2; g.beginPath(); for (let k = 0; k < 22; k++) { const x = 460 + i * 55 + Math.sin(k * 0.45 + t * 0.9 + i * 1.7) * (10 + k * 2), y = 600 - k * 22 - (t * 14 + i * 13) % 40; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.restore();
  } },
  { a: 54.6, b: 56, name: "Alone", vx: MARK.x, desc: "CU forearm. Only his mark pulses now.", mark: true, draw(lt, t) {
    drawForearm({ grade: "night", glow: 0.7, pulse: 0.8 * heartbeat(t), rub: 0, sleeve: 0 });
  } },
  { a: 56, b: 58.9, name: "Now you're ready", desc: "Top-down: walkie and revolver on the boards. Ward: \"Good. Now you're ready.\"", draw(lt, t) {
    floorboards(70);
    revolver(470, 470, 1.4, { rot: 0.4 });
    g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(200,200,210,.12)"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); for (let k = 0; k < 12; k++) { const x = 660 + Math.sin(k * 0.6 + t) * 10, y = 540 - k * 22; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
    walkie(800, 380, 1.6, { led: 1, talk: voiceActive(t), t, rot: -0.2 });
    flashlight(680, 420, 460);
  } },
  titleShot(58.9, 60),
];
SHOTS.forEach((s, i) => s.n = String(i + 1).padStart(2, "0"));

// Ward only, over the walkie. Clips come from vo/part-03.js (tools/build_vo.py).
const VO = [
  { id: "ward1", a: 21.75, who: "WARD (walkie)", text: "You found it. Good.", radio: true },
  { id: "ward2", a: 34.6, who: "WARD (walkie)", text: "It isn't a person anymore... Shoot it.", radio: true },
  { id: "ward3", a: 56.3, who: "WARD (walkie)", text: "Good... Now you're ready.", radio: true },
];
VO.forEach(v => { v.b = v.a + (window.VO_DATA?.[v.id]?.dur ?? 2.5) + 0.2; });

const MARK_FRAMES = [
  { label: "PART 1 · SH02 · PLANT", draw: () => drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: 0, sleeve: 0 }) },
  { t: 55.0, label: "PART 3 · SH28 · 00:55:00 · ALONE" },
];
const MARK_NOTE = "Part 3's arm shots (SH16, SH28) reuse Part 1's arm framing unchanged.";

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
bed(0, 46.4, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 220), gn, bus); bedEnv(gn, w, dur, 0.04, 0.05, 0.01); });
// the drop: gasp, thud, the torch rolling
at(1.15, w => hit(w, { f: 2500, type: "highpass", dur: 0.25, v: 0.15 }));
at(1.25, w => { tone(w, { f: 140, f2: 70, dur: 0.25, v: 0.45 }); hit(w, { f: 1800, q: 3, dur: 0.06, v: 0.3 }); });
bed(1.3, 3.4, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.05);
  lfo.frequency.value = 7; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("bandpass", 900, 1.5), gn, bus); gn.gain.setValueAtTime(0.1, w); gn.gain.linearRampToValueAtTime(0, w + dur);
});
bed(3.6, 7.6, breathing(0.9, 0.08, 900));
// fingers: creaking wood and a nail pulling free
for (const s of [4.9, 5.6, 6.3]) at(s, w => tone(w, { f: 120, f2: 80, type: "sawtooth", dur: 0.5, v: 0.05 }));
at(6.6, w => { const o = ac.createOscillator(), gn = gain(); o.frequency.setValueAtTime(1700, w); o.frequency.linearRampToValueAtTime(2400, w + 0.7); chain(o, filt("bandpass", 2000, 4), gn, bus); bedEnv(gn, w, 0.7, 0.05, 0.05, 0.2); o.start(w); o.stop(w + 0.75); });
for (let s = 5.0; s < 7.4; s += 0.2) at(s, w => hit(w, { f: 1300, q: 2, dur: 0.08, v: 0.15 }));
// box tips and crashes
at(7.7, w => tone(w, { f: 300, f2: 200, type: "sawtooth", dur: 0.4, v: 0.04 }));
at(8.6, w => { tone(w, { f: 90, f2: 40, dur: 0.5, v: 0.7 }); hit(w, { f: 800, type: "lowpass", dur: 0.5, v: 0.6 }); [1600, 2300, 3100].forEach((f, i) => tone(w + i * 0.04, { f, dur: 0.4, v: 0.06, type: "triangle" })); });
// paper, cloth, the gun
at(10.2, w => hit(w, { f: 3200, q: 0.8, dur: 0.25, v: 0.07 }));
bed(12.2, 13.7, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("highpass", 1800), gn, bus); bedEnv(gn, w, dur, 0.05, 0.3, 0.3); });
at(13.6, w => { tone(w, { f: 160, f2: 110, dur: 0.2, v: 0.25 }); hit(w, { f: 2500, q: 4, dur: 0.05, v: 0.15 }); });
for (let i = 0; i < 4; i++) at(14.25 + i * 0.07, w => hit(w, { f: 4200, q: 6, dur: 0.02, v: 0.18 }));
// loading: seats, the slip, the ping below, the snap
for (const s of [LOADS[0], LOADS[1], LOADS[3]]) at(s, w => { hit(w, { f: 3600, q: 5, dur: 0.03, v: 0.25 }); tone(w, { f: 900, dur: 0.06, v: 0.05 }); });
at(18.4, w => hit(w, { f: 2800, q: 3, dur: 0.04, v: 0.12 }));
for (const [s, f] of [[19.3, 3400], [19.55, 3000], [19.8, 2600]]) at(s, w => tone(w, { f, dur: 0.15, v: 0.06, type: "triangle" }));
at(20.15, w => tone(w, { f: 1900, dur: 0.3, v: 0.03, type: "triangle" }));
at(21.6, w => { hit(w, { f: 3000, q: 2, dur: 0.06, v: 0.45 }); tone(w, { f: 220, f2: 140, dur: 0.12, v: 0.2 }); });
// walkie static in the gaps
bed(21.4, 24.2, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2600, 0.8), gn, bus); bedEnv(gn, w, dur, 0.02, 0.2, 0.3); });
// the board bursts
at(23.9, w => { tone(w, { f: 70, f2: 35, dur: 0.6, v: 0.8 }); hit(w, { f: 1200, type: "lowpass", dur: 0.5, v: 0.6 }); hit(w, { f: 3500, type: "highpass", dur: 0.25, v: 0.25 }); });
for (let i = 0; i < 8; i++) at(24.1 + i * 0.09, w => hit(w, { f: 1800 + i * 200, q: 3, dur: 0.04, v: 0.12 }));
// the heartbeat: doubled while both marks pulse, single after the shot
for (let b = 1; b < 58; b += 1) {
  if (b >= 46.4 && b < 49) continue;
  const both = b >= DOUBLE[0] && b < DOUBLE[1], v = both ? 0.21 : 0.17;
  at(b, w => { tone(w, { f: 62, dur: 0.18, v }); if (both) tone(w, { f: 67, dur: 0.18, v: v * 0.8 }); });
  at(b + 0.27, w => { tone(w, { f: 55, dur: 0.16, v: v * 0.65 }); if (both) tone(w, { f: 59, dur: 0.16, v: v * 0.5 }); });
}
// drone through the standoff, gone at the wristband
bed(25, 38.2, (w, off, dur) => {
  const gn = gain(), lp = filt("lowpass", 320); chain(lp, gn, bus);
  [49, 49.5, 73.4].forEach(f => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; chain(o, lp); o.start(w); o.stop(w + dur); });
  bedEnv(gn, w, dur, 0.045, off < 0.1 ? 2 : 0.1, 0.4);
});
for (let s = 30.5; s < 34.2; s += 0.37) at(s, w => hit(w, { f: 5200, q: 7, dur: 0.015, v: 0.08 }));
// feedback squeal, the lunge, the shot, ringing
bed(44, 45.45, (w, off, dur) => {
  const o = ac.createOscillator(), gn = gain(); o.type = "square"; o.frequency.setValueAtTime(2200, w); o.frequency.exponentialRampToValueAtTime(3600, w + dur);
  chain(o, filt("bandpass", 3000, 2), gn, bus); bedEnv(gn, w, dur, 0.12, 0.08, 0.02); o.start(w); o.stop(w + dur);
});
bed(45.4, 46.4, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 500, 0.8), gn, bus); gn.gain.setValueAtTime(0.02, w); gn.gain.exponentialRampToValueAtTime(0.35, w + dur); });
at(46.4, w => { hit(w, { f: 6000, type: "highpass", dur: 0.12, v: 0.5 }); hit(w, { f: 1500, type: "lowpass", dur: 0.6, v: 0.45 }); tone(w, { f: 60, f2: 30, dur: 0.9, v: 0.45 }); });
bed(46.5, 52.5, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.frequency.value = 4100; chain(o, gn, bus); gn.gain.setValueAtTime(lerp(0.05, 0, off / 6), w); gn.gain.linearRampToValueAtTime(0, w + dur); o.start(w); o.stop(w + dur); });
bed(49, 58.9, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 200), gn, bus); bedEnv(gn, w, dur, 0.035, 1.5, 0.1); });
bed(55.9, 58.9, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2600, 0.8), gn, bus); bedEnv(gn, w, dur, 0.02, 0.2, 0.2); });
at(59.0, w => tone(w, { f: 48, f2: 30, dur: 1.0, v: 0.4 }));
