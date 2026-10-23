"use strict";
// Part 1 "The Last Broadcast": shots, voice cues and sound cues.
// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
const SHOTS = [
  { a: 0, b: 3, name: "Eye opens", vx: 640, desc: "ECU, black to pre-dawn. Breathing, clock.", draw(lt) {
    g.fillStyle = "#3b3740"; g.fillRect(0, 0, W, H);
    let open = ease(seg(lt, 0.5, 1.7));
    if (lt > 2.05 && lt < 2.3) open *= 0.1;
    g.save(); g.translate(640, 370);
    g.fillStyle = "#4a3e3c"; ellipse(0, -10, 520, 230);
    g.save(); g.beginPath(); g.ellipse(0, 0, 440, Math.max(1, 175 * open), 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#e6ded2"; g.fillRect(-460, -200, 920, 400);
    g.strokeStyle = "rgba(170,60,60,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(-420 + (i % 2) * 840, -40 + i * 12); g.quadraticCurveTo(-300 + (i % 2) * 600, i * 8, -230 + (i % 2) * 460, 10); g.stroke(); }
    const gr = g.createRadialGradient(0, 0, 20, 0, 0, 150); gr.addColorStop(0, "#8a5a32"); gr.addColorStop(1, "#3c2412");
    g.fillStyle = gr; circle(0, 0, 150);
    g.fillStyle = "#0a0605"; circle(0, 0, lerp(78, 54, seg(lt, 1.2, 2.8)));
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(40, -80, 34, 44);
    g.restore();
    g.strokeStyle = "#2a201e"; g.lineWidth = 10;
    g.beginPath(); g.ellipse(0, 0, 446, Math.max(1, 180 * open), 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.ellipse(0, -40, 470, 200, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.restore();
    fill("#3f5a8e", 0.42, "multiply");
    fill("#000", 1 - seg(lt, 0, 0.9));
  } },
  { a: 3, b: 5, name: "Puncture mark", vx: MARK.x, desc: "CU forearm. Mark plant: rub, shrug, sleeve down.", mark: true, draw(lt) {
    drawForearm({ grade: "dawn", glow: 0, pulse: 0, rub: seg(lt, 0.85, 0.95) * (1 - seg(lt, 1.35, 1.45)), rubPhase: lt, sleeve: ease(seg(lt, 1.45, 1.95)) });
  } },
  { a: 5, b: 12, name: "Ordinary morning", vx: lt => keys(lt, [[0, 380], [1.6, 380], [3.0, 800], [4.8, 800], [6, 1010]]), desc: "WS apartment. Coffee, TV glance, skyline.", draw(lt, t) {
    const reach = lt < 2.6 ? ease(seg(lt, 0.4, 1.2)) * (1 - ease(seg(lt, 2.0, 2.6))) : null;
    const mug = lt >= 2.6 ? ease(seg(lt, 3.6, 4.4)) * (1 - ease(seg(lt, 5.0, 5.6))) : null;
    apartment(t, { brew: true, px: lerp(800, 860, ease(seg(lt, 2.4, 3.2))), face: lt < 2.5 ? -1 : 1, reach, mug });
    stamp("DAY ONE", lt - 0.5, { small: true, out: 6.2 });
  } },
  { a: 12, b: 15, name: "Breaking news", vx: 640, desc: "CU TV. Zombie outbreak bulletin.", draw(lt, t) {
    g.fillStyle = "#0e0d0d"; g.fillRect(0, 0, W, H);
    const flick = lt < 0.9 ? (Math.floor(lt * 18) % 3 === 0 ? 1 : 0.6) : 0.08;
    if (opts.vert) { g.fillStyle = "#050505"; rrect(428, 176, 424, 249, 8); tvScreen(440, 188, 400, 225, t, { breaking: lt > 0.55, static: flick }); }
    else tvScreen(60, 40, 1160, 640, t, { breaking: lt > 0.55, static: flick });
    if (lt > 0.55) glow(640, 360, 700, "rgba(220,40,30,1)", 0.12);
  } },
  { a: 15, b: 18, name: "Sirens", vx: lt => keys(lt, [[0, 860], [1.0, 860], [2.3, 390]]), desc: "WS. Daniel frozen, mug halfway. Smoke rises.", draw(lt, t) {
    g.save(); const z = 1 + lt * 0.025; g.translate(640, 360); g.scale(z, z); g.translate(-640, -360);
    apartment(t, { breaking: true, smoke: ease(seg(lt, 0, 2.6)), mug: 0.55 });
    g.restore();
    fill("rgba(200,40,40,1)", 0.05 + 0.05 * Math.sin(t * 9) ** 2);
  } },
  { a: 18, b: 21.5, name: "DAY 2: power dies", vx: lt => lerp(420, 860, lt / 3.5), desc: "WS street, night. Lamps go dark one by one.", draw(lt) {
    g.fillStyle = vgrad(0, H, ["#060a16", "#121a2e"]); g.fillRect(0, 0, W, H);
    const r = rng(42);
    for (let x = -20; x < W;) {
      const w = 80 + r() * 120, h = 220 + r() * 260;
      g.fillStyle = "#0b1020"; g.fillRect(x, 520 - h, w, h);
      for (let wy = 520 - h + 20; wy < 500; wy += 34) for (let wx = x + 12; wx < x + w - 16; wx += 26) {
        const off = 1.4 + r() * 0.5;
        if (r() > 0.45 && lt < off) { g.fillStyle = "rgba(255,214,140,.7)"; g.fillRect(wx, wy, 10, 14); }
      }
      x += w + 6;
    }
    g.fillStyle = "#1a1d26"; g.fillRect(0, 520, W, 200);
    g.fillStyle = "#2a2d36"; g.fillRect(0, 520, W, 20);
    for (let i = 0; i < 5; i++) {
      const x = 160 + i * 240, off = 1.5 + i * 0.13;
      const flick = lt > off - 0.25 && lt < off ? (Math.floor(lt * 40 + i) % 2) : 1;
      const on = lt < off ? flick : 0;
      g.fillStyle = "#22252e"; g.fillRect(x - 4, 300, 8, 230); g.fillRect(x - 4, 300, 46, 7);
      g.fillStyle = on ? "#ffe3a0" : "#2c2f38"; rrect(x + 26, 304, 24, 10, 3);
      if (on) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22;
        const gr = g.createLinearGradient(0, 310, 0, 540); gr.addColorStop(0, "#ffd88a"); gr.addColorStop(1, "rgba(255,200,120,0)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(x + 30, 312); g.lineTo(x + 46, 312); g.lineTo(x + 130, 560); g.lineTo(x - 54, 560); g.fill(); g.restore();
      }
    }
    stamp("DAY 2", lt - 0.1);
  } },
  { a: 21.5, b: 24.6, name: "DAY 3: counting cans", vx: lt => lerp(330, 850, seg(lt, 0.35, 2.8)), desc: "MS counter, flashlight beam counts the cans.", draw(lt) {
    g.fillStyle = "#07090f"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#1b1611"; g.fillRect(0, 470, W, 250);
    g.fillStyle = "#2a221a"; g.fillRect(0, 456, W, 18);
    const idx = Math.min(6, Math.floor(seg(lt, 0.35, 2.8) * 7));
    const cx = 290 + lerp(0, 600, seg(lt, 0.35, 2.8));
    for (let i = 0; i < 7; i++) {
      const x = 290 + i * 100, hit = i <= idx;
      g.fillStyle = hit ? "#8a8f96" : "#2a2d33"; rrect(x - 30, 370, 60, 88, 6);
      g.fillStyle = hit ? ["#b8463c", "#3f6ea8", "#d8b04a", "#4c8c5a"][i % 4] : "#1d2026"; g.fillRect(x - 30, 392, 60, 40);
      g.fillStyle = hit ? "#a9aeb5" : "#30333a"; ellipse(x, 370, 30, 7);
    }
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    const gr = g.createRadialGradient(cx, 410, 10, cx, 410, 190); gr.addColorStop(0, "#fff4d6"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(150, 120); g.lineTo(cx + 150, 520); g.lineTo(cx - 150, 520); g.closePath(); g.fill(); g.restore();
    g.save(); g.translate(130, 110); g.rotate(Math.atan2(410 - 110, cx - 130) - Math.PI / 2);
    g.fillStyle = "#16181d"; rrect(-22, -150, 44, 160, 8); g.fillStyle = "#6b5040"; ellipse(0, -110, 40, 46);
    g.restore();
    stamp("DAY 3", lt - 0.1);
  } },
  { a: 24.6, b: 26.2, name: "DAY 5: two cans", vx: 610, desc: "CU cabinet opens on two cans.", draw(lt) {
    g.fillStyle = "#060709"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#2a1f17"; g.fillRect(300, 110, 680, 500);
    g.fillStyle = "#1a130e"; g.fillRect(320, 130, 640, 460);
    g.fillStyle = "#3a2b1f"; g.fillRect(320, 360, 640, 16);
    for (const x of [560, 650]) {
      g.fillStyle = "#8a8f96"; rrect(x - 30, 272, 60, 88, 6);
      g.fillStyle = x === 560 ? "#b8463c" : "#3f6ea8"; g.fillRect(x - 30, 294, 60, 40);
      g.fillStyle = "#a9aeb5"; ellipse(x, 272, 30, 7);
    }
    const o = ease(seg(lt, 0.1, 0.55));
    g.fillStyle = "#3d2d21";
    g.fillRect(300, 110, 340 * (1 - o) + 20 * o, 500); g.fillRect(980 - (340 * (1 - o) + 20 * o), 110, 340 * (1 - o) + 20 * o, 500);
    glow(610, 320, 300, "rgba(255,240,210,1)", 0.25 * o);
    fill("#000", 0.25);
    stamp("DAY 5", lt - 0.1);
  } },
  { a: 26.2, b: 28, name: "Scratching", vx: 640, desc: "MS front door. Scratching, rattle. He freezes.", draw(lt, t) {
    const sc = scratchAmount(t);
    door(0.78, sc * Math.sin(t * 90), t);
    // Daniel frozen in the foreground, breathing
    const sk = opts.vert ? 1.8 : 2.6;
    g.save(); g.translate(opts.vert ? 520 : 220, 760); const br = 1 + 0.012 * Math.sin(t * 6.5); g.scale(sk, sk * br);
    g.fillStyle = "#05070d"; ellipse(0, -150, 70, 120); circle(0, -270, 44);
    g.restore();
    stamp("DAY 5", 9);
  } },
  { a: 28, b: 32, name: "DAY 6: stairwell", vx: lt => lerp(780, stairX(lt), ease(seg(lt, 1.3, 1.9))), desc: "Clatter off right, infected turns; Daniel slips out.", draw(lt) {
    g.fillStyle = "#0a0c12"; g.fillRect(0, 0, W, H);
    glow(1180, 120, 340, "rgba(170,40,30,1)", 0.25);
    g.fillStyle = "#191c25"; g.beginPath(); g.moveTo(1280, 250); g.lineTo(1280, 300);
    for (let i = 0; i < 12; i++) { g.lineTo(1100 - i * 60, 300 + i * 25); g.lineTo(1100 - i * 60, 325 + i * 25); }
    g.lineTo(380, 720); g.lineTo(1280, 720); g.fill();
    g.fillStyle = "#151821"; g.fillRect(0, 600, W, 120);
    g.strokeStyle = "#2a2e3a"; g.lineWidth = 5; g.beginPath(); g.moveTo(1280, 230); g.lineTo(380, 580); g.stroke();
    // exit door bottom-left
    const open = ease(seg(lt, 3.0, 3.4));
    g.fillStyle = "#2a3020"; g.fillRect(70, 410, 140, 192);
    if (open > 0) {
      g.fillStyle = "#f2efe0"; g.fillRect(74, 414, 132 * open, 186);
      g.save(); g.globalAlpha = 0.35 * open; g.fillStyle = "#f6f0d8";
      g.beginPath(); g.moveTo(206, 414); g.lineTo(206, 600); g.lineTo(560, 720); g.lineTo(380, 720); g.fill(); g.restore();
    }
    g.fillStyle = "#3df58a"; g.font = "bold 18px system-ui"; g.fillText("EXIT", 116, 400);
    // corridor off right where the noise comes from
    g.fillStyle = "#1e2230"; g.fillRect(1180, 470, 100, 132);
    // infected: faces the stairs, turns toward the clatter and shambles right
    const turn = ease(seg(lt, 0.95, 1.35));
    const ix = 720 + ease(seg(lt, 1.4, 4)) * 260;
    person(ix, 602, 1.35, { pose: "hunch", facing: lerp(-1, 1, turn), coat: "#3d4a3e", skin: "#9aa38f", hair: "#1c1f1b", eyeGlow: true });
    // Daniel down the stairs, behind its back, to the exit
    const dx = stairX(lt), dy = lerp(300, 602, seg(lt, 1.25, 2.9));
    if (lt > 0.4) person(dx, dy, 1.25, { pose: "walk", phase: lt * 12, facing: -1, pack: true, coat: "#46546a" });
    fill("#0c1430", 0.35, "multiply");
    fill("#fffbe8", seg(lt, 3.55, 4));
    stamp("DAY 6", lt - 0.1);
  } },
  { a: 32, b: 35, name: "Highway", vx: lt => keys(lt, [[0, 420], [1.2, 420], [2.4, 600]]), desc: "Tracking shot. Highway streams past; Ashford falls away behind him.", draw(lt, t) {
    highwayShot(lt, t);
  } },
  { a: 35, b: 38, name: "DAY 8: farmhouse", vx: 590, desc: "Follow cam from behind, walking the track to the farmhouse.", draw(lt, t) {
    farmApproach(lt, t);
    stamp("DAY 8", lt - 0.1);
  } },
  { a: 38, b: 40, name: "DAY 9: still", vx: lt => keys(lt, [[0, 420], [0.5, 420], [1.7, 790]]), desc: "WS farmhouse interior. Rocking chair by the window, sunset.", draw(lt) {
    farmInterior(lt);
    stamp("DAY 9", lt - 0.1);
  } },
  { a: 40, b: 42, name: "First smile", desc: "CU Daniel, warm light. Finally still.", draw(lt) {
    planks(0, H, ["#7b4a2b", "#6f4227", "#84502e", "#744629"], "#4a2a17");
    fill(vgrad(0, H, ["rgba(0,0,0,0)", "rgba(30,15,5,.55)"]));
    face({ eye: 0.8, smile: ease(seg(lt, 0.5, 1.4)), look: [0.4, 0], k: 1.15, dy: 40 });
    fill("#ffb060", 0.18, "overlay");
    glow(1180, 200, 600, "rgba(255,190,110,1)", 0.25);
  } },
  { a: 42, b: 45, name: "Asleep", vx: lt => keys(lt, [[0, 560], [0.9, 560], [2.4, 1000]]), desc: "WS night. Radio crackles to life on its own.", draw(lt, t) {
    nightRoom(t, { daniel: "lie", radio: lt > 0.8 ? 0.15 + 0.85 * heartbeat(t) : 0 });
  } },
  { a: 45, b: 50, name: "The radio", vx: lt => lerp(700, 930, ease(seg(lt, 0, 4.5))), desc: "CU radio. Ward: \"Daniel Hayes...\"", draw(lt, t) {
    g.fillStyle = "#07090f"; g.fillRect(0, 0, W, H);
    const v = 1 + 0.004 * Math.sin(t * 70) * (voiceActive(t) ? 1 : 0);
    g.save(); g.translate(640, 380); g.scale(v, v);
    g.fillStyle = "#4a3322"; rrect(-520, -260, 1040, 520, 40);
    g.fillStyle = "#2c2118"; rrect(-470, -210, 600, 420, 18);
    g.strokeStyle = "rgba(90,70,50,.6)"; g.lineWidth = 2;
    for (let x = -460; x < 120; x += 10) { g.beginPath(); g.moveTo(x, -205); g.lineTo(x, 205); g.stroke(); }
    for (let y = -200; y < 210; y += 10) { g.beginPath(); g.moveTo(-465, y); g.lineTo(125, y); g.stroke(); }
    g.fillStyle = "#d8c89a"; rrect(190, -190, 280, 90, 8);
    g.strokeStyle = "#5a4a30"; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(205 + i * 19, -150); g.lineTo(205 + i * 19, -130 + (i % 2) * 6); g.stroke(); }
    g.strokeStyle = "#b8231b"; g.lineWidth = 4; g.beginPath(); g.moveTo(330 + Math.sin(t * 1.3) * 6, -185); g.lineTo(330 + Math.sin(t * 1.3) * 6, -105); g.stroke();
    g.fillStyle = "#1a1410"; circle(250, 110, 52); circle(410, 110, 52);
    const hb = heartbeat(t);
    g.fillStyle = `rgba(170,255,230,${0.35 + 0.65 * hb})`; circle(330, -30, 22);
    g.restore();
    glow(640 + 330, 350, 260, TEAL, 0.25 + 0.55 * hb);
    const r = rng(5 + Math.floor(t * 24)); g.fillStyle = "rgba(200,220,255,.12)";
    for (let i = 0; i < 18; i++) g.fillRect(0, r() * H, W, 1 + r() * 2);
    fill("#0b1530", 0.2, "multiply");
  } },
  { a: 50, b: 51.5, name: "Sits up", desc: "MS. He wakes, alarmed, looks at his arm.", draw(lt, t) {
    const up = ease(seg(lt, 0, 0.35));
    nightRoom(t, { daniel: up < 0.5 ? "lie" : "sit", radio: 0.15 + 0.85 * heartbeat(t), shift: (1 - up) * -40 });
  } },
  { a: 51.5, b: 54.2, name: "Mark glows", vx: MARK.x, desc: "CU forearm. Same framing as 00:03. Ward line 2.", mark: true, draw(lt, t) {
    drawForearm({ grade: "night", glow: 0.12 + 0.6 * ease(seg(lt, 0.2, 2.4)), pulse: 0.15 * heartbeat(t), rub: 0, sleeve: 0 });
  } },
  { a: 54.2, b: 55.2, name: "Recognition", desc: "CU Daniel. Dread.", draw(lt, t) {
    g.fillStyle = "#0a1022"; g.fillRect(0, 0, W, H);
    face({ eye: 1.15, brow: 0.4, worry: 1, frown: 0.8, look: [0.2, 0.9], k: 1.2 + lt * 0.04, dy: 30 });
    fill("#1a2a5a", 0.55, "multiply");
    glow(700, 760, 420, TEAL, 0.35 + 0.3 * heartbeat(t));
  } },
  { a: 55.2, b: 56, name: "Pulse", vx: MARK.x, desc: "CU forearm. The mark pulses once, brighter.", mark: true, draw(lt) {
    drawForearm({ grade: "night", glow: 0.72, pulse: Math.exp(-(((lt - 0.25) / 0.14) ** 2)), rub: 0, sleeve: 0 });
  } },
  { a: 56, b: 56.6, name: "Silence", desc: "MS. Radio light dies. Room tone only.", draw(lt, t) {
    nightRoom(t, { daniel: "sit", radio: 0, faceDir: -1 });
  } },
  { a: 56.6, b: 57.3, name: "KNOCK", desc: "Hard cut. Front door.", draw(lt, t) {
    door(0.7, Math.exp(-lt * 9) * Math.sin(lt * 80), t);
  } },
  { a: 57.3, b: 58, name: "KNOCK", desc: "Hard cut. Tighter on the door.", draw(lt, t) {
    door(1.05, Math.exp(-lt * 9) * Math.sin(lt * 80), t);
  } },
  { a: 58, b: 58.8, name: "KNOCK / freeze", desc: "ECU Daniel, wide-eyed. Freeze frame.", draw() {
    g.fillStyle = "#070b18"; g.fillRect(0, 0, W, H);
    face({ eye: 1.45, brow: 1, worry: 0.6, mouth: 0.3, pupil: 0.6, look: [-0.5, 0], k: 1.55, dy: 90 });
    fill("#1a2a5a", 0.6, "multiply");
    fill("#9fb4ff", 0.06, "lighter");
  } },
  { a: 58.8, b: 60, name: "Title", desc: "PATIENT 07 — TO BE CONTINUED", vover(lt, t) {
    const a = ease(seg(lt, 0.15, 0.9));
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
    const a = ease(seg(lt, 0.15, 0.9));
    g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#e8e2d0"; g.font = "700 64px \"Courier New\", ui-monospace, monospace";
    g.letterSpacing = "14px"; g.fillText("PATIENT 07", 647, 340);
    g.font = "400 20px \"Courier New\", ui-monospace, monospace"; g.letterSpacing = "8px"; g.fillStyle = "#8c93a0";
    g.fillText("TO BE CONTINUED", 644, 410);
    g.restore();
    glow(800, 340, 60, TEAL, 0.3 * a * heartbeat(t));
  } },
];
SHOTS.forEach((s, i) => s.n = String(i + 1).padStart(2, "0"));

function stairX(lt) { return lt < 2.9 ? lerp(1180, 420, seg(lt, 1.25, 2.9)) : lerp(420, 150, seg(lt, 2.9, 3.5)); }

// Subtitles / VO
// Clips come from vo/part-01.js (tools/build_vo.py); without it the lines still show as subtitles.
const VO = [
  { id: "ward1", a: 45.4, who: "WARD (V.O., radio)", text: "Daniel Hayes... if you can hear this... don't leave the farmhouse.", radio: true },
  { id: "ward2", a: 52.0, who: "WARD (V.O., radio)", text: "You've been infected... since day one.", radio: true },
];
VO.forEach(v => { v.b = v.a + (window.VO_DATA?.[v.id]?.dur ?? 2.5) + 0.2; });

// Scratching bursts at the door (shared by picture and sound)
const SCRATCH = (() => { const r = rng(11), out = []; for (let t = 26.35; t < 27.7; t += 0.12 + r() * 0.2) out.push([t, 0.05 + r() * 0.12]); return out; })();
function scratchAmount(t) { return SCRATCH.some(([s, d]) => t >= s && t < s + d) ? 1 : 0; }

// Frames for the "Mark match" view
const MARK_FRAMES = [{ t: 3.5, label: "SH02 · 00:03:12 · PLANT" }, { t: 53.0, label: "SH18 · 00:53:00 · CALLBACK" }];
const MARK_NOTE = "Lock this arm framing in layout and reuse it for SH18 and SH20.";

// clock + breathing (cold open)
for (let s = 0.2; s < 5; s += 1) at(s, w => hit(w, { f: 3500, q: 4, dur: 0.035, v: 0.25 }));
bed(0, 5, breathing(2.6, 0.05, 700));
// city + TV murmur
bed(5, 18.2, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 380), gn, bus); bedEnv(gn, w, dur, 0.12, off < 0.1 ? 0.6 : 0.05, 0.5); });
bed(5, 12.1, (w, off, dur) => {
  const gn = gain(), lfo = ac.createOscillator(), lg = gain(0.03);
  lfo.frequency.value = 5.3; chain(lfo, lg, gn.gain); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), filt("bandpass", 600, 1.4), gn, bus); bedEnv(gn, w, dur, 0.05, 0.4, 0.05);
});
// TV flicker + breaking sting
at(12.0, w => hit(w, { f: 4000, type: "highpass", dur: 0.6, v: 0.18 }));
at(12.55, w => { tone(w, { f: 880, dur: 0.35, v: 0.12, type: "square" }); tone(w + 0.38, { f: 660, dur: 0.5, v: 0.12, type: "square" }); });
// siren swell
bed(12.6, 21.5, (w, off, dur) => {
  const o = ac.createOscillator(), lfo = ac.createOscillator(), lg = gain(220), gn = gain(), lp = filt("lowpass", 1800);
  o.type = "triangle"; o.frequency.value = 760; lfo.frequency.value = 0.45; chain(lfo, lg, o.frequency);
  chain(o, lp, gn, bus); o.start(w); lfo.start(w); o.stop(w + dur); lfo.stop(w + dur);
  const T = x => w + Math.max(0, x - 12.6 - off);
  gn.gain.setValueAtTime(off < 0.1 ? 0.0 : lerp(0.004, 0.16, seg(12.6 + off, 12.6, 17.6)), w);
  if (12.6 + off < 17.6) gn.gain.linearRampToValueAtTime(0.16, T(17.6));
  gn.gain.linearRampToValueAtTime(0.05, T(18.4)); gn.gain.linearRampToValueAtTime(0.0, T(21.5));
});
// power dies
bed(18, 19.75, (w, off, dur) => { const o = ac.createOscillator(), gn = gain(); o.type = "sawtooth"; o.frequency.value = 60; chain(o, filt("lowpass", 240), gn, bus); bedEnv(gn, w, dur, 0.04, 0.2, 0.05); o.start(w); o.stop(w + dur); });
at(19.6, w => { tone(w, { f: 120, f2: 40, dur: 0.5, v: 0.4 }); hit(w, { f: 300, type: "lowpass", dur: 0.25, v: 0.4 }); });
// can taps while counting
for (let i = 0; i < 7; i++) at(21.85 + i * 0.35, w => tone(w, { f: 1900 + i * 30, dur: 0.12, v: 0.05 }));
// cabinet creak
at(24.7, w => tone(w, { f: 180, f2: 260, type: "sawtooth", dur: 0.45, v: 0.05 }));
// scratching + loud breathing, otherwise held silence
for (const [s, d] of SCRATCH) at(s, w => hit(w, { f: 2600 + Math.random() * 1500, q: 2.5, dur: d, v: 0.35 }));
bed(26.2, 28, breathing(1.1, 0.09, 900));
// stairwell: clatter off right, steps, door, wind outside
at(28.85, w => { [1400, 2300, 1750, 2900].forEach((f, i) => tone(w + i * 0.07, { f, dur: 0.25, v: 0.08, type: "triangle" })); hit(w, { f: 1200, dur: 0.3, v: 0.25 }); });
for (let s = 29.3; s < 31.4; s += 0.32) at(s, w => hit(w, { f: 380, type: "lowpass", dur: 0.06, v: 0.25 }));
at(31.0, w => hit(w, { f: 900, type: "lowpass", dur: 0.6, v: 0.3 }));
bed(31.0, 35.2, (w, off, dur) => {
  const gn = gain(), lp = filt("lowpass", 520), lfo = ac.createOscillator(), lg = gain(220);
  lfo.frequency.value = 0.3; chain(lfo, lg, lp.frequency); lfo.start(w); lfo.stop(w + dur);
  chain(noiseSrc(w, dur), lp, gn, bus); bedEnv(gn, w, dur, 0.2, off < 0.1 ? 0.8 : 0.05, 0.4);
});
// gravel footsteps on the highway
for (let s = 32.1; s < 35; s += 0.45) at(s, w => hit(w, { f: 1600, q: 0.6, dur: 0.09, v: 0.18 }));
// farmhouse: warm strings + birds
bed(35, 42.1, (w, off, dur) => {
  const out = gain(); chain(out, bus); bedEnv(out, w, dur, 1, off < 0.1 ? 2.2 : 0.2, 0.6);
  const lp = filt("lowpass", 1300); chain(lp, out);
  const chord = off < 3.5 ? [196, 246.94, 293.66, 392] : [174.61, 220, 261.63, 349.23];
  chord.forEach((f, i) => {
    const o = ac.createOscillator(), gn = gain(0.018); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
    chain(o, gn, lp); o.start(w); o.stop(w + dur);
    if (off < 3.5) { // chord change at 00:38.5
      const ch = w + (3.5 - off);
      o.frequency.setValueAtTime(f, ch); o.frequency.linearRampToValueAtTime([174.61, 220, 261.63, 349.23][i], ch + 0.8);
    }
  });
});
for (const s of [35.6, 36.4, 37.9, 38.6, 39.8, 40.5, 41.2]) at(s, w => { for (let k = 0; k < 3; k++) tone(w + k * 0.09, { f: 3200 + k * 300, f2: 4600, dur: 0.07, v: 0.03 }); });
// radio: static bed, heartbeat thumps synced to the light
bed(42.8, 50.6, (w, off, dur) => {
  const gn = gain(); chain(noiseSrc(w, dur), filt("bandpass", 2400, 0.7), gn, bus); bedEnv(gn, w, dur, 0.07, 0.15, 0.4);
  const T = x => w + Math.max(0, x - 42.8 - off);
  if (42.8 + off < 45.4) { gn.gain.setValueAtTime(0.07, T(45.3)); gn.gain.linearRampToValueAtTime(0.11, T(45.4)); }
});
for (let b = 43; b < 56; b += 1) { at(b, w => tone(w, { f: 62, dur: 0.18, v: 0.22 })); at(b + 0.27, w => tone(w, { f: 55, dur: 0.16, v: 0.14 })); }
// drone under the reveal
bed(50, 56.05, (w, off, dur) => {
  const gn = gain(), lp = filt("lowpass", 340); chain(lp, gn, bus);
  [55, 55.7, 82.4].forEach(f => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; chain(o, lp); o.start(w); o.stop(w + dur); });
  gn.gain.setValueAtTime(lerp(0.01, 0.09, off / 6), w); gn.gain.linearRampToValueAtTime(0.1, w + dur - 0.05); gn.gain.linearRampToValueAtTime(0, w + dur);
});
at(55.4, w => { tone(w, { f: 110, f2: 220, dur: 0.5, v: 0.12, type: "triangle" }); hit(w, { f: 5000, type: "highpass", dur: 0.3, v: 0.08 }); });
// room tone + knocks
bed(56, 58.85, (w, off, dur) => { const gn = gain(); chain(noiseSrc(w, dur), filt("lowpass", 200), gn, bus); bedEnv(gn, w, dur, 0.05, 0.05, 0.05); });
for (const k of [56.6, 57.3, 58.0]) at(k, w => { tone(w, { f: 95, f2: 45, dur: 0.35, v: 0.85, atk: 0.002 }); hit(w, { f: 500, type: "lowpass", dur: 0.18, v: 0.7 }); hit(w, { f: 2000, dur: 0.03, v: 0.25 }); });
// title boom
at(58.85, w => { tone(w, { f: 48, f2: 30, dur: 1.1, v: 0.4 }); });

