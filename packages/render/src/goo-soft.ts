import { type Facet, KEY, type Point } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { bodyPath, centre, DROP_SPIN, type GooBody, glow, rimAt } from "./goo-body.js";
import type { GooMoment } from "./goo-moment.js";
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
} from "./goo-press.js";
import { liftOf, paintCap } from "./goo-soft-cap.js";
import type { GooStyle } from "./goo-style.js";

/**
 * **A soft drop**: the GOO drop made of something a thumb sinks into, in GOO's
 * own colours — the owner, 11 October 2026: *not changing colour, but the 3d
 * effect*. Each material paints its body and what is on it; this frame
 * presses it (`goo-press.ts`), clips it, puts the bow and the dent on it between
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
  /** It stands up as a cap to be pressed while it is untouched (`goo-soft-cap.ts`). */
  readonly cap?: boolean;
  /** It slows while it is pulled (`stillSpin`), to this share of its turning: 0 stops it. */
  readonly still?: number;
  /** The body and what is on it, clipped to the drop, under the dent. */
  body(s: SoftScene): void;
  /** In place of the dent and the bow, still clipped: its own hollow (`goo-soft-crater.ts`). */
  hollow?(s: SoftScene): void;
  /** Over the dent, still clipped: what a hollow does not hide. */
  top?(s: SoftScene): void;
  /** Its edge, unclipped. */
  rim(s: SoftScene): void;
}

/** What a still drop's turning is worked out from: whether it is held, and how long
 * since it was taken and let go (`GooMoment`). */
export type Turn = Pick<GooMoment, "held" | "grabbed" | "lifted">;

/** Seconds a still drop takes to stop turning once taken, and to catch its turning up
 * again once let go. */
const STOP = 0.2;
const CATCH = 0.6;
/** A hold longer than this is the lab's *never taken*. */
const NEVER_HELD = 20;

/** How far round a still drop has turned, `time` seconds in, taken `held` seconds ago:
 * slowing to `keep` of its turning rather than snapping, from where the turning had it.
 * The owner, 11 October 2026: *a variant, where the rotation stops when pulling*; and
 * later the same day, of RIPPLES, *rotation is much slower when touched*. */
export function stoppedSpin(time: number, held: number, keep = 0): number {
  return (time - behindBy(held, keep)) * DROP_SPIN;
}

/** Seconds of turning a drop held `held` seconds, keeping `keep` of it, has fallen behind. */
function behindBy(held: number, keep: number): number {
  return (1 - keep) * (held - STOP * (1 - Math.exp(-held / STOP)));
}

/** A still drop's turn: stopping while held; let go, on from where it stopped and
 * quickly catching up with the turning it would have had, so neither a grab nor a let
 * go jumps. */
export function stillSpin(time: number, t: Turn, keep = 0): number {
  if (t.held) return stoppedSpin(time, t.grabbed, keep);
  const held = t.grabbed - t.lifted;
  if (held <= 0 || held > NEVER_HELD || t.lifted >= CATCH) return time * DROP_SPIN;
  return (time - behindBy(held, keep) * (1 - smoothstep(t.lifted / CATCH))) * DROP_SPIN;
}

/** The drop as it is drawn: pressed and turned. An arrow laid on it is laid on this, so
 * the two give and stop together. */
export function drawnBody(
  drop: SoftDrop,
  b: GooBody,
  press: Press,
  time: number,
  turn: Turn,
): GooBody {
  const p = pressed(b, press, drop.give);
  return drop.still === undefined ? p : { ...p, spin: stillSpin(time, turn, drop.still) };
}

/** Paint `drop`, and give back the body it drew — with how far its cap stands up, for an
 * arrow to ride on. */
export function paintSoft(
  ctx: CanvasRenderingContext2D,
  drop: SoftDrop,
  b0: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  press: Press,
  turn: Turn,
): GooBody {
  const b = drawnBody(drop, b0, press, time, turn);
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
  if (drop.cap) paintCap(s);
  if (drop.hollow) drop.hollow(s);
  else {
    paintBow(ctx, b, press, style, t, drop.give.gloss);
    paintDent(ctx, dent, style, t, drop.give.gloss);
  }
  drop.top?.(s);
  ctx.restore();
  ctx.save();
  drop.rim(s);
  ctx.restore();
  return drop.cap ? { ...b, lift: liftOf(b, press.depth) } : b;
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
