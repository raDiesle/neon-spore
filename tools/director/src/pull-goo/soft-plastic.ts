import { KEY } from "@neon-spore/content";
import { rgba } from "@neon-spore/render";
import { bodyPath, centre } from "./body.js";
import { hash, mix } from "./noise.js";
import { SHADE } from "./press.js";
import type { SoftDrop, SoftScene } from "./soft.js";

/**
 * **SOFT PLASTIC** — a squeezy toy: satin all over and calm in the middle,
 * where the arrow is, its light gathered on the inner edge instead — a bevel
 * lit along the top left and shaded along the bottom right, a crisp catchlight
 * just inside the rim and a fresnel glow on it. It gives the most: a thumb
 * flattens and widens it into a deep wide hollow, and folds crease out of the
 * dent the harder it is pressed. The owner, 11 October 2026, on picking it:
 * *remove* the window of light under the arrow, and *use more effect on the
 * inner borders area rather than below the arrows*.
 */
export const PLASTIC: SoftDrop = {
  name: "SOFT PLASTIC",
  give: { spread: 1.2, deep: 1, flatten: 0.1, sag: 0, gloss: 0.85 },
  moulded: true,
  body(s) {
    const { ctx, b, style } = s;
    const c = centre(b);
    // Even satin in the middle, darkening only near the edge.
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, b.r * 1.1);
    g.addColorStop(0, s.t.tone(mix(style.body, style.core, 0.35)));
    g.addColorStop(0.55, s.t.tone(style.body));
    g.addColorStop(0.85, s.t.tone(style.deep));
    g.addColorStop(1, s.t.tone(mix(style.deep, style.neon, 0.25)));
    ctx.fillStyle = g;
    ctx.fill(s.path);
    // The bevel: a wide band inside the rim, lit towards the light, shaded away from it.
    const bevel = ctx.createLinearGradient(
      c.x + KEY.x * b.r,
      c.y + KEY.y * b.r,
      c.x - KEY.x * b.r,
      c.y - KEY.y * b.r,
    );
    bevel.addColorStop(0, s.t.tone(mix(style.core, "#FFFFFF", 0.35)));
    bevel.addColorStop(0.45, rgba(style.core, 0));
    bevel.addColorStop(0.6, rgba(SHADE, 0));
    bevel.addColorStop(1, SHADE);
    ctx.strokeStyle = bevel;
    for (const [w, a] of [
      [0.62, 0.35],
      [0.36, 0.55],
    ] as const) {
      ctx.globalAlpha = a * s.t.alpha;
      ctx.lineWidth = b.r * w;
      ctx.stroke(s.path);
    }
    ctx.globalAlpha = s.t.alpha;
  },
  top(s) {
    folds(s);
    plasticSheen(s);
  },
  rim(s) {
    const { ctx, b, path, t } = s;
    ctx.strokeStyle = t.neon;
    ctx.globalAlpha = t.alpha * 0.9;
    ctx.lineWidth = b.r * 0.06;
    ctx.stroke(path);
  },
};

/** Folds out of the dent: a dark crease with its lit side towards the light, longer the
 * harder it is pressed. */
function folds(s: SoftScene): void {
  const { ctx, b, dent, press } = s;
  const k = dent.depth * s.t.alpha;
  if (k <= 0.02) return;
  ctx.save();
  ctx.lineCap = "round";
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
  ctx.restore();
}

/** The catchlight just inside the rim and the fresnel on it: SOFT PLASTIC's shine. */
export function plasticSheen(s: SoftScene): void {
  const { ctx, b, press } = s;
  const c = centre(b);
  ctx.save();
  // The catchlight: a crisp line just inside the rim, on the arc that faces the light.
  const inner = bodyPath(
    {
      ...b,
      r: b.r * 0.86,
      at: { x: b.at.x, y: b.at.y - b.r * 0.14 * (1 - 1 / (b.squash ?? 1)) },
    },
    s.style,
    s.time,
  );
  const lit = ctx.createLinearGradient(
    c.x + KEY.x * b.r,
    c.y + KEY.y * b.r,
    c.x - KEY.x * b.r * 0.2,
    c.y - KEY.y * b.r * 0.2,
  );
  lit.addColorStop(0, "rgba(255,255,255,0.75)");
  lit.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = lit;
  ctx.globalAlpha = s.t.alpha * (1 - 0.4 * press.depth);
  ctx.lineWidth = b.r * 0.035;
  ctx.stroke(inner);
  // The fresnel: the edge seen at a glance takes the neon.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = s.t.neon;
  ctx.globalAlpha = s.t.alpha * 0.3;
  ctx.lineWidth = b.r * 0.22;
  ctx.stroke(s.path);
  ctx.restore();
}

/** SOFT PLASTIC that stops turning while it is pulled, and turns on once let go. */
export const PLASTIC_STILL: SoftDrop = { ...PLASTIC, name: "PLASTIC · STILL", still: true };
