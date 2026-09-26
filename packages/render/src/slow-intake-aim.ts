import type { SimConfig } from "@neon-spore/sim";
import { beatSeconds, gripsCreature, instarBoss, MILLI, type World } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import { smoothstep } from "./ease.js";
import { instarAt, instarLen } from "./instar-place.js";
import { instarBody } from "./instar-sway.js";
import { instarEnginesAt } from "./instar-turn.js";
import { type Layout, tileCX } from "./layout.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **The two questions this look has to settle before it draws anything**:
 * where the body the window is about stands and how wide it is, and how far up
 * the look stands this frame.
 *
 * A sibling rather than lines inside the paint because two passes need both
 * answers — the light has to know where to stop and the bar has to know
 * when to be gone — and an answer written twice is an answer that drifts.
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
 * game comes back up to speed.
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

/**
 * The body this window is about: where it stands, how wide it is, and where
 * the rest of it runs to.
 *
 * `ax`/`ay` is the far end of the body's own axis — THE INSTAR hangs head-down
 * off a chain of four plates that leaves the top of the field, and a keep-out
 * that only knew about the head would let the light cross the chain, which is
 * the half of the owner's *not above the boss shape* that a disc misses. For a
 * body with nothing hanging off it the axis is a point and the keep-out is the
 * disc again.
 */
export interface Aim {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly ax: number;
  readonly ay: number;
}

/**
 * **The body this window is about, and how much room it takes.**
 *
 * `r` is the thing's own extent and not a handle's: the owner asked on 22
 * September 2026 for the light to stand *around the full boss* and to stop
 * before its body rather than crossing it, so a radius that meant "a thumb's
 * worth" would put every stream inside the head. THE INSTAR's figure already
 * carries the head's centre and radius for the frame it is drawn in
 * (`instar-shape.ts`), morph and all, so the boss is asked rather than
 * guessed — a body mid-morph is a different size and the light follows it.
 *
 * **Read fresh every frame and never remembered**: a body that moves takes the
 * light with it, and a window that ends leaves nothing behind.
 *
 * The fallbacks are in the order the field is worth looking at: a held body if
 * anybody has a hand down, and the cannon's own column if nobody has — which is
 * at worst the column the pair is aiming, and never nothing.
 */
export function aim(world: World, l: Layout, beat: number, beatPhase: number): Aim {
  const instar = instarBoss(world);
  if (instar !== null) {
    const { f } = instarBody(instar, world.cfg, beat, beatPhase);
    const { x, y } = instarAt(l, f.headX, f.headY);
    // The far end of the body, where its engines burn — the same point the
    // drawers run the body back to, turned as they turn it (`instar-turn.ts`).
    const top = instarEnginesAt(l, f);
    return { x, y, r: instarLen(l, f.headR), ax: top.x, ay: top.y };
  }
  // Whose grip it is belongs to `grip.ts`, so each body is asked rather than
  // the two grip fields read (`world-ship.ts`, and `focus` does the same).
  const held = world.creatures.filter(
    (c) => gripsCreature(world, 1, c.id) || gripsCreature(world, 2, c.id),
  );
  const first = held[0];
  if (first !== undefined) {
    const { x, y } = flatCenter(l, first, beatPhase);
    return { x, y, r: flatRadius(l, world.cfg, first, beatPhase), ax: x, ay: y };
  }
  const cannon = tileCX(l, world.cannonCol);
  return { x: cannon, y: l.hullY, r: l.tile / 2, ax: cannon, ay: l.hullY };
}
