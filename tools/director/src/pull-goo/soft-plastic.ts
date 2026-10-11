import { KEY } from "@neon-spore/content";
import { centre } from "./body.js";
import { hash, mix } from "./noise.js";
import { SHADE } from "./press.js";
import { litFill, type SoftDrop } from "./soft.js";

/**
 * **SOFT PLASTIC** — a squeezy toy: satin all over, one crisp window of light
 * on the top left and a fresnel glow inside the rim. It gives the most: a
 * thumb flattens and widens it, the window slides out towards the edge as
 * the top tilts, and folds crease out of the dent the harder it is pressed.
 */
export const PLASTIC: SoftDrop = {
  name: "SOFT PLASTIC",
  give: { spread: 0.95, deep: 0.85, flatten: 0.1, sag: 0, gloss: 0.85 },
  body(s) {
    const { ctx, b, style } = s;
    litFill(s, [
      [0, mix(style.core, "#FFFFFF", 0.45)],
      [0.2, style.core],
      [0.5, style.body],
      [0.78, style.deep],
      [0.9, mix(style.deep, style.neon, 0.3)],
      [1, style.deep],
    ]);
    // Satin: a broad soft sheen under the window.
    const c = centre(b);
    const q = { x: c.x + KEY.x * b.r * 0.35, y: c.y + KEY.y * b.r * 0.35 };
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, b.r * 0.8);
    g.addColorStop(0, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fill(s.path);
  },
  top(s) {
    const { ctx, b, dent, press } = s;
    const c = centre(b);
    const k = dent.depth * s.t.alpha;
    ctx.save();
    ctx.lineCap = "round";
    // Folds out of the dent: a dark crease with its lit side towards the light.
    if (k > 0.02) {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.4 * hash(i * 3.3) + 0.3;
        const from = dent.r * 1.15;
        const to = from + b.r * (0.22 + 0.18 * hash(i * 1.9)) * press.depth;
        const bend = 0.25 * (hash(i * 4.7) - 0.5);
        const pt = (d: number, side: number) => ({
          x: dent.at.x + Math.cos(a + bend * (d / to)) * d - Math.sin(a) * side,
          y: dent.at.y + Math.sin(a + bend * (d / to)) * d + Math.cos(a) * side,
        });
        const litSide =
          Math.cos(a + Math.PI / 2) * KEY.x + Math.sin(a + Math.PI / 2) * KEY.y > 0 ? 1 : -1;
        for (const [col, side, w, al] of [
          [SHADE, 0, 0.05, 0.6],
          [mix(s.style.core, "#FFFFFF", 0.4), litSide * b.r * 0.04, 0.025, 0.5],
        ] as const) {
          const p0 = pt(from, side);
          const p1 = pt((from + to) / 2, side);
          const p2 = pt(to, side);
          ctx.strokeStyle = col;
          ctx.globalAlpha = al * k;
          ctx.lineWidth = b.r * w;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    // The window of light, sliding out to the edge as the press tilts the top.
    const slide = 0.45 + 0.15 * press.depth;
    const w = { x: c.x + KEY.x * b.r * slide, y: c.y + KEY.y * b.r * slide };
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = s.t.alpha * 0.8;
    ctx.beginPath();
    ctx.ellipse(
      w.x,
      w.y,
      b.r * 0.3,
      b.r * 0.11 * (1 - 0.3 * press.depth),
      -Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.globalAlpha = s.t.alpha * 0.5;
    ctx.beginPath();
    ctx.ellipse(
      w.x + b.r * 0.22,
      w.y + b.r * 0.08,
      b.r * 0.08,
      b.r * 0.05,
      -Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // The fresnel: the edge seen at a glance takes the neon.
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = s.t.neon;
    ctx.globalAlpha = s.t.alpha * 0.3;
    ctx.lineWidth = b.r * 0.22;
    ctx.stroke(s.path);
    ctx.restore();
  },
  rim(s) {
    const { ctx, b, path, t } = s;
    ctx.strokeStyle = t.neon;
    ctx.globalAlpha = t.alpha * 0.9;
    ctx.lineWidth = b.r * 0.06;
    ctx.stroke(path);
  },
};
