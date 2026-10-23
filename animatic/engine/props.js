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
  g.fillStyle = `rgba(170,255,230,${0.25 + 0.75 * led})`; circle(6, -82, 4.5);
  glow(6, -82, 46, TEAL, 0.6 * led);
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
