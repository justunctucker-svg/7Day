"use strict";
// Part 4 "Ninety Seconds": shots, voice cues and sound cues.

// ---------------------------------------------------------------------------
// The clock. For three episodes the heartbeat has been a steady 60 bpm.
// Here it holds until the LED turns red, then climbs to 140 bpm by 00:54.
// Everything that pulses (mark, LED, monitors, sound) reads this one clock.
// ---------------------------------------------------------------------------
const RED_AT = 1.4;
const bpmAt = t => t < 1.6 ? 60 : lerp(60, 140, ease(seg(t, 1.6, 54)));
const CLOCK = makeClock(bpmAt);
const phaseAt = CLOCK.phaseAt, periodAt = CLOCK.periodAt;
heartbeat = CLOCK.heartbeat;
const BEATS = CLOCK.beats(59);

// The torch stutters, then dies for good at 00:35.9
const FLICKS = [[17.8, 0.08], [18.3, 0.16], [19.2, 0.1], [24.5, 0.12], [31.6, 0.09], [33.6, 0.1], [34.4, 0.22], [35.9, 99]];
const lampOn = t => !FLICKS.some(([s, d]) => t >= s && t < s + d);

// ---------------------------------------------------------------------------
// Part 4 set pieces
// ---------------------------------------------------------------------------
function crawler(x, y, s, ph) {
  const coat = "#3b475a", pants = "#23272f", skin = "#c99572", hair = "#2a1d16", a = Math.sin(ph), b = -a;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = "round"; g.lineJoin = "round";
  limb([-70, -20, -110, -6 + a * 5, -152, -14], 14, pants);
  limb([-70, -20, -108, -4 + b * 5, -154, -6], 14, pants);
  limb([-70, -24, 20, -36], 30, coat);
  g.fillStyle = "#5b4a36"; rrect(-52, -62, 52, 22, 6);
  limb([14, -32, 44 + a * 14, -14, 80 + a * 24, -6], 11, coat); g.fillStyle = skin; circle(80 + a * 24, -6, 6);
  limb([14, -32, 40 + b * 14, -12, 72 + b * 24, -4], 11, coat); circle(72 + b * 24, -4, 6);
  g.fillStyle = skin; circle(42, -48, 17);
  g.fillStyle = hair; g.beginPath(); g.arc(40, -50, 18, Math.PI * 0.9, Math.PI * 1.9); g.fill();
  g.restore();
}

// Side-on cutaway of the tunnel; cam scrolls the walls past
function tunnelSide(cam) {
  g.fillStyle = "#0e0905"; g.fillRect(0, 0, W, H);
  const ceil = x => 250 + 18 * Math.sin((x + cam) / 90) + 8 * Math.sin((x + cam) / 31);
  const flr = x => 520 + 12 * Math.sin((x + cam) / 120 + 1);
  g.fillStyle = "#2e1f14"; g.beginPath(); g.moveTo(0, ceil(0));
  for (let x = 0; x <= W; x += 20) g.lineTo(x, ceil(x));
  for (let x = W; x >= 0; x -= 20) g.lineTo(x, flr(x));
  g.closePath(); g.fill();
  const r = rng(61);
  for (let i = 0; i < 40; i++) { const x = wrapf(i * 97 - cam * 0.9, 3880) - 100, y = r() < 0.5 ? 150 + r() * 80 : 560 + r() * 120; g.fillStyle = "#1c130c"; ellipse(x, y, 14 + r() * 20, 8 + r() * 10); }
  g.strokeStyle = "#3a2a1a"; g.lineWidth = 3;
  for (let i = 0; i < 16; i++) { const x = wrapf(i * 151 - cam, 2416) - 100; g.beginPath(); g.moveTo(x, ceil(x) - 4); g.quadraticCurveTo(x + 10, ceil(x) + 30, x - 6, ceil(x) + 50 + (i % 3) * 14); g.stroke(); }
  // the back wall is scratched all the way along
  for (let i = 0; i < 14; i++) {
    const x = wrapf(i * 190 - cam, 2660) - 120, y = 330 + (i % 3) * 40;
    g.strokeStyle = "rgba(12,7,4,.8)"; g.fillStyle = "rgba(12,7,4,.8)"; g.lineWidth = 3;
    if (i % 3 === 0) { for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 10, y); g.lineTo(x + k * 10 + 3, y + 40); g.stroke(); } g.beginPath(); g.moveTo(x - 6, y + 30); g.lineTo(x + 40, y + 6); g.stroke(); }
    else if (i % 3 === 1) { g.font = "900 44px \"Courier New\", monospace"; g.fillText("07", x, y + 36); }
    else { g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x + 50, y + 20); g.moveTo(x + 36, y + 8); g.lineTo(x + 50, y + 20); g.lineTo(x + 36, y + 32); g.stroke(); }
  }
}

// Muzzle flash, one frame: the tunnel behind him packed with faces
function facesFlash(t) {
  tunnelPOV(t, { flash: true });
  const cx = 640, cy = 400;
  for (let d = 12; d >= 1; d--) {
    const sc = 1.25 / (d * 0.42 + 0.4), n = Math.ceil(5 / sc) + 2;
    for (let j = -n; j <= n; j++) {
      const hx = cx + j * 92 * sc + (d % 2) * 46 * sc, hy = cy + 80 * sc + Math.sin(j * 2.1 + d) * 10 * sc;
      if (Math.abs(hx - cx) > 760 * sc + 60) continue;
      g.fillStyle = "#151313"; ellipse(hx, hy + 70 * sc, 64 * sc, 46 * sc); ellipse(hx, hy, 34 * sc, 46 * sc);
      g.fillStyle = "#bff8e8"; circle(hx - 11 * sc, hy - 6 * sc, 3.5 * sc); circle(hx + 11 * sc, hy - 6 * sc, 3.5 * sc);
    }
  }
}

const tubesAt = t => [0, 1, 2, 3, 4, 5].map(i => { const s = 40.15 + i * 0.22; return t >= s && !(t > s + 0.06 && t < s + 0.12); });

// Subjects 08–12, each on its own rhythm
const OTHERS = [[72, 0.1], [84, 0.5], [96, 0.3], [66, 0.8], [110, 0.6]];

function monitorWall(lt, t) {
  g.fillStyle = "#1a1e1e"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) {
    const c = i % 4, r = Math.floor(i / 4), x = 110 + c * 270, y = 110 + r * 190, n = i + 1, flat = n <= 6, mine = n === 7;
    g.fillStyle = "#0b0f0e"; rrect(x - 8, y - 8, 266, 166, 10);
    g.fillStyle = "#04140c"; g.fillRect(x, y, 250, 150);
    typed(`SUBJECT ${String(n).padStart(2, "0")}`, x + 10, y + 24, 15, flat ? "#3a7a5a" : "#7affc0");
    if (flat) { trace(x, y, 250, 150, null, t, "#2a6a4a"); typed("FLAT", x + 190, y + 24, 15, "#d0473a"); }
    else {
      const ph = mine ? phaseAt : (tt => tt * OTHERS[n - 8][0] / 60 + OTHERS[n - 8][1]);
      trace(x, y, 250, 150, ph, t, mine ? "#a8fff0" : "#6aff9a");
      typed(mine ? `${Math.round(bpmAt(t))} BPM` : `${OTHERS[n - 8][0]} BPM`, x + 160, y + 140, 14, mine ? "#a8fff0" : "#6aff9a");
    }
    if (mine) { g.strokeStyle = `rgba(95,227,192,${0.5 + 0.5 * heartbeat(t)})`; g.lineWidth = 4; g.strokeRect(x - 10, y - 10, 270, 170); glow(x + 125, y + 75, 220, TEAL, 0.2); }
  }
  g.fillStyle = "rgba(255,255,255,.03)"; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
}

// Console at the far end: someone in a chair, back to us, headset on
function consoleRoom(t, o = {}) {
  bunker(t, [1, 1, 1, 1, 1, 1]);
  fill("#0b1418", 0.45, "multiply");
  g.fillStyle = "#2a3032"; g.fillRect(200, 470, 880, 40); g.fillStyle = "#1c2022"; g.fillRect(220, 510, 840, 200);
  for (let i = 0; i < 4; i++) { const x = 250 + i * 210; g.fillStyle = "#0b0f0e"; rrect(x, 300, 180, 140, 8); g.fillStyle = "#05140d"; g.fillRect(x + 10, 310, 160, 110); trace(x + 10, 310, 160, 110, i === 1 ? phaseAt : (tt => tt * (70 + i * 9) / 60), t, i === 1 ? "#a8fff0" : "#5adf8a"); }
  g.fillStyle = "#0e1a16"; rrect(470, 440, 340, 26, 4);
  typed("TX · CH 07 · LIVE", 490, 460, 16, "#ff6a5a");
  revolver(950, 462, 0.9, { rot: 0.1 });
  const sc = o.scale || 1;
  g.save(); g.translate(640, 640); g.scale(sc, sc);
  g.fillStyle = "#1a1d20"; rrect(-120, -330, 240, 330, 30);
  g.fillStyle = "#c99572"; g.fillRect(-14, -372, 28, 40);
  g.fillStyle = "#2a1d16"; circle(0, -400, 46);
  g.strokeStyle = "#111"; g.lineWidth = 8; g.beginPath(); g.arc(0, -404, 50, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.fillStyle = "#111"; ellipse(-50, -392, 12, 20); ellipse(50, -392, 12, 20);
  g.fillStyle = "#3b475a"; g.fillRect(118, -200, 110, 34);
  g.fillStyle = "#c99572"; ellipse(236, -183, 22, 15);
  glow(180, -183, 70, TEAL, 0.25 + 0.6 * heartbeat(t));
  g.restore();
}

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
const ledRed = t => t >= RED_AT;

const SHOTS = [
  { a: 0, b: 1.6, name: "Cold open", desc: "Black. One heartbeat. The walkie's LED, teal for three episodes, snaps to red.", draw(lt, t) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = 0.5; walkie(640, 420, 2.4, { led: ledRed(t) ? 1 : heartbeat(t) * 0.8, red: ledRed(t) }); g.restore();
    fill("#000", 0.55);
    if (ledRed(t)) glow(655, 225, 260, "rgba(255,60,50,1)", 0.35);
  } },
  { a: 1.6, b: 4.2, name: "They heard", desc: "CU walkie, red LED. Ward: \"They heard the shot.\"", draw(lt, t) {
    floorboards(70);
    walkie(640, 400, 2.2, { led: 1, red: true, talk: voiceActive(t), t, rot: 0.2 });
    flashlight(640, 400, 420);
    glow(660, 230, 300, "rgba(255,60,50,1)", 0.25);
  } },
  { a: 4.2, b: 6.4, name: "The field wakes", vx: lt => lerp(560, 760, lt / 2.2), desc: "Every eye in the field snaps open at once and the field moves on the house.", draw(lt, t) {
    const shake = Math.sin(t * 40) * 3;
    g.save(); g.translate(shake, 0); const z = 1 + lt * 0.05; g.translate(640, 380); g.scale(z, z); g.translate(-640, -380);
    g.fillStyle = vgrad(0, 360, ["#03050c", "#101a33"]); g.fillRect(-40, -40, W + 80, 420);
    glow(1010, 110, 240, "rgba(150,170,230,1)", 0.25); g.fillStyle = "#e6ecf6"; circle(1010, 110, 30);
    g.fillStyle = "#0a101e"; g.fillRect(-40, 340, W + 80, 420);
    const r = rng(41), go = seg(lt, 0.15, 2.2);
    cornRow(378, 46, "#0d1526", t * 5, 1);
    for (let i = 0; i < 46; i++) {
      const x = r() * W, y0 = 350 + r() * 160, s = 0.6 + (y0 - 350) / 160 * 0.8, y = y0 + go * 120 * s, k = s * (1 + go * 0.6);
      const open = ease(seg(lt, 0.12, 0.18));
      if (open <= 0) continue;
      const a = (0.4 + 0.6 * heartbeat(t)) * open;
      for (const dx of [-7, 7]) { g.fillStyle = `rgba(175,255,232,${a})`; ellipse(x + dx * k, y, 3.4 * k, 2.3 * k * open); glow(x + dx * k, y, 16 * k, TEAL, 0.5 * a); }
    }
    cornRow(530, 130, "#070c17", t * 6, 3);
    g.restore();
    g.fillStyle = "#04060c"; g.fillRect(0, 600, W, 16); for (let x = 10; x < W; x += 64) g.fillRect(x, 616, 12, 120); g.fillRect(70, 0, 40, 720);
    fill("#0b1530", 0.2, "multiply");
    stamp("1:30", lt - 0.1);
  } },
  { a: 6.4, b: 8, name: "Window rattles", desc: "Shapes crowd the boarded window; the frame rattles.", draw(lt, t) {
    g.save(); g.translate(Math.sin(t * 55) * 4, Math.cos(t * 47) * 2);
    boardedWindow(lt, t, { boards: [[640, 260, -0.12, 1], [640, 380, 0.1, 1]], figures: [[520, 1.5], [640, 1.7], [760, 1.45], [600 + Math.sin(t * 3) * 40, 1.25]], hand: 0.6 });
    g.restore();
  } },
  { a: 8, b: 9.4, name: "The hole", desc: "Top-down. He drops the torch into the hole: it lands on dirt.", draw(lt, t) {
    floorboards(70);
    g.fillStyle = "#020101";
    g.beginPath(); g.moveTo(470, 300); g.lineTo(560, 270); g.lineTo(700, 290); g.lineTo(820, 280); g.lineTo(800, 470); g.lineTo(650, 490); g.lineTo(490, 460); g.closePath(); g.fill();
    const fall = seg(lt, 0.1, 0.85);
    if (fall < 1) torch(640, lerp(240, 380, fall), lt * 9, lerp(1.7, 0.25, fall));
    if (lt > 0.85) { glow(650, 390, 110, "rgba(255,225,170,1)", 0.5); g.fillStyle = "rgba(120,80,40,.6)"; ellipse(650, 400, 70, 30); }
    flashlight(640, 380, 460);
  } },
  { a: 9.4, b: 11.2, name: "Down", desc: "Cutaway: he lowers himself through the floor into the tunnel below.", draw(lt, t) {
    g.fillStyle = "#0b0805"; g.fillRect(0, 0, W, 300);
    g.fillStyle = "#1a120b"; g.fillRect(0, 330, W, 390);
    g.fillStyle = "#2e1f14"; g.fillRect(0, 470, W, 180);
    glow(760, 600, 300, "rgba(255,220,160,1)", 0.35);
    torch(780, 630, 0.1, 0.7);
    person(640, lerp(300, 650, ease(seg(lt, 0.1, 1.5))), 1.35, { coat: "#3b475a", pack: true, eye: false });
    g.fillStyle = "#33231a"; g.fillRect(0, 300, 560, 30); g.fillRect(720, 300, W - 720, 30);
    g.fillStyle = "#1a120b"; g.fillRect(0, 330, 560, 140); g.fillRect(720, 330, W - 720, 140);
    fill("#000", 0.25);
  } },
  { a: 11.2, b: 12.6, name: "The door gives", vx: 960, desc: "Above: the front door bangs; the dresser shrieks across the floor.", draw(lt, t) {
    const bangs = [0.1, 0.55, 1.0], since = Math.min(...bangs.map(b => lt >= b ? lt - b : 9));
    const sh = Math.exp(-since * 14) * 9;
    g.save(); g.translate(Math.sin(t * 80) * sh, 0);
    frontWall(t, { dresser: 870 - seg(lt, 1.0, 1.3) * 40 });
    if (lt > 1.0) { g.strokeStyle = "#0a0608"; g.lineWidth = 4; g.beginPath(); g.moveTo(960, 170); g.lineTo(940, 260); g.lineTo(975, 330); g.lineTo(950, 420); g.stroke(); }
    const r = rng(4); g.fillStyle = "rgba(160,150,140,.4)";
    for (let i = 0; i < 20; i++) circle(860 + r() * 220, 160 + ((r() * 300 + since * 260) % 400), 2);
    g.restore();
  } },
  { a: 12.6, b: 16, name: "The crawl", desc: "Side-on, tracking: he crawls the tunnel by torchlight.", draw(lt, t) {
    tunnelSide(lt * 140);
    crawler(460, 515, 1.4, t * 6);
    if (lampOn(t)) flashlight(800, 420, 420); else fill("#000", 0.92);
  } },
  { a: 16, b: 17.6, name: "The walls", desc: "CU dirt wall: tally marks and 07 carved over and over.", draw(lt, t) {
    g.fillStyle = "#3a2818"; g.fillRect(0, 0, W, H);
    const r = rng(13);
    for (let i = 0; i < 60; i++) { g.fillStyle = r() < 0.5 ? "#2e1f12" : "#45301c"; ellipse(r() * W, r() * H, 10 + r() * 30, 6 + r() * 16); }
    g.strokeStyle = "rgba(14,8,4,.85)"; g.fillStyle = "rgba(14,8,4,.85)"; g.lineWidth = 4;
    for (let i = 0; i < 22; i++) {
      const x = r() * W, y = r() * H, rot = (r() - 0.5) * 0.6, size = 40 + r() * 70;
      g.save(); g.translate(x, y); g.rotate(rot);
      if (i % 2) { g.font = `900 ${size}px "Courier New", monospace`; g.fillText("07", 0, 0); }
      else { for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(k * 12, -30); g.lineTo(k * 12 + 4, 20); g.stroke(); } g.beginPath(); g.moveTo(-8, 10); g.lineTo(48, -18); g.stroke(); }
      g.restore();
    }
    flashlight(lerp(200, 1080, lt / 1.6), 360, 360);
  } },
  { a: 17.6, b: 20.4, name: "Ahead", desc: "POV down the tunnel; the torch stutters.", draw(lt, t) {
    tunnelPOV(t, { dy: Math.sin(t * 7) * 6 });
    if (lampOn(t)) flashlight(640, 420, 460); else fill("#000", 0.95);
    stamp("0:52", lt - 0.1);
  } },
  { a: 20.4, b: 22, name: "Behind", desc: "POV back the way he came. A thump. Dust. Two teal eyes in the dark.", draw(lt, t) {
    tunnelPOV(t);
    fill("#000", 0.75);
    glow(640, 380, 60, "rgba(200,190,170,1)", 0.25);
    if (lt > 0.2) { const r = rng(9); g.fillStyle = "rgba(180,170,150,.5)"; for (let i = 0; i < 30; i++) circle(620 + r() * 40, 360 + ((r() * 30 + (lt - 0.2) * 60) % 60), 1.2); }
    if (lt > 0.8) for (const dx of [-5, 5]) { g.fillStyle = `rgba(175,255,232,${0.6 + 0.4 * heartbeat(t)})`; circle(640 + dx, 392, 2); glow(640 + dx, 392, 12, TEAL, 0.5); }
  } },
  { a: 22, b: 26, name: "Faster", desc: "Tracking: he crawls faster; something drags behind him.", draw(lt, t) {
    g.save(); g.translate(Math.sin(t * 23) * 3, Math.cos(t * 19) * 3);
    tunnelSide(400 + lt * 230);
    crawler(560, 515, 1.4, t * 10);
    if (lt > 2.3) { const x = lerp(-80, 120, ease(seg(lt, 2.3, 4))); g.fillStyle = "#6d736c"; ellipse(x, 500, 40, 18); for (let i = 0; i < 4; i++) ellipse(x + 36, 486 + i * 9, 18, 5); }
    g.restore();
    if (lampOn(t)) flashlight(860, 420, 440); else fill("#000", 0.92);
  } },
  { a: 26, b: 27.2, name: "The grab", desc: "CU. A grey hand clamps his ankle.", draw(lt, t) {
    g.fillStyle = "#1c130c"; g.fillRect(0, 0, W, H);
    g.save(); g.translate(Math.exp(-lt * 5) * Math.sin(t * 70) * 10, 0);
    g.fillStyle = "#23272f"; g.fillRect(560, 0, 200, 420);
    g.fillStyle = "#14161a"; rrect(520, 380, 300, 170, 30);
    const close = ease(seg(lt, 0.1, 0.3)), hx = lerp(200, 520, ease(seg(lt, 0, 0.2)));
    g.fillStyle = "#6d736c"; ellipse(hx, 330, 90, 60);
    for (let i = 0; i < 4; i++) { g.save(); g.translate(hx + 60, 290 + i * 26); g.rotate(lerp(-0.2, 0.9, close)); rrect(0, -11, 130, 22, 11); g.restore(); }
    g.strokeStyle = "rgba(95,227,192,.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - 80, 330); g.lineTo(hx + 30, 320); g.stroke();
    g.restore();
    flashlight(600, 330, 420);
  } },
  { a: 27.2, b: 28, name: "Roll and aim", desc: "He rolls onto his back and aims back down the tunnel.", draw(lt, t) {
    tunnelPOV(t, { dy: -20 });
    fill("#000", 0.6);
    gunHands(560, 540, 1.6, -0.08, t, 1.5);
  } },
  { a: 28, b: 28.35, name: "FLASH", desc: "Muzzle flash: the tunnel behind him packed with faces.", draw(lt, t) {
    facesFlash(t);
    fill("#fff8e8", Math.max(0, 0.5 - lt * 3), "lighter");
  } },
  { a: 28.35, b: 29.6, name: "One left", desc: "Black, then the cylinder: one spent, one live.", draw(lt, t) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (lt < 0.25) return;
    const rot = -ease(seg(lt, 0.7, 0.85)) * Math.PI / 3;
    cylinderFace(640, 360, 210, [true, true, false, false, false, false], rot);
    const [x, y] = chamberAt(0, 210, rot); g.fillStyle = "#3a2a12"; circle(640 + x, 360 + y, 210 * 0.08);
    flashlight(640, 360, 520);
  } },
  { a: 29.6, b: 33, name: "Don't stop", desc: "Tracking: desperate crawl. Ward: \"Don't stop. Whatever you hear.\"", draw(lt, t) {
    g.save(); g.translate(Math.sin(t * 29) * 4, Math.cos(t * 23) * 3);
    tunnelSide(1400 + lt * 260);
    crawler(600, 515, 1.4, t * 12);
    g.restore();
    if (lampOn(t)) flashlight(900, 420, 440); else fill("#000", 0.92);
  } },
  { a: 33, b: 35.2, name: "The hatch", desc: "The tunnel ends at a steel hatch: PROJECT ECHO — 07.", draw(lt, t) {
    hatch(t);
    if (lampOn(t)) flashlight(640, 390, 520); else fill("#000", 0.9);
    stamp("0:17", lt - 0.1);
  } },
  { a: 35.2, b: 36.4, name: "Dark", desc: "The torch dies. Only his mark and the scanner plate glow.", draw(lt, t) {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (lampOn(t)) { hatch(t); flashlight(640, 390, 520 * (0.6 + 0.4 * Math.abs(Math.sin(t * 97)))); return; }
    const hb = heartbeat(t);
    g.fillStyle = `rgba(95,227,192,${0.15 + 0.35 * hb})`; rrect(692, 432, 72, 96, 6); glow(728, 480, 140, TEAL, 0.2 + 0.35 * hb);
    const y = lerp(760, 560, ease(seg(lt, 0.8, 1.2)));
    glow(560, y, 90 + 40 * hb, TEAL, 0.5 + 0.4 * hb); g.fillStyle = `rgba(215,255,242,${0.5 + 0.5 * hb})`; circle(560, y, 4);
  } },
  { a: 36.4, b: 38, name: "The plate", vx: MARK.x, desc: "CU forearm, Part 1's framing, pressed to the plate. It turns white.", mark: true, draw(lt, t) {
    const acc = ease(seg(lt, 0.8, 1.0));
    drawForearm({ grade: "night", glow: 0.75, pulse: 0.8 * heartbeat(t) + acc, rub: 0, sleeve: 0 });
    g.save(); g.beginPath(); g.rect(0, 0, W, H); forearmPath(); g.clip("evenodd");
    g.fillStyle = "#15181a"; rrect(MARK.x - 150, MARK.y - 190, 300, 380, 14);
    g.fillStyle = acc > 0 ? `rgba(240,255,250,${0.5 + 0.5 * acc})` : `rgba(95,227,192,${0.2 + 0.5 * heartbeat(t)})`; rrect(MARK.x - 120, MARK.y - 160, 240, 320, 8);
    g.restore();
    if (acc > 0) fill("#f0fffa", 0.25 * acc, "lighter");
  } },
  { a: 38, b: 40, name: "Bolts", desc: "CLANG, CLANG, CLANG. The hatch swings open on white light.", draw(lt, t) {
    hatch(t, { bolts: seg(lt, 0, 1.0), accept: 1, open: ease(seg(lt, 1.2, 1.9)) });
    fill("#000", 0.35 * (1 - seg(lt, 1.2, 1.9)));
  } },
  { a: 40, b: 44, name: "The bunker", desc: "Fluorescents stutter on: a white lab under the farm, empty beds with restraints.", draw(lt, t) {
    bunker(t, tubesAt(t));
    g.fillStyle = "#0a0c0c"; g.fillRect(0, 0, 90, H); g.fillRect(W - 90, 0, 90, H); g.fillRect(0, 0, W, 50);
    person(300, 800, 3.0, { coat: "#0a0c0e", pants: "#0a0c0e", skin: "#0a0c0e", hair: "#0a0c0e", eye: false });
  } },
  { a: 44, b: 48, name: "Twelve", vx: lt => lerp(640, 775, ease(seg(lt, 0.5, 3.5))), desc: "The monitor wall. 01–06 flat. 07 racing: his. 08–12 still beating.", draw(lt, t) {
    const z = 1 + ease(seg(lt, 0.5, 4)) * 0.25;
    g.save(); g.translate(775, 375); g.scale(z, z); g.translate(-775, -375);
    monitorWall(lt, t);
    g.restore();
  } },
  { a: 48, b: 51.6, name: "The console", desc: "Far end: someone at a radio console, back to us. A revolver on the desk.", draw(lt, t) {
    consoleRoom(t, { scale: 0.55 + lt * 0.02 });
    stamp("0:03", lt - 0.1);
  } },
  { a: 51.6, b: 54, name: "Closer", desc: "Push in on the chair. His gun comes up into frame. Two heartbeats, in sync.", draw(lt, t) {
    consoleRoom(t, { scale: lerp(0.75, 1.05, ease(lt / 2.4)) });
    gunHands(260, lerp(900, 600, ease(seg(lt, 0.3, 1.6))), 1.4, -0.05, t, 1);
  } },
  { a: 54, b: 54.9, name: "The turn", desc: "The chair turns.", draw(lt, t) {
    consoleRoom(t, { scale: 1.05 });
    fill("#000", 0.1 * seg(lt, 0.4, 0.9));
  } },
  { a: 54.9, b: 57.6, name: "Hello, Seven", desc: "CU: it's Daniel. Teal eyes. Ward, in the room, unfiltered: \"Hello, Seven.\"", draw(lt, t) {
    g.fillStyle = "#0e1416"; g.fillRect(0, 0, W, H);
    glow(640, 300, 700, "rgba(200,230,225,1)", 0.15);
    const talk = voiceActive(t) ? 0.12 + 0.15 * Math.abs(Math.sin(t * 17)) : 0;
    face({ eye: 1, brow: 0, worry: 0, smile: talk ? 0 : 0.3, mouth: talk, look: [0, 0], k: 1.3, dy: opts.vert ? -70 : 40, iris: "#5fe3c0", irisGlow: 0.35 + 0.35 * heartbeat(t) });
    const hy = opts.vert ? -110 : 0;
    g.strokeStyle = "#111"; g.lineWidth = 16; g.beginPath(); g.arc(640, 210 + hy, 270, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.fillStyle = "#111"; ellipse(388, 400 + hy, 30, 52); ellipse(892, 400 + hy, 30, 52);
    fill("#0e2a2a", 0.25, "multiply");
  } },
  { a: 57.6, b: 59, name: "Mirror", desc: "Split two-shot: Daniel and his double, barrel to barrel, one round each. Both hammers click. Hard cut.", draw(lt, t) {
    mirrorTwoShot(t, lt > 1.0 ? Math.exp(-(lt - 1.0) * 20) * 5 : 0);
  } },
  titleShot(59, 60),
];
SHOTS.forEach((s, i) => s.n = String(i + 1).padStart(2, "0"));

// Ward only: three walkie lines, then one in the room. Clips from vo/part-04.js (tools/build_vo.py).
const VO = [
  { id: "ward1", a: 1.8, who: "WARD (walkie)", text: "They heard the shot.", radio: true },
  { id: "ward2", a: 4.9, who: "WARD (walkie)", text: "Ninety seconds. Go down... under the floor.", radio: true },
  { id: "ward3", a: 29.8, who: "WARD (walkie)", text: "Don't stop. Whatever you hear.", radio: true },
  { id: "ward4", a: 55.1, who: "WARD", text: "Hello... Seven." },
];
VO.forEach(v => { v.b = v.a + (window.VO_DATA?.[v.id]?.dur ?? 2.5) + 0.2; });

const MARK_FRAMES = [
  { label: "PART 1 · SH02 · PLANT", draw: () => drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: 0, sleeve: 0 }) },
  { t: 36.8, label: "PART 4 · SH20 · 00:36:19 · THE PLATE" },
];
const MARK_NOTE = "Part 4's scanner insert (SH20) reuses Part 1's arm framing unchanged.";

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
// the heartbeat: one clock, getting faster; doubled once the second Daniel is in the room
for (const b of BEATS) {
  if (b > 59) break;
  // the room holds its breath for "Hello... Seven."
  const hush = b >= 54.95 && b < 56.9 ? 0.25 : 1;
  const v = lerp(0.16, 0.32, seg(b, 1.6, 54)) * hush, dub = periodAt(b) * 0.27, both = b >= 48;
  at(b, w => { tone(w, { f: 62, dur: 0.16, v }); if (both) tone(w, { f: 66, dur: 0.16, v: v * 0.8 }); });
  at(b + dub, w => { tone(w, { f: 55, dur: 0.14, v: v * 0.65 }); if (both) tone(w, { f: 59, dur: 0.14, v: v * 0.5 }); });
}
at(RED_AT, w => tone(w, { f: 880, f2: 440, dur: 0.25, v: 0.08, type: "square" }));
bed(1.6, 4.4, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2600, 0.8), gn, bus); bedEnv(gn, w, dur, 0.025, 0.2, 0.3); });
// the field: corn thrashing, glass rattling
bed(4.3, 8.0, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.08);
  lfo.frequency.value = 11; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("bandpass", 900, 0.7), gn, bus); bedEnv(gn, w, dur, 0.16, 0.05, 0.3);
});
for (let s = 6.4; s < 8.0; s += 0.06) at(s, w => hit(w, { f: 3800, q: 6, dur: 0.02, v: 0.08 }));
// down the hole
at(8.1, w => hit(w, { f: 600, type: "lowpass", dur: 0.7, v: 0.08 }));
at(8.9, w => { tone(w, { f: 120, f2: 60, dur: 0.2, v: 0.3 }); hit(w, { f: 500, type: "lowpass", dur: 0.2, v: 0.25 }); });
bed(9.4, 35.2, breathing(0.75, 0.07, 1000));
// the door above
for (const s of [11.3, 11.75, 12.2]) at(s, w => { tone(w, { f: 80, f2: 40, dur: 0.4, v: 0.7 }); hit(w, { f: 700, type: "lowpass", dur: 0.3, v: 0.5 }); });
at(12.2, w => hit(w, { f: 2500, type: "highpass", dur: 0.3, v: 0.25 }));
bed(12.2, 12.6, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 900), gn, bus); bedEnv(gn, w, dur, 0.2, 0.02, 0.1); });
// crawling: dirt scrapes in rhythm, quicker as he goes
for (let s = 12.7; s < 33; s += s < 22 ? 0.42 : s < 29.6 ? 0.3 : 0.24) at(s, w => hit(w, { f: 700, type: "lowpass", dur: 0.12, v: 0.16 }));
for (const [s, d] of FLICKS) if (s < 40) at(s, w => hit(w, { f: 5000, q: 6, dur: 0.015, v: 0.15 }));
// something behind: the thump, then dragging that gets closer
at(20.6, w => { tone(w, { f: 70, f2: 40, dur: 0.4, v: 0.5 }); hit(w, { f: 400, type: "lowpass", dur: 0.4, v: 0.35 }); });
bed(21.2, 26.0, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.05);
  lfo.frequency.value = 2.2; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("lowpass", 500), gn, bus); gn.gain.setValueAtTime(lerp(0.02, 0.14, off / 4.8), w); gn.gain.linearRampToValueAtTime(0.16, w + dur);
});
// the grab, the shot, shrieks
at(26.1, w => { tone(w, { f: 180, f2: 90, dur: 0.3, v: 0.4, type: "sawtooth" }); hit(w, { f: 3000, type: "highpass", dur: 0.2, v: 0.25 }); });
at(28.0, w => { hit(w, { f: 6000, type: "highpass", dur: 0.12, v: 0.45 }); hit(w, { f: 1500, type: "lowpass", dur: 0.6, v: 0.45 }); tone(w, { f: 60, f2: 30, dur: 0.8, v: 0.45 }); });
bed(28.1, 31.0, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.frequency.value = 4100; chain(o, gn, bus); gn.gain.setValueAtTime(0.04, w); gn.gain.linearRampToValueAtTime(0, w + dur); o.start(w); o.stop(w + dur); });
for (const s of [28.5, 29.0, 29.9, 30.6, 31.5, 32.3]) bed(s, s + 0.7, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.06);
  lfo.frequency.value = 23; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("bandpass", 1300, 3), gn, bus); bedEnv(gn, w, dur, 0.1, 0.05, 0.4);
});
at(29.05, w => hit(w, { f: 4200, q: 6, dur: 0.02, v: 0.2 }));
// the hatch, the plate, the bolts
bed(33, 38, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.frequency.value = 120; chain(o, filt("lowpass", 400), gn, bus); bedEnv(gn, w, dur, 0.04, 0.4, 0.1); o.start(w); o.stop(w + dur); });
for (let s = 35.4; s < 38; s += 0.15) at(s, w => hit(w, { f: 1100, q: 2, dur: 0.06, v: 0.12 }));
at(37.2, w => { tone(w, { f: 660, dur: 0.15, v: 0.1 }); tone(w + 0.15, { f: 990, dur: 0.3, v: 0.1 }); });
for (const s of [38.05, 38.4, 38.75]) at(s, w => { tone(w, { f: 140, f2: 70, dur: 0.35, v: 0.55 }); [900, 1400].forEach(f => tone(w, { f, dur: 0.4, v: 0.05, type: "triangle" })); });
at(39.2, w => hit(w, { f: 3000, type: "highpass", dur: 0.8, v: 0.18 }));
// the bunker: fluorescent buzz, twelve monitors, banging behind him, then nothing
bed(40.1, 48, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.type = "sawtooth"; o.frequency.value = 120; chain(o, filt("bandpass", 240, 3), gn, bus); bedEnv(gn, w, dur, 0.03, 0.1, 0.05); o.start(w); o.stop(w + dur); });
for (let i = 0; i < 6; i++) at(40.15 + i * 0.22, w => hit(w, { f: 2500, q: 5, dur: 0.03, v: 0.12 }));
bed(44, 48, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.frequency.value = 1000; chain(o, gn, bus); bedEnv(gn, w, dur, 0.012, 0.05, 0.05); o.start(w); o.stop(w + dur); });
for (const [bpm, off] of OTHERS) for (let s = 44 + off * 0.6; s < 48; s += 60 / bpm) at(s, w => tone(w, { f: 1320 + bpm, dur: 0.06, v: 0.025 }));
for (let s = 41; s < 48; s += 0.62) at(s, w => { tone(w, { f: 90, f2: 50, dur: 0.25, v: 0.25 }); hit(w, { f: 600, type: "lowpass", dur: 0.15, v: 0.15 }); });
// the turn, the voice, the hammers, the cut
at(54.15, w => tone(w, { f: 160, f2: 220, type: "sawtooth", dur: 0.6, v: 0.03 }));
at(58.6, w => { hit(w, { f: 3200, q: 5, dur: 0.03, v: 0.4 }); hit(w + 0.012, { f: 3400, q: 5, dur: 0.03, v: 0.4 }); tone(w, { f: 900, dur: 0.05, v: 0.06 }); });
at(59.05, w => tone(w, { f: 45, f2: 28, dur: 0.95, v: 0.35 }));
