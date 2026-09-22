import { flatCenter, flatRadius } from "../../../../../packages/render/src/creature-place.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import {
  instarMarkPoint,
  instarMarkRadius,
} from "../../../../../packages/render/src/instar-shape.js";
import { type Layout, tileCX } from "../../../../../packages/render/src/layout.js";
import type { SlowWindow } from "../../../../../packages/render/src/slow-look.js";
import type { SimConfig } from "../../../../../packages/sim/src/config.js";
import { beatSeconds } from "../../../../../packages/sim/src/config-derived.js";
import { gripsCreature } from "../../../../../packages/sim/src/grip.js";
import { instarBoss, instarStep } from "../../../../../packages/sim/src/instar.js";
import { MILLI, type World } from "../../../../../packages/sim/src/world.js";

/**
 * **The two questions every quiet answer in this slot has to settle before it
 * draws anything**: where the one thing the pair are looking at is, and how
 * far up the look stands this frame.
 *
 * **A copy, and it has to be.** `bun run versus adopt` moves only the files
 * beside the winning candidate's own `index.ts` and deletes every other
 * directory in the slot (`tools/versus/take-function-fs.ts`), so a candidate
 * that imported this from its neighbour would be a candidate that could not be
 * taken. `gather/aim.ts` is the copy the prose belongs to; `hush` and `indraw`
 * carry it word for word. One of the three survives the vote and the other two
 * go with the slot.
 *
 * A sibling rather than lines inside `paint.ts` because `gather` is three
 * layers over one point and one ramp, and burying the point and the ramp
 * among the gradients is how the ramp ends up written twice. `bun run versus
 * adopt` moves a candidate's siblings with it (`tools/versus/README.md`), so
 * this costs the slot nothing at the moment it is taken.
 */

/**
 * Seconds the look takes to arrive, and again to leave — the owner's figure,
 * 22 September 2026, and the whole of what "smooth transition" means here.
 *
 * **It is spent at both ends of the window and never outside it.** A look that
 * faded for four tenths of a second *after* the window shut would have to
 * remember that it had been open, and nothing in this pass may outlive a
 * frame: `drawFieldSlow` does not call `paint` at all once `slowing` is false,
 * and the only place a renderer may keep something between frames is `Effects`
 * (`slow-look.ts`, `render/test/restart.test.ts`). So the fade out is inside
 * the window's own last four tenths and lands at nought on the exact beat the
 * game comes back up to speed — which is the thing the other four candidates
 * in this slot do not do: every one of them is at its loudest on the frame
 * before the shut and gone on the frame after it.
 */
const EASE_SECONDS = 0.4;

/**
 * How far up the look stands: nought on the beat the window opens, one four
 * tenths of a second later, and nought again as it shuts.
 *
 * **Asked for in seconds and spent in beats**, and the exchange rate is the
 * point of this function. `SlowWindow` counts beats because a window is spent
 * at `slowRateMilli` and wall seconds would be a second clock disagreeing with
 * the one the pair are hearing (`slow-look.ts`) — but a *transition* is a thing
 * an eye judges in seconds, and the eye is watching the hand, where a beat is
 * three of them. `beatSeconds` and `slowRateMilli` are called rather than
 * re-derived; nothing here writes a tempo down.
 */
export function ramp(win: SlowWindow, cfg: SimConfig): number {
  const inHand = beatSeconds(cfg) * (MILLI / cfg.slowRateMilli);
  const ease = inHand <= 0 ? 0 : EASE_SECONDS / inHand;
  if (ease <= 0) return 1;
  return Math.min(smoothstep((win.beats - win.left) / ease), smoothstep(win.left / ease));
}

/** A place on the field and how wide the thing standing there is. */
export interface Aim {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * **The one almost-stationary thing this window is about**, in one point.
 *
 * `focus` lights every anchor it can find — each mark, each held body, the
 * muzzle — and the owner's brief for these three is the opposite shape: one
 * centre, and everything else soft around it. So the anchors are found the
 * same way and then collapsed. A step of marks answers together, so its
 * centroid is the thing the pair's eyes are actually on, and `r` carries the
 * spread as well as the handle so a step three columns wide does not get the
 * halo of a single mark.
 *
 * **Read fresh every frame and never remembered**: a thumb that moves takes
 * the light with it, and a window that ends leaves nothing behind.
 *
 * The fallbacks are in the order the field is worth looking at: a held body if
 * anybody has a hand down, and the cannon's own column if nobody has — which
 * is at worst the column the pair is aiming, and never nothing.
 */
export function aim(world: World, l: Layout, beatPhase: number): Aim {
  const instar = instarBoss(world);
  const step = instar === null ? null : instarStep(instar);
  const marks = step?.marks ?? [];
  if (marks.length > 0) {
    const pts = marks.map((m) => instarMarkPoint(l, m));
    const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const spread = Math.max(...pts.map((p) => Math.hypot(p.x - x, p.y - y)));
    return { x, y, r: instarMarkRadius(l, world.cfg) + spread };
  }
  // Whose grip it is belongs to `grip.ts`, so each body is asked rather than
  // the two grip fields read (`world-ship.ts`, and `focus` does the same).
  const held = world.creatures.filter(
    (c) => gripsCreature(world, 1, c.id) || gripsCreature(world, 2, c.id),
  );
  const first = held[0];
  if (first !== undefined) {
    const { x, y } = flatCenter(l, first, beatPhase);
    return { x, y, r: flatRadius(l, world.cfg, first, beatPhase) };
  }
  return { x: tileCX(l, world.cannonCol), y: l.hullY, r: l.tile / 2 };
}
