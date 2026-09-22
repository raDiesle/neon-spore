import {
  type SimConfig,
  type UndertowState,
  undertowBoss,
  undertowLobeAt,
  undertowPinned,
  undertowUnseated,
  type World,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE UNDERTOW's two hands**, and the circles the drawing and the hit test
 * share: the navigator's thumb pinning a lobe shut, and her thumb on the
 * column the floor has the pilot stuck in (`sim/undertow-hand.ts`,
 * `docs/spec/bosses.md` §11.20).
 *
 * Both gestures shipped in the simulation with nothing drawn to take hold of.
 * The look is exempt under *a look with no shipped alternative*: there was no
 * drawing of either control to run a candidate against.
 *
 * **Both are hers, and that is the point of them.** His hands are the cannon
 * and the maw and they are full; her plate faces down for the whole of this
 * fight, so her seat is the one with a thumb to spare. They are also the pair
 * that reaches across the split: the free is the only control in the game
 * that gives the other player his own seat back.
 *
 * **Neither ring is on the hull's skin, and both are read off `l.hullY`.**
 * That skin is a function of x the draw files are handed and a hit test is
 * not, and it is never more than a fraction of a tile off the line — the
 * argument the captions make for ringing this same boss (`bossAnchorE` in
 * `caption-anchor-boss-e.ts`). A ring is a ring and not a trace.
 */

/**
 * How far above the hull line the pin's ring floats, in tiles: just clear of
 * the plating, in the lobe's own throat.
 *
 * **Where a plate would stand**, which is the whole of what this handle is:
 * `undertowPinned` is asked on the same line as `world.shieldCol` in both
 * places that number is asked (`undertow-step.ts`, `undertow-press.ts`), so
 * her thumb *is* a second plate and the handle belongs where the first one
 * goes. It clears the lobe's own two bands as well — the cyan on a tall one's
 * top third means *the beam and not the maw* (`undertow-lobe.ts`), and a ring
 * over it would cover the one thing the pilot is being told.
 */
const PIN_UP = 0.45;

/**
 * And how far above it the free's ring hangs, in tiles: a clear tile, over the
 * stuck cannon rather than on it. It clears the plate, the cannon under it and
 * the bow rising off the skin in that same column — the one warning either
 * seat gets — and hangs in air nothing of this fight is drawn in.
 */
const FREE_UP = 1.2;

/** The circle on a lobe standing in `col`, wherever the column is drawn. */
export function undertowPinCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return { x: tileCX(l, col), y: l.hullY - l.tile * PIN_UP, r: handleRadius(l, cfg) };
}

/** The circle over the unseated pilot's column, which is the cannon's own. */
export function undertowFreeCircle(l: Layout, cfg: SimConfig, cannonCol: number): Circle {
  return { x: tileCX(l, cannonCol), y: l.hullY - l.tile * FREE_UP, r: handleRadius(l, cfg) };
}

/**
 * Whether the boss is offering a thumb that column: `pin`'s own gate read back
 * rather than restated — a lobe standing in it, and not the last one, which
 * `undertowTake` refuses in that phase and where a pin could only be a way for
 * her to spoil his hold.
 */
export function undertowPinnable(u: UndertowState, col: number): boolean {
  return u.phase !== "last" && undertowLobeAt(u, col) !== null;
}

/**
 * And whether it is offering her his column, which is the whole of `free`'s:
 * only while he is actually unseated. Before that the same thumb in the same
 * place is a thumb on the hull, and the count it would bank is time she did
 * not spend watching the bow.
 */
export function undertowFreeable(u: UndertowState, beat: number): boolean {
  return undertowUnseated(u, beat);
}

/**
 * The press, answered for whichever of the two it landed on. **Both are
 * player 2's**, so a press from the pilot falls through to whatever is behind
 * it exactly as if no ring were there — he has the cannon and the maw, and a
 * seat that could pin its own breach would be one phone playing this fight.
 *
 * The free is asked **first**: his column is a column like any other, so a
 * push that unseats him in a column that already has a lobe standing in it
 * puts both rings in one column, a tile apart. The free is the one with the
 * clock running on it.
 */
export function undertowGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const u = bossOf(field, "undertow");
  if (u === null || field.seat !== 2) return null;
  const { cfg, beat } = field;
  if (undertowFreeable(u, beat) && hitCircle(undertowFreeCircle(l, cfg, field.cannonCol), x, y)) {
    return grabFree(x, y);
  }
  // The nearest standing lobe wins a thumb that covers two, which is
  // `lidCordUnder`'s rule and for its reason: the body a player meant is the
  // one they put their thumb closest to. Two lobes are four columns apart
  // (`undertow-step.ts`), so this decides nothing in practice and decides it
  // the same way every other handle that comes in numbers does.
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const b of u.breaches) {
    if (!undertowPinnable(u, b.col)) continue;
    const at = undertowPinCircle(l, cfg, b.col);
    if (!hitCircle(at, x, y)) continue;
    const d = Math.hypot(x - at.x, y - at.y);
    if (d >= bestDist) continue;
    best = b.col;
    bestDist = d;
  }
  if (best === null) return null;
  return grabPin(x, y, best);
}

/**
 * Her free: a plain drag on a target that carries no number, because there is
 * only one seat to haul off and the world knows which column he is in.
 */
function grabFree(x: number, y: number): Touch {
  return {
    player: 2,
    command: { kind: "drag", target: "undertowFree", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "undertowFree", player: 2, originX: x, originY: y },
  };
}

/**
 * And her pin, which carries the column as its `id` — the one thing `pin`
 * reads off the command (`sim/undertow-hand.ts`), and the thing the lift has
 * to carry too so that letting go unpins the lobe her thumb was on rather
 * than whichever one the boss has by then.
 */
function grabPin(x: number, y: number, col: number): Touch {
  return {
    player: 2,
    command: {
      kind: "drag",
      target: "undertowPin",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: col,
    },
    hold: { kind: "drag", target: "undertowPin", player: 2, originX: x, originY: y, id: col },
  };
}

/**
 * Both hands, drawn **on the finished ship** beside the plating they are for
 * (`frame-on-ship.ts`), and not with the lobes.
 *
 * The lobes go down with the field pass and the ship is painted over them;
 * both of these rings stand within a tile of the hull line, where that pass is
 * at its busiest — bowing plate, parted flaps, lit seams, rising edge, all
 * drawn after. A ring laid down with the lobes would be under every one of
 * them, which is `undertow-draw.ts`'s own argument for the plating being here.
 *
 * **Each is drawn on both screens, hers bright and his dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb. It earns
 * more here than anywhere it has been used yet — the free is *his* seat she is
 * hauling the plate off, and a pilot who could not see it coming would sit out
 * `undertowUnseatedBeats` with no idea he was being bought back.
 *
 * **A pinned lobe keeps its ring, drawn `held`.** `pin` refuses a second thumb
 * on the column it is already on, so a ring that went by what the gesture
 * would accept next would vanish off the one lobe on the field that is doing
 * something.
 *
 * The free's dial is the count itself: `freed` beats out of
 * `undertowFreeBeats`, with the beat it is inside, so what the pair watch fill
 * is the number the simulation is going to act on.
 *
 * **The cannon's own column, not the eased x the ship pass carries.** They are
 * the same number here — a pilot is unseated exactly while his verbs are
 * refused, so the lobe stands still for every frame this ring is drawn in —
 * and reading the world is what keeps the ring and the hit test in one place.
 */
export function drawUndertowGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const { cfg } = world;
  for (const b of u.breaches) {
    if (!undertowPinnable(u, b.col)) continue;
    const pinned = undertowPinned(u, b.col);
    ring(ctx, undertowPinCircle(l, cfg, b.col), l, pinned, pinned ? 1 : 0, time);
  }
  if (!undertowFreeable(u, world.beat)) return;
  const held = u.freeHeld;
  const beats = u.freed + (held ? beatPhase : 0);
  const pull = Math.max(0, Math.min(1, beats / cfg.undertowFreeBeats));
  ring(ctx, undertowFreeCircle(l, cfg, world.cannonCol), l, held, pull, time);
}

/**
 * One ring. Both handles are player 2's, so the seat test is the same for
 * both: bright on hers and on the rig, dim on his.
 *
 * **Hull purple on a grey animal.** A lobe is `rockDark` under a `rock`
 * outline and carries cyan and red where it is saying something, so a ring in
 * any of those three would read as more lobe rather than as a thing to press.
 *
 * `pull` is the caller's, and the two mean different things by it. A pinned
 * lobe draws its dial full round, which is what every hold in the game draws:
 * the pin banks nothing and holds for exactly as long as her thumb does. The
 * free's is the count, and it is drawn **whether or not her thumb is still
 * down** — lifted off, the count keeps (`sim/undertow-hand.ts`), and a dial
 * that emptied on a slip would take the number off both screens at the one
 * moment the pair is reading it.
 */
function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  held: boolean,
  pull: number,
  time: number,
): void {
  const mine = l.role !== "p1"; // both are player 2's, so the rig sees hers
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.hull : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull,
    time,
  });
}
