import { type LedgerState, ledgerHaulable, type SimConfig } from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { ledgerCordAt, ledgerRootPoint, ledgerSocketPoint, ledgerTaut } from "./ledger-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **The pilot's carry on the taut cord**, which is how this fight can now be
 * ended by hand (`sim/ledger-hand.ts`, `haul`).
 *
 * Its own file beside `ledger-pull.ts`, and the seam is the gesture. His two
 * share a seat and nothing else: the bead's ring rides a return down a cord
 * only he is shown, and this one stands still in a stretch of cord **both**
 * screens draw whole — so the seat rule, the place and the dial are different
 * facts in each, and the pair of them written out together went past the
 * 250-line limit saying so. Her two are the opposite case and share one file
 * and one circle (`ledger-grip.ts`).
 *
 * The ring on it is the pilot's, drawn dim on the navigator's screen, and the
 * whole argument for both halves of that is in `drawLedgerPulls` next door.
 */

/**
 * How far down the cord his carry starts, 0 at the body and 1 at the socket.
 *
 * **Above `FADE_FROM`**, which is the number that chose it and not a
 * composition: from 0.58 down, the cord is faded out on his own screen
 * (`ledger-cord.ts`), and a handle drawn in that stretch would be a mark
 * standing in a rooted column he is not shown — putting back exactly what the
 * fade takes away. A sixth of the cord clear of it, so the ring's own radius
 * is clear too.
 *
 * The carry is *downward* from there (`fromYMilli`, `ledgerHaulMilli`), so
 * what is below it is the room the gesture needs: better than half the cord,
 * against a tear that costs 1.9 tiles.
 */
const HAUL_U = 0.42;

/**
 * **Where either of his rings is, on a cord drawn with no sway** — `time`
 * nought, which makes the bend the exact midpoint and the curve the straight
 * line between its ends (`ledgerCordAt`, `bendOf`).
 *
 * A hit test may not read the wall clock: it is handed a `Field`, which is the
 * world as the control scheme sees it and has no such number in it, and THE
 * UNDERTOW's ruling about this same ship says why — a ring is a ring and not a
 * trace. What it costs is nothing a thumb can feel. The bow is
 * `BOW * (1 - taut)` and both of these gestures are offered late: `whipping`
 * is a seam of two of five at the earliest, so the bow is at most 0.275 of a
 * tile and a point on the curve is displaced by `2u(1-u)` of it — 0.1375 of a
 * tile at the middle, worst case, against a handle 0.3 of a tile across. The
 * drawn bead never leaves the circle it is answered in. On the `taut` cord
 * this one stands on, `ledgerTaut` is exactly 1 and there is no bow at all.
 */
export const STILL = 0;

export function ledgerCordRing(
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  time: number,
  u: number,
): Circle {
  const taut = ledgerTaut(cfg, t);
  const at = ledgerCordAt(l, ledgerRootPoint(l, cfg, t), ledgerSocketPoint(l, t), taut, time, u);
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/** **His ring on the taut cord**, at the one place on it his screen draws whole. */
export function ledgerHaulCircle(l: Layout, cfg: SimConfig, t: LedgerState, time = STILL): Circle {
  return ledgerCordRing(l, cfg, t, time, HAUL_U);
}

/**
 * The haul's dial is the carry itself, `haulMilli` out of `ledgerHaulMilli`,
 * and a thumb resting on the cord with no carry in it reads as no hand at all
 * — which is what it is. Nothing here asks whether the plate is covering the
 * socket: that refusal is silent on purpose and the dial standing at nought is
 * the whole of what he gets back for it (`sim/ledger-gates.ts`).
 */
export function drawLedgerHaul(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  beat: number,
  time: number,
): void {
  if (!ledgerHaulable(t, cfg, beat)) return;
  const pull = Math.max(0, Math.min(1, t.haulMilli / Math.max(1, cfg.ledgerHaulMilli)));
  drawPilotRing(ctx, ledgerHaulCircle(l, cfg, t, time), t.haulMilli > 0, pull, time);
}

/**
 * Either of his, in the violet everything at this end of the cord already is:
 * the cord, its beads and the grommet are the hull's own colour because what
 * travels them is the ship's own damage (`ledger-cord.ts`). The white is left
 * to the lock that names her column, and the two must not be the same mark.
 *
 * **There is no dim one**, which is the whole seat rule of this fight said a
 * second time (`ledger-pull.ts`): a ring fills its disc opaquely, so a dimmed
 * one is a dark circle sitting on the cord — and a dark circle on a cord is
 * what a *return* looks like. Her screen is never shown a return. The first
 * frame taken of this had one on it.
 */
export function drawPilotRing(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  held: boolean,
  pull: number,
  time: number,
): void {
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: PALETTE.hull,
    rim: PALETTE.hullRim,
    held,
    pull,
    time,
  });
}
