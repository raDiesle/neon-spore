import { keyLit } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, centre, DROP_SPIN, type GooBody, glow, rimAt } from "./body.js";
import { clamp01, hash, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **The GOO drop as a ball** — the owner, 10 October 2026: *more cool, more
 * detailed, maybe 3d*. The same lumpy contour, posed as every GOO drop is;
 * its surface placed (`.claude/skills/depth`): bubbles, pits and beads of lit
 * goo scattered over the whole sphere and rolled towards the pull, so the
 * near ones go round and away and the far ones come up over the limb. Lit
 * from the top left with a dark limb, a neon rim light under it, and a glint
 * that stays with the light while the surface turns under it.
 *
 * And the owner's notes on that (10 October 2026): *it should not be visible
 * that there is a straight horizontal line where dots are going behind, it
 * should follow the natural shape* — so the sphere is laid onto the rim
 * actually drawn (`rimAt`), lumps and lean, and a feature fades as it turns
 * away rather than stopping at a line; *the small 3d bubbles … all on the
 * same vertical line* — so there are no rings, every feature has its own
 * place, size and shape, and drifts a little in the goo on its own clock.
 */

type Kind = "bubble" | "pit" | "bead";

interface Fleck {
  readonly lon: number;
  readonly lat: number;
  /** Its radius, as a share of the drop's: many small, a few big. */
  readonly size: number;
  /** How round it is, and which way its long side lies on the surface. */
  readonly aspect: number;
  readonly tilt: number;
  readonly kind: Kind;
  /** How fast and from where it wanders in the goo. */
  readonly drift: number;
  readonly phase: number;
}

/** The surface, fixed once: scattered evenly over the sphere, never in rows. */
const FLECKS: readonly Fleck[] = Array.from({ length: 30 }, (_, i) => {
  const h = (k: number): number => hash(i * 7.31 + k * 1.93 + 0.5);
  const roll = h(4);
  return {
    lon: h(1) * Math.PI * 2,
    lat: Math.asin((h(2) * 2 - 1) * 0.94),
    size: 0.04 + 0.17 * h(3) ** 1.8,
    aspect: 0.6 + 0.4 * h(5),
    tilt: h(6) * Math.PI,
    kind: roll < 0.55 ? "bubble" : roll < 0.8 ? "pit" : "bead",
    drift: 0.25 + 0.5 * h(7),
    phase: h(8) * Math.PI * 2,
  };
});

/** How far round a feature has to be from the limb to show in full, as its depth. */
const LIMB_FADE = 0.32;

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
  flecks(ctx, b, style, neon, time, way, alpha);
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

/** The surface, rolled `DROP_SPIN` a second towards `way`, laid onto the rim drawn, far
 * side first. */
function flecks(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  neon: string,
  time: number,
  way: { x: number; y: number },
  alpha: number,
): void {
  const len = Math.hypot(way.x, way.y);
  const ux = len > 0.01 ? way.x / len : 0;
  const uy = len > 0.01 ? way.y / len : 1;
  const theta = (b.spin ?? time * DROP_SPIN) * 1.6;
  const c = centre(b);
  const seen: { fl: Fleck; px: number; py: number; z: number }[] = [];
  for (const fl of FLECKS) {
    const lat = fl.lat + 0.12 * Math.sin(time * fl.drift + fl.phase);
    const a = fl.lon + theta + 0.15 * Math.sin(time * fl.drift * 0.7 + fl.phase * 2);
    const z = Math.cos(lat) * Math.cos(a);
    if (z <= 0) continue;
    // Along the roll is `way`; across it, the axis it rolls round.
    const along = Math.cos(lat) * Math.sin(a);
    const across = Math.sin(lat);
    seen.push({ fl, px: ux * along - uy * across, py: uy * along + ux * across, z });
  }
  seen.sort((p, q) => p.z - q.z);
  const ring = mix(neon, "#FFFFFF", 0.5);
  for (const { fl, px, py, z } of seen) {
    const phi = Math.atan2(py, px);
    const rho = Math.hypot(px, py);
    const rim = rimAt(b, style, time, phi);
    const x = c.x + rim.x * rho;
    const y = c.y + rim.y * rho;
    const s = b.r * fl.size;
    const lit = keyLit(px, py, z);
    const fade = alpha * smoothstep(clamp01(z / LIMB_FADE));
    ctx.save();
    ctx.translate(x, y);
    // Foreshortened across the limb, by how far it faces away; its own shape on top.
    ctx.rotate(phi);
    ctx.scale(Math.max(0.12, z), 1);
    ctx.rotate(fl.tilt - phi);
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * fl.aspect, 0, 0, Math.PI * 2);
    if (fl.kind === "pit") {
      ctx.fillStyle = "#0B1024";
      ctx.globalAlpha = fade * 0.6;
      ctx.fill();
    } else if (fl.kind === "bead") {
      ctx.fillStyle = mix(neon, "#FFFFFF", 0.45);
      ctx.globalAlpha = fade * (0.3 + 0.7 * lit);
      ctx.fill();
    } else {
      ctx.fillStyle = style.core;
      ctx.globalAlpha = fade * 0.22;
      ctx.fill();
      ctx.strokeStyle = ring;
      ctx.lineWidth = s * 0.22;
      ctx.globalAlpha = fade * (0.5 + 0.5 * lit);
      ctx.stroke();
    }
    ctx.restore();
    if (fl.kind !== "bubble" || s < b.r * 0.06) continue;
    // A bubble's glint is where the light is, whatever way the surface faces.
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = fade * (0.25 + 0.6 * lit);
    ctx.beginPath();
    ctx.arc(x - s * 0.35 * z, y - s * 0.4, s * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }
}
