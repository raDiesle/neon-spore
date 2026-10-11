import { KEY } from "@neon-spore/content";
import { centre, rimAt } from "./body.js";
import { hash, mix } from "./noise.js";
import { litFill, type SoftDrop, type SoftScene } from "./soft.js";

/**
 * **SLIME** — wet and see-through: the key light comes out of its far side as a
 * glow low on the right, bubbles hang in it and rise, a long wet streak runs
 * along the top of the rim it actually has. A thumb sinks in deep: the far
 * wall of the dent catches a sharp wet crescent, the bubbles near it are
 * shoved aside, and rings wobble out of the dent while it is held.
 */
export const SLIME: SoftDrop = {
  name: "SLIME",
  give: { spread: 1, deep: 0.9, flatten: 0.05, sag: 0, gloss: 1 },
  body(s) {
    const { ctx, b, style } = s;
    litFill(s, [
      [0, mix(style.core, "#FFFFFF", 0.25)],
      [0.25, style.core],
      [0.55, style.body],
      [0.85, style.deep],
      [1, style.deep],
    ]);
    const c = centre(b);
    // Light through it, out of the far side.
    const q = { x: c.x - KEY.x * b.r * 0.45, y: c.y - KEY.y * b.r * 0.45 };
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, b.r * 0.75);
    g.addColorStop(0, s.t.tone(mix(style.core, style.neon, 0.4)));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = s.t.alpha * 0.6;
    ctx.fillStyle = g;
    ctx.fillRect(q.x - b.r, q.y - b.r, b.r * 2, b.r * 2);
    ctx.restore();
    bubbles(s);
  },
  top(s) {
    const { ctx, b, dent, time } = s;
    const c = centre(b);
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#FFFFFF";
    // The wet streak, laid along the rim drawn.
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const a = -2.75 + (i / 12) * 1.2;
      const o = rimAt(b, s.style, time, a);
      if (i === 0) ctx.moveTo(c.x + o.x * 0.8, c.y + o.y * 0.8);
      else ctx.lineTo(c.x + o.x * 0.8, c.y + o.y * 0.8);
    }
    ctx.globalAlpha = s.t.alpha * 0.55;
    ctx.lineWidth = b.r * 0.07;
    ctx.stroke();
    ctx.globalAlpha = s.t.alpha * 0.9;
    ctx.beginPath();
    ctx.ellipse(c.x - b.r * 0.5, c.y - b.r * 0.28, b.r * 0.08, b.r * 0.05, -0.6, 0, Math.PI * 2);
    ctx.fill();
    const k = dent.depth * s.t.alpha;
    if (k > 0.02) {
      // The far wall of the hollow is wet and faces the light.
      const away = Math.atan2(-KEY.y, -KEY.x);
      ctx.globalAlpha = 0.75 * k;
      ctx.lineWidth = dent.r * 0.14;
      ctx.beginPath();
      ctx.arc(dent.at.x, dent.at.y, dent.r * 0.78, away - 0.85, away + 0.85);
      ctx.stroke();
      // Rings wobbling out of the dent while it is held.
      ctx.strokeStyle = s.t.neon;
      for (const lag of [0, 0.5]) {
        const u = (time * 1.25 + lag) % 1;
        ctx.globalAlpha = 0.35 * k * (1 - u);
        ctx.lineWidth = b.r * 0.04 * (1 - u) + 0.3;
        ctx.beginPath();
        const rr = dent.r * 1.15 + (b.r - dent.r) * u;
        ctx.ellipse(dent.at.x, dent.at.y, rr, rr * 0.94, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
  rim(s) {
    const { ctx, b, path, t } = s;
    ctx.strokeStyle = t.neon;
    ctx.globalAlpha = t.alpha * 0.9;
    ctx.lineWidth = b.r * 0.08;
    ctx.stroke(path);
    ctx.strokeStyle = mix(t.neon, "#FFFFFF", 0.6);
    ctx.globalAlpha = t.alpha * 0.5;
    ctx.lineWidth = b.r * 0.025;
    ctx.stroke(path);
  },
};

/** Bubbles hung in the slime, rising slowly, small and faint the deeper they hang, and
 * shoved aside by the thumb. */
function bubbles(s: SoftScene): void {
  const { ctx, b, dent, time } = s;
  const c = centre(b);
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const deep = hash(i * 3.7 + 1);
    const a = hash(i * 5.3 + 2) * Math.PI * 2 + time * 0.25 * (hash(i + 4) - 0.5);
    const d = b.r * (0.15 + 0.6 * hash(i * 2.1 + 3));
    const rise = (((time * 0.12 + hash(i * 1.7)) % 1) - 0.5) * b.r * 0.4;
    let x = c.x + Math.cos(a) * d;
    let y = c.y + Math.sin(a) * d - rise;
    const dx = x - dent.at.x;
    const dy = y - dent.at.y;
    const gap = Math.hypot(dx, dy);
    const reach = dent.r * 1.7;
    if (gap < reach && gap > 1e-3) {
      const push = dent.depth * (reach - gap) * 0.6;
      x += (dx / gap) * push;
      y += (dy / gap) * push;
    }
    const sz = b.r * (0.05 + 0.08 * hash(i * 7.9)) * (1 - 0.4 * deep);
    ctx.globalAlpha = s.t.alpha * (0.6 - 0.35 * deep);
    ctx.strokeStyle = s.t.tone(mix(s.style.core, "#FFFFFF", 0.3));
    ctx.lineWidth = sz * 0.25;
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x - sz * 0.35, y - sz * 0.35, sz * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
