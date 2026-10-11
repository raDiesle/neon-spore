import { type Facet, KEY, type Point } from "@neon-spore/content";
import { bodyPath, centre, DROP_SPIN, type GooBody, glow, rimAt } from "./body.js";
import {
  type Dent,
  dentOf,
  type Give,
  type Press,
  paintBow,
  paintDent,
  pressed,
  type Tones,
  tonesOf,
} from "./press.js";
import type { GooStyle } from "./style.js";

/**
 * **A soft drop**: the GOO drop made of something a thumb sinks into, in GOO's
 * own colours — the owner, 11 October 2026: *not changing colour, but the 3d
 * effect*. Each material paints its body and what is on it; this frame
 * presses it (`press.ts`), clips it, puts the bow and the dent on it between
 * the material's body and its top, and leaves the rim to the material.
 */

/** One frame of a soft drop, the press already in its body. */
export interface SoftScene {
  readonly ctx: CanvasRenderingContext2D;
  readonly b: GooBody;
  readonly path: Path2D;
  readonly style: GooStyle;
  readonly time: number;
  readonly t: Tones;
  readonly press: Press;
  readonly dent: Dent;
  /** How far round its surface has turned, in radians. */
  readonly theta: number;
}

export interface SoftDrop {
  readonly name: string;
  readonly give: Give;
  /** Its arrow is moulded into its own lumps (`soft-arrow.ts`) rather than THE INSTAR's. */
  readonly moulded?: boolean;
  /** The body and what is on it, clipped to the drop, under the dent. */
  body(s: SoftScene): void;
  /** Over the dent, still clipped: what a hollow does not hide. */
  top?(s: SoftScene): void;
  /** Its edge, unclipped. */
  rim(s: SoftScene): void;
}

export function paintSoft(
  ctx: CanvasRenderingContext2D,
  drop: SoftDrop,
  b0: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  press: Press,
): void {
  const b = pressed(b0, press, drop.give);
  const path = bodyPath(b, style, time);
  const t = tonesOf(style, tint);
  const dent = dentOf(b, press, drop.give);
  const theta = b.spin ?? time * DROP_SPIN;
  const s: SoftScene = { ctx, b, path, style, time, t, press, dent, theta };
  glow(ctx, path, t.neon, b.r, t.alpha * 1.2);
  ctx.save();
  ctx.globalAlpha = t.alpha;
  ctx.clip(path);
  drop.body(s);
  paintBow(ctx, b, press, style, t, drop.give.gloss);
  paintDent(ctx, dent, style, t, drop.give.gloss);
  drop.top?.(s);
  ctx.restore();
  ctx.save();
  drop.rim(s);
  ctx.restore();
}

/** Fill the drop with light from the top left: `stops` from the lit cap to the limb. */
export function litFill(s: SoftScene, stops: readonly (readonly [number, string])[]): void {
  const { ctx, b } = s;
  const c = centre(b);
  const g = ctx.createRadialGradient(
    c.x + KEY.x * b.r * 0.55,
    c.y + KEY.y * b.r * 0.6,
    b.r * 0.04,
    c.x,
    c.y,
    b.r * 1.15,
  );
  for (const [at, col] of stops) g.addColorStop(at, s.t.tone(col));
  ctx.fillStyle = g;
  ctx.fill(s.path);
}

/** Where a feature placed on the unit sphere (`facet`, `.claude/skills/depth`) lands on
 * the rim actually drawn, lumps and squash and all, and how much the dent squeezes it:
 * `squeeze` 1 at the thumb to 0 outside the dent, `out` the way it is shoved. */
export function onDrop(s: SoftScene, f: Facet): { at: Point; squeeze: number; out: Point } {
  const phi = Math.atan2(f.y, f.x);
  const rho = Math.hypot(f.x, f.y);
  const rim = rimAt(s.b, s.style, s.time, phi);
  const c = centre(s.b);
  const at = { x: c.x + rim.x * rho, y: c.y + rim.y * rho };
  const dx = at.x - s.dent.at.x;
  const dy = at.y - s.dent.at.y;
  const d = Math.hypot(dx, dy);
  const reach = s.dent.r * 1.6;
  const squeeze = d < reach ? s.dent.depth * (1 - d / reach) : 0;
  return { at, squeeze, out: d > 1e-3 ? { x: dx / d, y: dy / d } : { x: 0, y: 0 } };
}
