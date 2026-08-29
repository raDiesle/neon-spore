import type { Point } from "@neon-spore/content";
import type { HullSkin } from "./hull.js";
import type { HullFrame } from "./hull-frame.js";
import { surface } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The fire opening — the one place on the hull that two different things now
 * draw into. A pod is taken *in* through it and a shot is laid *out* of it,
 * so its geometry is its own file rather than a private detail of the ship.
 *
 * The opening is a **record** and no longer four literals inside one draw
 * call, for the reason `bullets.ts` gives about `SHOT_LOOK`: a record can be
 * patched for the length of one `draw()` and a literal cannot, so a second
 * answer to what this hole looks like had nowhere to sit. `MOUTH_LOOK` is
 * that record, `cannon-maw.ts`'s `LAY_LOOK` is the moving half of the same
 * opening, and `docs/versus.md` is the mechanism both are for.
 *
 * `draw` is a whole function on the record rather than a bag of numbers
 * because the shipped mouth is an `ctx.ellipse` and a candidate need not be —
 * a contour with a lobe cannot be spelled as a radius, the same way the
 * shipped tail cannot be spelled as a length (`ShotLook.tailBack`).
 */

/**
 * Where the mouth is this frame, for either pass that draws into it. One
 * object because `drawMuzzle` and `drawLay` are two passes over the *same*
 * opening — the failure `muzzleCenterY` below is written against is exactly
 * the two of them disagreeing about where it is.
 */
export interface MouthFrame {
  /** Screen x of the cannon. */
  x: number;
  /** Screen y of the mouth's centre. `muzzleCenterY`, already applied. */
  y: number;
  /** Screen y of the cannon lobe's tip, which the mouth hangs below. */
  tipY: number;
  l: Layout;
  /** 0..1, how far the maw is open for a swallow. */
  intake: number;
  /** The hull's own membrane at a screen x — the skin beside the mouth. */
  surface(x: number): Point;
}

/** The opening itself, drawn every frame whether or not anything is in it. */
export interface MouthLook {
  /** How far below the tip the mouth rests, in tiles, before intake spends it. */
  drop: number;
  /**
   * Half height, in tiles. It never grows with intake, and
   * `test/swallow-bounds.test.ts` is the guard: the growth the opening spends
   * on becoming a throat only ever goes sideways, or the maw reaches past
   * `bandTop` into the control band.
   */
  ry: number;
  /** Half width at rest, and at full intake, in tiles. */
  rxRest: number;
  rxOpen: number;
  draw(ctx: CanvasRenderingContext2D, m: MouthFrame, skin: HullSkin): void;
}

/**
 * The throat a pod is taken in through — no round hole at rest any more.
 *
 * There used to be a dark ellipse sitting on the hull whether or not anything
 * was happening at all, which is what a *port* looks like: a hole cut in a
 * body. The mouth is a cloaca now (`cannon-maw.ts`'s `LAY_LOOK` draws the body
 * itself), and a body part does not appear until it is used — this draws
 * nothing at rest and only opens into the throat a swallow needs. `drop`
 * moved further below the tip for the same reason: the mouth belongs to the
 * ship's side of the lobe now, not to its peak.
 */
export const MOUTH_LOOK: MouthLook = {
  drop: 0.26,
  ry: 0.13,
  rxRest: 0.13,
  rxOpen: 0.94,
  draw(ctx, m, skin) {
    // At rest there is no opening to draw: the round circle is gone and the
    // body itself is the feature. The throat still opens for a pod — a
    // candidate for the *shot* has no business breaking the swallow, and
    // `swallow-bounds.test.ts` holds this exactly as it always did.
    if (m.intake <= 0.01) return;
    const rx = m.l.tile * (this.rxRest + (this.rxOpen - this.rxRest) * m.intake);
    const ry = m.l.tile * this.ry;
    ctx.fillStyle = skin.muzzle;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = m.intake > 0.5 ? PALETTE.podRim : skin.edge;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke();
  },
};

/**
 * Where the fire opening's centre actually is, given how far the maw is open.
 *
 * **Call this; do not restate it.** It was a constant until the swallow was
 * reshaped, and `cannon-maw.ts` had copied the number under a comment saying
 * it was "`drawMuzzle`'s offset" — true when written, false the moment the
 * offset started easing to zero. Two things now draw into this mouth, the
 * shot being laid and the pod being taken in, and a wind-up that gathers its
 * bolt where the mouth *used to be* is the exact failure a second copy buys.
 */
export function muzzleCenterY(l: Layout, tipY: number, intake: number): number {
  return tipY + l.tile * MOUTH_LOOK.drop * (1 - intake);
}

/** The mouth's place on a finished hull frame, for the pass that has one. */
export function mouthFrame(f: HullFrame, l: Layout, intake: number): MouthFrame {
  const tip = surface(f, f.cannonX);
  return {
    x: tip.x,
    y: muzzleCenterY(l, tip.y, intake),
    tipY: tip.y,
    l,
    intake,
    surface: (x) => surface(f, x),
  };
}

export function drawMuzzle(
  ctx: CanvasRenderingContext2D,
  f: HullFrame,
  l: Layout,
  intake: number,
  skin_: HullSkin,
): void {
  MOUTH_LOOK.draw(ctx, mouthFrame(f, l, intake), skin_);
}

/** Where a shot leaves the hull, so the bullet starts at the muzzle. */
