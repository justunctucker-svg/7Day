"use strict";
// Part 2 "Don't Open the Door": shots, voice cues and sound cues.

// ---------------------------------------------------------------------------
// Part 2 set pieces
// ---------------------------------------------------------------------------

// What the peephole sees: the porch, the yard, dragging footprints into the corn
function porchScene(lt) {
  g.fillStyle = vgrad(0, 380, ["#05070f", "#16203a"]); g.fillRect(-200, -200, W + 400, 600);
  glow(980, 60, 420, "rgba(150,170,230,1)", 0.3);
  g.fillStyle = "#070a14"; g.beginPath(); g.moveTo(-200, 345);
  for (let x = -200; x <= W + 200; x += 40) g.lineTo(x, 318 - 22 * Math.abs(Math.sin(x * 0.013)) - 10 * Math.abs(Math.sin(x * 0.05)));
  g.lineTo(W + 200, 345); g.fill();
  g.fillStyle = "#2a3654"; g.fillRect(-200, 400, W + 400, 140);
  // the corn wall at the edge of the yard
  g.strokeStyle = "#0b1322"; g.lineWidth = 4;
  for (let x = -200; x < W + 200; x += 11) { g.beginPath(); g.moveTo(x, 412); g.lineTo(x + 4 * Math.sin(x), 338 + 10 * Math.sin(x * 0.7)); g.stroke(); }
  // the shape that slips into the corn
  const a = 1 - seg(lt, 2.4, 3.0);
  if (a > 0) { g.save(); g.globalAlpha = a; person(860 + seg(lt, 1.8, 3.0) * 120, 405, 0.42, { pose: "hunch", facing: 1, coat: "#05070d", skin: "#05070d", hair: "#05070d", eyeGlow: true }); g.restore(); }
  // fog
  for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(190,205,240,.05)"; ellipse(((i * 260 + lt * 30) % (W + 400)) - 200, 420 + i * 14, 260, 22); }
  // footprints dragging off the porch
  const r = rng(51);
  for (let i = 0; i < 9; i++) {
    const p = i / 8, x = lerp(650, 600, p) + (i % 2 ? 16 : -16) * (1 - p * 0.6), y = lerp(640, 420, p), s = lerp(1, 0.35, p);
    g.fillStyle = "rgba(8,6,6,.9)"; ellipse(x, y, 15 * s, 26 * s, 0.1);
    g.strokeStyle = "rgba(8,6,6,.55)"; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(x, y + 16 * s); g.lineTo(x + (r() - 0.5) * 10, y + 46 * s); g.stroke();
  }
  // porch boards, rail and posts
  g.fillStyle = "#3a4258"; g.fillRect(-200, 540, W + 400, 380);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 3;
  for (let y = 560; y < 900; y += 28 + (y - 540) * 0.2) { g.beginPath(); g.moveTo(-200, y); g.lineTo(W + 200, y); g.stroke(); }
  g.fillStyle = "#0e1220";
  g.fillRect(-200, 470, 720, 12); g.fillRect(760, 470, 720, 12);
  for (let x = -180; x < 520; x += 60) g.fillRect(x, 482, 10, 58);
  for (let x = 780; x < W + 200; x += 60) g.fillRect(x, 482, 10, 58);
  g.fillRect(160, -200, 34, 740); g.fillRect(1090, -200, 34, 740);
}

const CORN_EYES = (() => {
  const r = rng(31), out = [];
  for (let i = 0; i < 34; i++) {
    const layer = Math.floor(r() * 3);
    out.push({ layer, x: 60 + r() * 1160, y: [352, 402, 470][layer] + r() * 24, s: [0.6, 0.85, 1.25][layer], open: 18.9 + r() * 2.6, turn: 22.4 + r() * 0.9, side: r() < 0.5 ? -1 : 1 });
  }
  return out;
})();

function fieldEye(e, t) {
  if (t < e.open) return;
  const open = ease(seg(t, e.open, e.open + 0.25)), turned = ease(seg(t, e.turn, e.turn + 0.15));
  const glowA = (0.35 + 0.65 * heartbeat(t)) * open, s = e.s;
  const pts = turned > 0 ? [[e.x - 7 * s * turned, e.y], [e.x + 7 * s * turned, e.y]] : [[e.x + e.side * 6 * s, e.y]];
  for (const [x, y] of pts) {
    g.fillStyle = `rgba(175,255,232,${glowA})`; ellipse(x, y, 3.4 * s, Math.max(0.3, 2.3 * s * open));
    glow(x, y, 18 * s, TEAL, 0.5 * glowA);
  }
}

function cornfield(lt, t) {
  g.save(); const z = 1 + lt * 0.012; g.translate(640, 360); g.scale(z, z); g.translate(-640, -360);
  g.fillStyle = vgrad(0, 360, ["#03050c", "#101a33"]); g.fillRect(0, 0, W, 380);
  const r = rng(77); g.fillStyle = "rgba(220,230,255,.7)";
  for (let i = 0; i < 70; i++) circle(r() * W, r() * 260, r() < 0.15 ? 1.4 : 0.8);
  g.fillStyle = "#e6ecf6"; circle(1010, 110, 30); glow(1010, 110, 240, "rgba(150,170,230,1)", 0.25);
  g.fillStyle = "#060912"; g.beginPath(); g.moveTo(0, 360);
  for (let x = 0; x <= W; x += 30) g.lineTo(x, 330 - 18 * Math.abs(Math.sin(x * 0.011)) - 8 * Math.abs(Math.sin(x * 0.047)));
  g.lineTo(W, 360); g.fill();
  g.fillStyle = "#0a101e"; g.fillRect(0, 358, W, 362);
  cornRow(378, 46, "#0d1526", t, 1); CORN_EYES.filter(e => e.layer === 0).forEach(e => fieldEye(e, t));
  cornRow(436, 80, "#0a111f", t, 2); CORN_EYES.filter(e => e.layer === 1).forEach(e => fieldEye(e, t));
  cornRow(530, 130, "#070c17", t, 3); CORN_EYES.filter(e => e.layer === 2).forEach(e => fieldEye(e, t));
  g.restore();
  // porch rail in the foreground: we're looking out from the house
  g.fillStyle = "#04060c"; g.fillRect(0, 600, W, 16);
  for (let x = 10; x < W; x += 64) g.fillRect(x, 616, 12, 120);
  g.fillRect(70, 0, 40, 720);
  fill("#0b1530", 0.2, "multiply");
}

function hammerAngle(lt, hits, hitA) {
  const next = hits.find(h => lt <= h + 0.08) ?? hits[hits.length - 1];
  return hitA - 0.9 * ease(clamp((next - lt) / 0.3));
}

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
const GAP_Y = 400;  // the floorboard gap in SH23 (scrolls) and SH24 (fixed)

const SHOTS = [
  { a: 0, b: 1.6, name: "Frozen", desc: "ECU Daniel, picking up Part 1's freeze frame. Eyes dart to the door.", draw(lt) {
    g.fillStyle = "#070b18"; g.fillRect(0, 0, W, H);
    face({ eye: 1.45, brow: 1, worry: 0.6, mouth: 0.3, pupil: 0.6, look: [lerp(-0.5, 0.9, ease(seg(lt, 0.8, 1.05))), 0], k: 1.55, dy: 90 });
    fill("#1a2a5a", 0.6, "multiply");
    fill("#9fb4ff", 0.06, "lighter");
    g.save(); g.globalCompositeOperation = "saturation"; g.globalAlpha = 1 - seg(lt, 0.3, 0.7); g.fillStyle = "#808080"; g.fillRect(0, 0, W, H); g.restore();
  } },
  { a: 1.6, b: 4, name: "Under the door", vx: 660, desc: "Floor level. A walkie-talkie slides in under the front door.", draw(lt, t) {
    g.fillStyle = "#0b0f1c"; g.fillRect(0, 0, W, 380);
    g.fillStyle = "#2a2230"; g.fillRect(440, 0, 400, 380);
    g.fillStyle = "#1c1622"; g.fillRect(470, 40, 340, 300);
    const feet = lt < 1.3;
    g.fillStyle = "rgba(170,190,240,.55)"; g.fillRect(440, 380, 400, 8);
    if (feet) { g.fillStyle = "#000"; g.fillRect(560, 380, 60, 8); g.fillRect(660, 380, 60, 8); }
    // floorboards in perspective
    g.fillStyle = vgrad(388, H, ["#141a2a", "#1e2638"]); g.fillRect(0, 388, W, H - 388);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(640 + i * 40, 388); g.lineTo(640 + i * 190, H); g.stroke(); }
    g.save(); g.globalAlpha = 0.14; g.fillStyle = "#aab8e8"; g.beginPath(); g.moveTo(440, 388); g.lineTo(840, 388); g.lineTo(1000, H); g.lineTo(280, H); g.fill(); g.restore();
    const p = 1 - (1 - seg(lt, 0.15, 1.2)) ** 3;
    if (lt > 0.15) walkie(lerp(640, 720, p), lerp(392, 640, p), lerp(0.3, 1.15, p), { rot: Math.PI / 2 + p * 1.1, led: ledAt(t) });
    fill("#0b1530", 0.25, "multiply");
  } },
  { a: 4, b: 6, name: "Creep", vx: lt => lerp(500, 860, ease(lt / 2)), desc: "MS. Daniel creeps to the door.", draw(lt, t) {
    frontWall(t, { daniel: [lerp(460, 820, ease(lt / 2)), lt * 4.5] });
    walkie(760, 600, 0.55, { rot: Math.PI / 2 + 1.1, led: ledAt(t) });
  } },
  { a: 6, b: 10, name: "Peephole", desc: "Fisheye POV: empty porch, dragging footprints, a shape at the treeline.", draw(lt) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    const R = opts.vert ? 196 : 330, cx = 640, cy = 360;
    // fake fisheye: stacked circles, more magnified toward the centre
    for (let i = 0; i < 10; i++) {
      const r = R * (1 - i / 10), k = lerp(1.05, 1.5, (i / 10) ** 1.3);
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
      g.translate(cx, cy + Math.sin(lt * 2) * 3); g.scale(k, k); g.translate(-640, -420);
      porchScene(lt); g.restore();
    }
    const v = g.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.85)");
    g.fillStyle = v; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R * 0.86, Math.PI * 1.1, Math.PI * 1.4); g.stroke();
    fill("#0b1530", 0.2, "multiply");
  } },
  { a: 10, b: 10.8, name: "Pick up", desc: "CU. His hand lifts the walkie off the floorboards.", draw(lt, t) {
    g.fillStyle = "#141a2a"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 3;
    for (let y = 40; y < H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const up = ease(seg(lt, 0.3, 0.8));
    walkie(640, lerp(470, 380, up), lerp(1.6, 2.0, up), { rot: lerp(Math.PI / 2, 0, up), led: ledAt(t) });
    const reach = ease(seg(lt, 0, 0.35)), hx = lerp(860, 690, reach), hy = lerp(260, 330, reach) - up * 70;
    g.strokeStyle = "#3b475a"; g.lineCap = "round"; g.lineWidth = 92;
    g.beginPath(); g.moveTo(1400, -60); g.quadraticCurveTo(1100, 120, hx + 60, hy - 30); g.stroke();
    g.fillStyle = "#b7896a"; ellipse(hx, hy, 62, 48, -0.5);
    for (let i = 0; i < 4; i++) ellipse(hx - 52 + i * 18, hy + 34, 11, 22, 0.2);
    fill("#0b1530", 0.35, "multiply");
  } },
  { a: 10.8, b: 14, name: "The walkie", desc: "CU walkie in his hand. Ward: \"Good. You didn't open the door.\"", draw(lt, t) {
    g.fillStyle = vgrad(0, H, ["#0b1124", "#060912"]); g.fillRect(0, 0, W, H);
    glow(420, 300, 300, "rgba(80,100,160,1)", 0.12);
    walkie(640, 400, 2.3, { led: ledAt(t), talk: voiceActive(t), t });
    g.fillStyle = "#9c7458"; ellipse(640, 560, 120, 70); ellipse(560, 470, 34, 60, 0.3);
    g.fillStyle = "#3b475a"; g.fillRect(560, 600, 220, 140);
    fill("#0b1530", 0.3, "multiply");
  } },
  { a: 14, b: 15.6, name: "Unease", desc: "CU Daniel. He looks down at his arm.", draw(lt, t) {
    g.fillStyle = "#0a1022"; g.fillRect(0, 0, W, H);
    face({ eye: 1.1, brow: 0.3, worry: 0.8, frown: 0.5, look: [0.3, lerp(0, 0.9, ease(seg(lt, 0.4, 0.9)))], k: 1.2, dy: 30 });
    fill("#1a2a5a", 0.55, "multiply");
    glow(720, 780, 420, TEAL, 0.25 + 0.3 * heartbeat(t));
  } },
  { a: 15.6, b: 18.4, name: "Mark pulses", vx: MARK.x, desc: "CU forearm, Part 1's framing. Ward: \"That mark is how they find you.\"", mark: true, draw(lt, t) {
    drawForearm({ grade: "night", glow: 0.7, pulse: 0.8 * heartbeat(t), rub: 0, sleeve: 0 });
  } },
  { a: 18.4, b: 25, name: "Field of eyes", vx: lt => lerp(420, 860, lt / 6.6), desc: "EWS from the porch. Teal eyes open across the cornfield and turn toward the house.", draw(lt, t) {
    cornfield(lt, t);
  } },
  { a: 25, b: 26, name: "Resolve", desc: "CU Daniel. Jaw set. He moves.", draw(lt, t) {
    g.fillStyle = "#0a1022"; g.fillRect(0, 0, W, H);
    face({ eye: 0.95, brow: -0.2, worry: 0.2, frown: 0.7, look: [lerp(0, 0.8, ease(seg(lt, 0.5, 0.9))), 0], k: 1.25, dy: 30 });
    fill("#1a2a5a", 0.55, "multiply");
  } },
  { a: 26, b: 27.8, name: "DAY 10: dresser", vx: lt => lerp(560, 870, ease(seg(lt, 0.1, 1.5))) + 60, desc: "He drags the dresser across the front door.", draw(lt, t) {
    const x = lerp(560, 870, ease(seg(lt, 0.1, 1.5)));
    frontWall(t, { dresser: x, daniel: [x - 40, t * 5] });
    stamp("DAY 10", lt - 0.1);
  } },
  { a: 27.8, b: 29.6, name: "Board the window", vx: 720, desc: "Boards slam across the window; three hammer blows.", draw(lt) {
    const hits = [0.5, 1.0, 1.4], hitA = Math.atan2(300 - 820, 790 - 1050);
    const sinceHit = Math.min(...hits.map(h => lt >= h ? lt - h : 9));
    g.save(); g.translate(Math.exp(-sinceHit * 20) * 6 * Math.sin(lt * 90), 0);
    boardedWindow(lt, 0, { boards: [[640, 260, -0.12, seg(lt, 0.0, 0.25)], [640, 380, 0.1, seg(lt, 0.6, 0.85)]] });
    const a = hammerAngle(lt, hits, hitA), px = 1050, py = 820;
    g.save(); g.translate(px, py); g.rotate(a);
    g.fillStyle = "#4a3422"; g.fillRect(0, -9, 340, 18);
    g.fillStyle = "#2a2c30"; g.fillRect(320, -40, 46, 80);
    g.restore();
    g.restore();
  } },
  { a: 29.6, b: 31.2, name: "Lantern out", desc: "CU. He turns the wick down; the room goes dark.", draw(lt, t) {
    const f = 1 - ease(seg(lt, 0.35, 1.05));
    g.fillStyle = "#06080f"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#120d0a"; g.fillRect(0, 560, W, 160);
    glow(640, 330, 520, "rgba(255,190,110,1)", 0.55 * f);
    g.fillStyle = "#2a2a2c"; ellipse(640, 560, 150, 22); rrect(530, 440, 220, 120, 16);
    g.fillStyle = "#3a3a3e"; g.fillRect(600, 410, 80, 34);
    g.fillStyle = `rgba(255,230,180,${0.12 + 0.2 * f})`; ellipse(640, 320, 92, 120);
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 4; g.beginPath(); g.ellipse(640, 320, 92, 120, 0, Math.PI * 1.15, Math.PI * 1.45); g.stroke();
    g.fillStyle = "#2a2a2c"; g.fillRect(598, 176, 84, 30); g.strokeStyle = "#2a2a2c"; g.lineWidth = 6; g.beginPath(); g.arc(640, 210, 120, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    if (f > 0.02) {
      const fl = 1 + 0.08 * Math.sin(t * 37);
      g.fillStyle = "#ffd27a"; ellipse(640, 330 + (1 - f) * 20, 14 * f * fl, 36 * f * fl);
      g.fillStyle = "#fff6d8"; ellipse(640, 336 + (1 - f) * 20, 6 * f, 16 * f);
    } else {
      g.strokeStyle = "rgba(140,140,150,.35)"; g.lineWidth = 3;
      g.beginPath(); for (let i = 0; i < 20; i++) { const y = 330 - i * 8, x = 640 + Math.sin(i * 0.6 + t * 3) * (4 + i); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    }
    // hand on the wick knob
    g.save(); g.translate(770, 470); g.rotate(-ease(seg(lt, 0.3, 1.0)) * 0.8);
    g.fillStyle = "#8a6a52"; ellipse(30, 0, 60, 34); g.fillStyle = "#4a4a50"; circle(-10, 0, 14);
    g.restore();
    glow(120, 760, 380, TEAL, (1 - f) * (0.18 + 0.2 * heartbeat(t)));
  } },
  { a: 31.2, b: 34, name: "Wrap the arm", vx: MARK.x, desc: "CU forearm. He binds the mark; the glow bleeds through the cloth.", mark: true, draw(lt, t) {
    const hb = heartbeat(t);
    drawForearm({ grade: "night", glow: 0.7, pulse: 0.5 * hb, rub: 0, sleeve: 0 });
    const offs = [-150, -75, 0, 75, 150];
    let cover = 0;
    g.save(); forearmPath(); g.clip();
    offs.forEach((dx, i) => {
      const p = ease(seg(lt, 0.2 + i * 0.38, 0.45 + i * 0.38));
      if (p <= 0) return;
      if (Math.abs(dx) < 40) cover = p;
      const cx = MARK.x + dx, w = 82;
      g.fillStyle = "#5c6274";
      g.beginPath(); g.moveTo(cx - w / 2 + 26, 260); g.lineTo(cx + w / 2 + 26, 260); g.lineTo(cx + w / 2 - 26, 260 + 260 * p); g.lineTo(cx - w / 2 - 26, 260 + 260 * p); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx + k * 10 + 26, 260); g.lineTo(cx + k * 10 + 26 - 52 * p, 260 + 260 * p); g.stroke(); }
    });
    g.restore();
    if (cover > 0) {
      glow(MARK.x, MARK.y, 90, TEAL, cover * (0.25 + 0.5 * hb));
      g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(95,227,192,${cover * (0.15 + 0.35 * hb)})`;
      for (let yy = -24; yy <= 24; yy += 6) for (let xx = -30; xx <= 30; xx += 6) if (xx * xx + yy * yy < 900) g.fillRect(MARK.x + xx + yy * 0.2, MARK.y + yy, 2, 2);
      g.restore();
    }
  } },
  { a: 34, b: 37, name: "The siege", desc: "Silhouettes pass the boarded window; a hand presses on the glass.", draw(lt, t) {
    boardedWindow(lt, t, {
      boards: [[640, 260, -0.12, 1], [640, 380, 0.1, 1]],
      figures: [[lerp(900, 380, seg(lt, 0, 1.6)), 1.5], [lerp(980, 420, seg(lt, 0.8, 2.6)), 1.35]],
      hand: seg(lt, 1.9, 2.1) > 0 ? ease(seg(lt, 1.9, 3.0)) * 0.999 + 0.001 : 0,
    });
  } },
  { a: 37, b: 39, name: "The handle", vx: 860, desc: "CU. The doorknob turns against the dresser.", draw(lt, t) {
    const push = ease(seg(lt, 1.2, 1.5)) * (1 - ease(seg(lt, 1.6, 1.9)));
    g.save(); g.translate(Math.sin(t * 70) * push * 4, 0);
    g.fillStyle = "#2a2230"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#1c1622"; g.lineWidth = 16; g.strokeRect(120, 60, 700, 520);
    g.fillStyle = "#4a4448"; rrect(860, 250, 120, 300, 20);
    const ang = Math.sin(seg(lt, 0.2, 1.6) * Math.PI) * 0.9 - 0.15 * Math.sin(t * 30) * seg(lt, 0.2, 1.6);
    g.save(); g.translate(920, 400); g.rotate(ang);
    g.fillStyle = "#6a6258"; circle(0, 0, 58);
    g.fillStyle = "rgba(255,255,255,.22)"; ellipse(-18, -20, 20, 12, -0.6);
    g.fillStyle = "#2a2622"; g.fillRect(-4, -46, 8, 22);
    g.restore();
    g.fillStyle = "#000"; circle(920, 480, 9); g.fillRect(916, 480, 8, 22);
    g.restore();
    g.save(); g.translate(0, push * Math.sin(t * 60) * 3);
    g.fillStyle = "#2c2024"; g.fillRect(-20, 600, W + 40, 20); g.fillStyle = "#3a2c30"; g.fillRect(-20, 620, W + 40, 120);
    g.restore();
    fill("#0b1530", 0.35, "multiply");
  } },
  { a: 39, b: 42.8, name: "Back to the wall", desc: "MS. Daniel pressed to the wall. Ward: \"Check the closet. I left you something.\"", draw(lt, t) {
    nightWall();
    person(640, 690, 2.5, { facing: -1, mug: 0.85, walkie: true, led: ledAt(t), coat: "#3b475a" });
    glow(640 - 70, 520, 120, TEAL, 0.1 + 0.15 * heartbeat(t));
    fill("#0b1530", 0.3, "multiply");
  } },
  { a: 42.8, b: 44.6, name: "Into the closet", vx: 610, desc: "He slips into the closet and pulls the door to.", draw(lt, t) {
    nightWall();
    g.fillStyle = "#0b0f1c"; g.fillRect(510, 150, 200, 412);
    g.fillStyle = "#000"; g.fillRect(520, 160, 180, 402);
    const open = ease(seg(lt, 0, 0.4)) * (1 - ease(seg(lt, 1.0, 1.4)) * 0.92);
    const leaf = 180 * (1 - open * 0.8);
    g.fillStyle = "#3a3038"; g.fillRect(520, 160, leaf, 402);
    g.strokeStyle = "#2a2228"; g.lineWidth = 6; if (leaf > 60) { g.strokeRect(530, 180, leaf - 22, 150); g.strokeRect(530, 350, leaf - 22, 180); }
    const a = 1 - seg(lt, 0.75, 1.0);
    if (a > 0) { g.save(); g.globalAlpha = a; person(lerp(900, 640, ease(seg(lt, 0, 0.9))), 640, 1.5, { pose: "walk", phase: lt * 7, facing: -1, coat: "#3b475a" }); g.restore(); }
    fill("#0b1530", 0.3, "multiply");
    if (lt > 1.45) fill("#000", seg(lt, 1.45, 1.7));
  } },
  { a: 44.6, b: 47.6, name: "Project Echo", desc: "CU by flashlight: a folder stamped PROJECT ECHO. Inside, SUBJECT 07: D. HAYES.", draw(lt, t) {
    shelfBg();
    g.fillStyle = "#6a4a2c"; g.fillRect(120, 60, 260, 150); g.fillStyle = "#5a3e24"; g.fillRect(120, 60, 260, 24);
    const open = ease(seg(lt, 1.0, 1.4));
    g.fillStyle = "#c9ad74"; g.fillRect(420, 190, 440, 370);
    if (open < 1) {
      g.save(); g.translate(420, 0); g.scale(1 - open, 1); g.translate(-420, 0);
      g.fillStyle = "#d9c08a"; g.fillRect(420, 180, 440, 370); g.fillRect(440, 160, 140, 24);
      redStamp("PROJECT ECHO", 640, 330, 34, -0.06, 1);
      typed("CLASSIFIED · DO NOT REMOVE", 470, 470, 15, "#5a4a30");
      g.restore();
    } else {
      paper(436, 200, 410, 344, 0.01);
      g.fillStyle = "#c8c8c8"; g.fillRect(456, 228, 130, 160);
      g.save(); g.beginPath(); g.rect(456, 228, 130, 160); g.clip(); g.translate(521, 318); g.scale(0.27, 0.27); g.translate(-640, -410);
      face({ eye: 0.9, k: 1 }); g.restore();
      g.save(); g.globalCompositeOperation = "saturation"; g.fillStyle = "#808080"; g.fillRect(456, 228, 130, 160); g.restore();
      g.strokeStyle = "#8a8a90"; g.lineWidth = 3; g.beginPath(); g.moveTo(470, 214); g.lineTo(470, 250); g.stroke();
      typed("PROJECT ECHO", 604, 250, 15, "#5a4a30");
      typed("SUBJECT 07", 604, 292, 26);
      typed("HAYES, D.", 604, 326, 20);
      typed("DOSE: DAY 1", 604, 362, 15, "#4a4440");
      typed("STATUS: ACTIVE", 604, 384, 15, "#4a4440");
      typed("MONITOR SIGNAL — 60 BPM", 456, 430, 15, "#4a4440");
      g.fillStyle = "#2a2622"; for (let i = 0; i < 26; i++) g.fillRect(456 + i * 7, 456, i % 3 ? 2 : 4, 34);
    }
    flashlight(640 + Math.sin(t * 2) * 6, 380, 380);
  } },
  { a: 47.6, b: 50, name: "Turned", desc: "Six earlier subject files, each stamped TURNED.", draw(lt, t) {
    shelfBg();
    const vert = opts.vert;
    for (let i = 0; i < 6; i++) {
      const [x, y, rot] = vert ? [470 + (i % 2) * 175, 170 + Math.floor(i / 2) * 145, (i % 2 ? 0.05 : -0.05)] : [190 + i * 150, 250 + Math.abs(i - 2.5) * 22, (i - 2.5) * 0.07];
      g.save(); g.translate(x + 70, y + 60); g.rotate(rot); g.translate(-x - 70, -y - 60);
      g.fillStyle = "#d9c08a"; g.fillRect(x, y, 140, vert ? 125 : 190); g.fillRect(x + 8, y - 16, 70, 18);
      typed(`SUBJECT 0${i + 1}`, x + 12, y + 34, 15);
      g.fillStyle = "#bcbcbc"; g.fillRect(x + 12, y + 46, 46, vert ? 52 : 60);
      redStamp("TURNED", x + 70, y + (vert ? 86 : 120), 20, -0.25 + (i % 3) * 0.12, seg(lt, 0.15 + i * 0.32, 0.45 + i * 0.32));
      g.restore();
    }
    flashlight(640 + Math.sin(t * 2.3) * 8, 360, 520);
  } },
  { a: 50, b: 52, name: "Subject 06", desc: "CU. SUBJECT 06. LAST KNOWN LOCATION: THIS PROPERTY.", draw(lt, t) {
    shelfBg();
    paper(430, 120, 420, 470, -0.015);
    g.fillStyle = "#bcbcbc"; g.fillRect(456, 150, 130, 160);
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 7; g.beginPath();
    for (let i = 0; i < 12; i++) { g.moveTo(462 + (i * 37) % 118, 160 + i * 12); g.lineTo(580 - (i * 23) % 110, 170 + i * 11); }
    g.stroke();
    typed("SUBJECT 06", 604, 196, 26);
    typed("STATUS:", 604, 240, 16, "#4a4440");
    redStamp("TURNED", 730, 236, 20, -0.12, 1);
    typed("LAST KNOWN LOCATION:", 456, 370, 18, "#4a4440");
    g.fillStyle = "#b8231b"; g.font = "italic 700 34px Georgia, serif"; g.fillText("THIS PROPERTY", 470, 430);
    g.strokeStyle = "#b8231b"; g.lineWidth = 3; g.beginPath(); g.moveTo(468, 442); g.quadraticCurveTo(620, 450, 740, 438); g.stroke();
    typed("Hayes Farm, Ashford County", 456, 500, 15, "#4a4440");
    const tremble = 0.6 + seg(lt, 0, 2);
    flashlight(640 + Math.sin(t * 41) * 5 * tremble, 380 + Math.cos(t * 37) * 4 * tremble, 360);
  } },
  { a: 52, b: 53.6, name: "Beneath", desc: "CU Daniel, lit by the flashlight. Scratching under his feet.", draw(lt, t) {
    g.fillStyle = "#050608"; g.fillRect(0, 0, W, H);
    face({ eye: 1.3, brow: 0.8, worry: 0.9, look: [0, lerp(0.2, 1, ease(seg(lt, 0.5, 1.0)))], pupil: 0.8, k: 1.25, dy: 20 });
    fill(vgrad(0, H, ["rgba(0,0,0,.85)", "rgba(0,0,0,.2)"]));
    glow(640, 900, 520, "rgba(255,210,150,1)", 0.3);
  } },
  { a: 53.6, b: 56.2, name: "Floorboards", desc: "Flashlight tilts down to a gap in the boards. A teal eye opens.", draw(lt, t) {
    const off = lerp(0, 160, ease(seg(lt, 0, 1.2)));
    g.save(); g.translate(0, -off); floorboards(0);
    g.fillStyle = "#020203"; g.fillRect(0, GAP_Y + 160 - 6, W, 14);
    const eo = ease(seg(lt, 1.5, 1.8));
    if (eo > 0) {
      const y = GAP_Y + 161, a = 0.4 + 0.6 * heartbeat(t);
      g.save(); g.beginPath(); g.rect(0, y - 6, W, 13); g.clip();
      g.fillStyle = `rgba(175,255,232,${a * eo})`; ellipse(660, y, 22, 6 * eo);
      g.fillStyle = "#020203"; ellipse(660, y, 3, 6 * eo);
      g.restore();
      glow(660, y, 70, TEAL, 0.5 * a * eo);
    }
    g.restore();
    flashlight(640, 420, 330);
  } },
  { a: 56.2, b: 57.6, name: "The eye", desc: "ECU through the gap. It blinks in time with his mark. Hard cut.", draw(lt, t) {
    eyeInGap(t, 1 - Math.exp(-(((lt - 0.8) / 0.07) ** 2)));
  } },
  titleShot(57.6, 60),
];
SHOTS.forEach((s, i) => s.n = String(i + 1).padStart(2, "0"));

// Ward only, over the walkie. Clips come from vo/part-02.js (tools/build_vo.py).
const VO = [
  { id: "ward1", a: 10.9, who: "WARD (walkie)", text: "Good. You didn't open the door.", radio: true },
  { id: "ward2", a: 16.0, who: "WARD (walkie)", text: "That mark is how they find you.", radio: true },
  { id: "ward3", a: 39.3, who: "WARD (walkie)", text: "Check the closet. I left you something.", radio: true },
];
VO.forEach(v => { v.b = v.a + (window.VO_DATA?.[v.id]?.dur ?? 2.5) + 0.2; });

// Frames for the "Mark match" view: Part 1's plant against Part 2's pulse
const MARK_FRAMES = [
  { label: "PART 1 · SH02 · PLANT", draw: () => drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: 0, sleeve: 0 }) },
  { t: 16.5, label: "PART 2 · SH08 · 00:16:12 · PULSE" },
];
const MARK_NOTE = "Part 2's arm shots (SH08, SH14) reuse Part 1's arm framing unchanged.";

// Scratching under the closet floor (shared by picture timing and sound)
const UNDER = (() => { const r = rng(23), out = []; for (let t = 51.6; t < 55.6; t += 0.14 + r() * 0.25) out.push([t, 0.06 + r() * 0.14]); return out; })();

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
// room tone under almost everything
bed(0, 57.6, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 220), gn, bus); bedEnv(gn, w, dur, 0.04, off < 0.1 ? 1.2 : 0.05, 0.02); });
// the walkie skids in under the door
bed(1.8, 2.8, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 1400, 1.2), gn, bus); gn.gain.setValueAtTime(0.22, w); gn.gain.exponentialRampToValueAtTime(0.002, w + dur); });
for (const s of [1.85, 2.1, 2.4]) at(s, w => hit(w, { f: 2500, q: 3, dur: 0.03, v: 0.2 }));
// creaks, breathing, wind through the peephole
for (const s of [4.4, 5.3]) at(s, w => tone(w, { f: 140, f2: 90, type: "sawtooth", dur: 0.35, v: 0.035 }));
bed(4, 10, breathing(1.6, 0.06, 800));
bed(6, 10, (w, off, dur) => { const gn = gain(), lp = filt("lowpass", 420); chain(noiseSrc(w, dur), lp, gn, bus); bedEnv(gn, w, dur, 0.1, 0.4, 0.3); });
// walkie static between transmissions
bed(10.2, 18.6, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2600, 0.8), gn, bus); bedEnv(gn, w, dur, 0.025, 0.2, 0.4); });
// heartbeat thumps from the mark onward, louder in the closet
for (let b = 15; b < 57; b += 1) {
  const v = b >= 52 ? 0.3 : 0.18;
  at(b, w => tone(w, { f: 62, dur: 0.18, v })); at(b + 0.27, w => tone(w, { f: 55, dur: 0.16, v: v * 0.65 }));
}
// crickets, then they all stop when the eyes open
bed(18.4, 21.3, (w, off, dur) => {
  const o = ac.createOscillator(), am = ac.createOscillator(), ag = gain(0.5), gn = gain();
  o.frequency.value = 4400; am.frequency.value = 28; chain(am, ag, gn.gain); chain(o, gn, bus);
  o.start(w); am.start(w); o.stop(w + dur); am.stop(w + dur); bedEnv(gn, w, dur, 0.02, 0.3, 0.05);
});
// low drone under the field and the siege
bed(16, 42.8, (w, off, dur) => {
  const gn = gain(), lp = filt("lowpass", 300); chain(lp, gn, bus);
  [55, 55.6, 82.4].forEach(f => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; chain(o, lp); o.start(w); o.stop(w + dur); });
  bedEnv(gn, w, dur, 0.06, off < 0.1 ? 2 : 0.1, 0.8);
});
// barricade: dresser scrape, boards, hammer, lantern, cloth
bed(26.1, 27.6, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.05);
  lfo.frequency.value = 9; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("lowpass", 700), gn, bus); bedEnv(gn, w, dur, 0.18, 0.1, 0.15);
});
for (const s of [27.85, 28.45]) at(s, w => { tone(w, { f: 110, f2: 60, dur: 0.3, v: 0.5 }); hit(w, { f: 600, type: "lowpass", dur: 0.2, v: 0.4 }); });
for (const s of [28.3, 28.8, 29.2]) at(s, w => { tone(w, { f: 260, f2: 120, dur: 0.12, v: 0.4, type: "triangle" }); hit(w, { f: 3000, dur: 0.05, v: 0.35 }); });
at(29.9, w => hit(w, { f: 4000, q: 5, dur: 0.03, v: 0.2 }));
bed(30.0, 30.8, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("highpass", 1500), gn, bus); gn.gain.setValueAtTime(0.06, w); gn.gain.linearRampToValueAtTime(0, w + dur); });
for (const s of [31.4, 31.8, 32.2, 32.6, 33.0]) at(s, w => hit(w, { f: 3500, type: "highpass", dur: 0.18, v: 0.12 }));
// siege: nails on glass, a palm slap, the handle
for (let s = 34.3; s < 36.4; s += 0.21) at(s, w => hit(w, { f: 4800, q: 3, dur: 0.09, v: 0.16 }));
at(35.95, w => { tone(w, { f: 120, f2: 70, dur: 0.25, v: 0.45 }); hit(w, { f: 1800, dur: 0.15, v: 0.3 }); });
for (let s = 37.2; s < 38.9; s += 0.16) at(s, w => hit(w, { f: 2200, q: 6, dur: 0.04, v: 0.18 }));
at(38.25, w => tone(w, { f: 90, f2: 50, dur: 0.4, v: 0.35 }));
// closet: creak, latch, flashlight click, paper, stamps
at(42.9, w => tone(w, { f: 180, f2: 300, type: "sawtooth", dur: 0.5, v: 0.04 }));
at(44.15, w => { tone(w, { f: 100, f2: 60, dur: 0.2, v: 0.3 }); hit(w, { f: 2000, q: 4, dur: 0.03, v: 0.2 }); });
at(44.65, w => hit(w, { f: 5000, q: 6, dur: 0.02, v: 0.3 }));
for (const s of [45.2, 45.65, 46.0]) at(s, w => hit(w, { f: 3200, q: 0.8, dur: 0.22, v: 0.08 }));
for (let i = 0; i < 6; i++) at(47.75 + i * 0.32, w => { tone(w, { f: 90, f2: 55, dur: 0.15, v: 0.35 }); hit(w, { f: 700, type: "lowpass", dur: 0.08, v: 0.25 }); });
// scratching under the floor (through wood: duller than Part 1's door)
for (const [s, d] of UNDER) at(s, w => hit(w, { f: 1100 + Math.random() * 500, q: 2, dur: d, v: 0.3 }));
// the blink: one big beat, then a hard cut to silence and the title
at(57.0, w => { tone(w, { f: 50, dur: 0.5, v: 0.6 }); tone(w, { f: 110, f2: 220, dur: 0.4, v: 0.1, type: "triangle" }); });
at(57.75, w => tone(w, { f: 48, f2: 30, dur: 1.2, v: 0.4 }));
