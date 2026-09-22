import { undertowBoss, undertowPinned, type World } from "@neon-spore/sim";
import { drawHandleRing } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import {
  undertowFreeable,
  undertowFreeCircle,
  undertowPinCircle,
  undertowPinnable,
} from "./undertow-grip-place.js";

/**
 * **THE UNDERTOW's two hands**, taken hold of and drawn: the navigator's thumb
 * pinning a lobe shut, and her thumb on the column the floor has the pilot
 * stuck in (`sim/undertow-hand.ts`, `docs/spec/bosses.md` §11.20). Where each
 * of them is, and whether the fight is offering it, is next door
 * (`undertow-grip-place.ts`) — one answer, asked by the press and the picture
 * both.
 *
 * Both gestures shipped in the simulation with nothing drawn to take hold of.
 * The look is exempt under *a look with no shipped alternative*: there was no
 * drawing of either control to run a candidate against.
 */

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
 * **The free is drawn on both screens, hers bright and his dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb. It earns
 * more here than anywhere it has been used yet — the free is *his* seat she is
 * hauling the plate off, and a pilot who could not see it coming would sit out
 * `undertowUnseatedBeats` with no idea he was being bought back.
 *
 * **The pin is not, and the frame is what said so.** A ring fills its disc in
 * `PALETTE.background` before anything else (`handle-draw.ts`), so his dim copy
 * came out a flat black disc filling the head of the lobe under it — and a
 * lobe with a hole in it is what a breach looks like on this very hull
 * (`undertow-draw.ts`). It stood on every standing lobe at once, which is his
 * whole target list, to offer him a thumb the wire drops. So his screen is
 * shown **the pin she has made and not the ones she could**: one ring at most,
 * in the column `undertowPinned` is keeping his maw out of, which is the only
 * thing about this handle he can act on (`undertow-press.ts`). Hers is
 * unchanged — every lobe she may pin carries one.
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
  const offers = l.role !== "p1";
  for (const b of u.breaches) {
    if (!undertowPinnable(u, b.col)) continue;
    const pinned = undertowPinned(u, b.col);
    if (!pinned && !offers) continue;
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
