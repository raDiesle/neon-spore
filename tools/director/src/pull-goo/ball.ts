import { facet, LAT_LIMIT, type Pin, pin } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { bodyPath, DROP_SPIN, type GooBody, glow } from "./body.js";
import { hash, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **The GOO drop as a ball** — the owner, 10 October 2026: *more cool, more
 * detailed, maybe 3d*. The same lumpy contour, posed as every GOO drop is;
 * its surface placed (`.claude/skills/depth`): flecks of lit goo pinned by
 * longitude and latitude and turned by `facet`, so as it rolls the near ones
 * go round and away and the far ones come up over the limb. Lit from the top
 * left with a dark limb, a neon rim light under it, and a glint that stays
 * with the light while the surface turns under it.
 */

/** The flecks on the surface, fixed once: dark pits and lit beads scattered over it, , and
 * two rings of beads either side of its middle the way it rolls — off the middle, where
 * the arrow lies — which read the turn best of all. */
const FLECKS: readonly { pin: Pin; size: number; bright: boolean }[] = [
  ...Array.from({ length: 9 }, (_, i) => ({
    pin: pin(hash(i * 3.7 + 1) * Math.PI * 2, (hash(i * 5.3 + 2) * 2 - 1) * LAT_LIMIT, 0.8),
    size: 0.14 + 0.14 * hash(i * 7.1 + 3),
    bright: i % 3 === 0,
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    pin: pin(((i % 10) / 10) * Math.PI * 2 + (i < 10 ? 0 : 0.3), i < 10 ? 0.55 : -0.55, 0.88),
    size: 0.08,
    bright: true,
  })),
];

export function paintBall(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  way: { x: number; y: number },
): void {
  const p = bodyPath(b, style, time);
  const { at, r } = b;
  const green = tint.green ?? 0;
  const neon = mix(mix(style.neon, PALETTE.red, tint.red), PALETTE.good, green);
  const alpha = tint.alpha ?? 1;
  const tone = (c: string): string =>
    mix(mix(c, PALETTE.red, tint.red * 0.7), PALETTE.good, green * 0.7);
  glow(ctx, p, neon, r, alpha * 1.2);
  ctx.save();
  ctx.globalAlpha = alpha;
  // Six stops from the lit cap to the limb, the reflected light the last but one.
  const g = ctx.createRadialGradient(
    at.x - r * 0.38,
    at.y - r * 0.42,
    r * 0.04,
    at.x,
    at.y,
    r * 1.15,
  );
  g.addColorStop(0, tone(mix(style.core, "#FFFFFF", 0.35)));
  g.addColorStop(0.22, tone(style.core));
  g.addColorStop(0.5, tone(style.body));
  g.addColorStop(0.78, tone(style.deep));
  g.addColorStop(0.9, tone(mix(style.deep, style.neon, 0.25)));
  g.addColorStop(1, tone(style.deep));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.clip(p);
  flecks(ctx, b, neon, time, way, alpha);
  // The rim light: neon wrapping the limb on the side away from the key.
  ctx.globalCompositeOperation = "lighter";
  const rim = ctx.createRadialGradient(
    at.x - r * 0.5,
    at.y - r * 0.55,
    r * 0.9,
    at.x - r * 0.2,
    at.y - r * 0.25,
    r * 1.5,
  );
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, neon);
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = rim;
  ctx.fill(p);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = neon;
  ctx.globalAlpha = alpha * 0.9;
  ctx.lineWidth = r * 0.08;
  ctx.stroke(p);
  // The glint stays with the light; the surface turns under it.
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = alpha * 0.3;
  ctx.beginPath();
  ctx.ellipse(at.x - r * 0.34, at.y - r * 0.44, r * 0.36, r * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.95;
  ctx.beginPath();
  ctx.ellipse(at.x - r * 0.4, at.y - r * 0.5, r * 0.12, r * 0.07, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The flecks, rolled `DROP_SPIN` a second towards `way`, each foreshortened by its own plane. */
function flecks(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  neon: string,
  time: number,
  way: { x: number; y: number },
  alpha: number,
): void {
  const { at, r } = b;
  const len = Math.hypot(way.x, way.y);
  const ux = len > 0.01 ? way.x / len : 0;
  const uy = len > 0.01 ? way.y / len : 1;
  const turn = Math.atan2(uy, ux);
  const theta = (b.spin ?? time * DROP_SPIN) * 1.6;
  for (const fl of FLECKS) {
    const f = facet(fl.pin, theta);
    if (!f.near) continue;
    // Across the roll is `x`; it runs along `way`.
    const x = at.x + (ux * f.x - uy * f.y) * r;
    const y = at.y + (uy * f.x + ux * f.y) * r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.scale(Math.max(0.08, f.sx), Math.max(0.08, f.sy));
    ctx.fillStyle = fl.bright ? mix(neon, "#FFFFFF", 0.45) : "#0B1024";
    ctx.globalAlpha = alpha * (fl.bright ? 0.35 + 0.65 * f.lit : 0.7) * Math.min(1, f.sx * 2.5);
    ctx.beginPath();
    ctx.arc(0, 0, r * fl.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
