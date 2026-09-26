import { type BossKind, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { gimbalCentre } from "./gimbal-shape.js";
import { haspBlow } from "./hasp-blow.js";
import type { Layout } from "./layout.js";
import { mantleCentre } from "./mantle-shape.js";
import { oculusBlow } from "./oculus-blow.js";
import { oculusCentre } from "./oculus-shape.js";
import { PALETTE } from "./palette.js";
import { seamBlow } from "./seam-blow.js";
import { seamCentre, seamHalfHeight } from "./seam-shape.js";
import { spoolHome } from "./spool-shape.js";
import { valveCentre } from "./valve-shape.js";

/**
 * **What a boss's own blow at the hull looks like**, when a window ran out
 * and the boss broke the ship (`sim/boss-strike.ts`, the owner's rule of 26
 * September 2026: the boss is seen doing it, never a rock nobody saw fall).
 *
 * Two tables and a default. `FROM` is where the blow leaves the body — the
 * boss's own centre, off the same function its drawer places it with, so the
 * blow cannot come out of somewhere the body is not. `LOOK` is a boss's own
 * picture of the blow. **The default lash is a floor, not the picture**: a
 * tendril thrown out of the body down to the column, in the boss's hue, and
 * pulled back. Each boss's own blow is one queue item (`docs/queue.md`) and
 * one row here.
 */

export interface Point {
  x: number;
  y: number;
}

/** One frame of one blow, handed to a look. */
export interface StrikeFrame {
  /** The screen, for a look that sizes itself off its boss's own shape. */
  l: Layout;
  from: Point;
  /** Where it lands: the column, on the skin. */
  to: Point;
  /** How far out the blow has got, 0..1 — 1 is the hull reached. */
  reach: number;
  /** After it lands, 0..1 across the withdrawal; 0 until then. */
  after: number;
  tile: number;
  time: number;
}

export type StrikeLook = (ctx: CanvasRenderingContext2D, f: StrikeFrame) => void;

const FROM: Partial<Record<BossKind, (l: Layout, cfg: SimConfig) => Point>> = {
  oculus: oculusCentre,
  gimbal: gimbalCentre,
  // Out of the bottom lobe, where the ridge's crack ends (`seam-blow.ts`).
  seam: (l, cfg) => {
    const c = seamCentre(l, cfg);
    return { x: c.x, y: c.y + seamHalfHeight(l) * 0.9 };
  },
  valve: valveCentre,
  spool: spoolHome,
  mantle: mantleCentre,
};

/** A boss's own blow; an empty table is every boss on the lash. */
const LOOK: Partial<Record<BossKind, StrikeLook>> = {
  oculus: oculusBlow,
  seam: seamBlow,
  // Its bolt has already fallen the column in sight; the blow drives it home.
  hasp: haspBlow,
  // THE INSTAR's blow is already in the picture: the part the pair let
  // through — the fire, the swarm, the blades, the glob — is drawn coming
  // down on the hull by `instar-strike.ts` off the same step's `instarStrike`
  // event. A lash thrown out of the middle of the field on top of it would be
  // a second blow the dragon never struck, so this one only times the crack.
  instar: () => {},
};

/** Where the blow leaves the body. A boss with no row in `FROM` sits where
 * most of them do, over the middle column three rows down the field. */
export function strikeFrom(l: Layout, cfg: SimConfig, by: BossKind): Point {
  const at = FROM[by];
  if (at) return at(l, cfg);
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + 3 * l.tile };
}

export function strikeLook(by: BossKind): StrikeLook {
  return LOOK[by] ?? lash;
}

/**
 * The default: a lash. Its root stays in the body and its tip travels a
 * slight curve to the column — the swing is what says *thrown* rather than
 * *fired* — then it is pulled back root-first while it fades, and a flattened
 * ring spreads along the plating where it struck.
 */
export function lash(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const ease = 1 - (1 - f.reach) ** 3;
  const back = f.after * f.after;
  const alpha = 1 - f.after;
  if (alpha <= 0) return;
  // The bend: a control point off to one side of the straight line, the side
  // the column lies on, so a blow to the left swings out to the left.
  const side = to.x >= from.x ? 1 : -1;
  const cx = (from.x + to.x) / 2 + side * tile * 1.4;
  const cy = (from.y + to.y) / 2;
  const at = (t: number): Point => {
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
      y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
    };
  };
  const t0 = back;
  const t1 = ease;
  if (t1 <= t0) return;
  const n = 14;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [width, hex, a] of [
    [0.55, PALETTE.red, 0.35],
    [0.28, PALETTE.red, 0.9],
    [0.1, PALETTE.redRim, 1],
  ] as const) {
    ctx.globalAlpha = alpha * a;
    ctx.strokeStyle = hex;
    ctx.lineWidth = width * tile;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = at(t0 + ((t1 - t0) * i) / n);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  // The knot at the tip, which is the thing that hits.
  const tip = at(t1);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.redRim;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, tile * (0.2 + 0.1 * ease), 0, Math.PI * 2);
  ctx.fill();
  // The ring along the plating, once it has struck.
  if (f.after > 0) {
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = PALETTE.red;
    ctx.lineWidth = tile * 0.12;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.4 + 1.6 * f.after),
      tile * (0.12 + 0.3 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
