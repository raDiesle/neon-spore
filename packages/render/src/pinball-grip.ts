import { type PinballState, pinNudgeable, pinWindable, type SimConfig } from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { pinTable, type Table } from "./pinball-table.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **PINBALL's two hands on the table itself**: player 1 winding a spring his
 * own last shot left slack, and player 2 shoving a table she can do nothing
 * else about (`sim/pinball-hand.ts`, `docs/spec/interludes.md`, PINBALL's
 * *Three shots, three hands*).
 *
 * Both shipped in the simulation on 18 September 2026 with nothing drawn to
 * take hold of — that lane's own note says so: *the plunger is drawn the same
 * whether the spring is slack or wound, nothing marks the table as a thing a
 * thumb may shove.* The look is exempt under *a look with no shipped
 * alternative*: there was no drawing of either control to run a candidate
 * against.
 *
 * **The two are never on the screen together**, and that is what decided where
 * they go. The wind is offered through `power` and the shove through `flight`,
 * which are different shots of the same ball — so the round may put both in
 * the one band of air it keeps clear, a tile above the ship, and each has the
 * whole of it. The bar runs in that band while the wind is offered
 * (`pinball-aim.ts`) and nothing at all is drawn there during a flight.
 *
 * **His is at the right end of it and hers at the left**, which is the one
 * thing about the pair that is arbitrary and is worth being arbitrary about: a
 * round that put two different hands in one place would be teaching the pair
 * that *the handle is over there*, and they would find the wrong one first the
 * first time both gestures came up in one table.
 *
 * Nothing here outlives a frame, and both circles are read off `pinTable` —
 * the same call the board, the ball and the preview are drawn from, so a
 * handle cannot end up on a table that is somewhere else.
 */

/**
 * How high above the table's floor both rings hang, in tiles.
 *
 * Half a tile above the strength bar's own line (`BAR_TILES`), which puts the
 * ring clear of the trough rather than on it: the bar is a reading the pair
 * fire on, and a thumb-sized disc sitting in it would cover the part of it
 * that fills. It also clears the ball waiting in the muzzle — drawn a third of
 * a tile above the skin at `pinballBallMilli` — and the swelling the cannon
 * rises with, neither of which this round ever lifts.
 *
 * Above it there is nothing either: a board hangs from `PIN_TOP_TILES` and
 * `pinballFault` refuses one whose lowest piece stands in the bucket's lane
 * (`content/pinball-rounds.ts`), which is the whole reason a bar could be
 * drawn across this table in the first place.
 */
const HAND_TILES = 1.55;

/**
 * And where along the band they stand: the bar's own inset, plus the ring's
 * own radius.
 *
 * The inset alone is where the bar *ends*, and a disc centred on the end of a
 * line hangs half of itself past it — on a phone this narrow the table's walls
 * are the screen's edges, so the first frame taken of the plunger's ring had
 * it sliced down the middle by the right edge. One radius further in puts the
 * rim on the bar's own end and the whole disc over the board.
 */
const HAND_INSET = 0.35;

/**
 * The handle's radius on the table's own scale.
 *
 * `handleRadius` owns what fraction of a tile a handle is and is called for
 * it; what changes here is *which* tile. The table's is the narrower of the
 * field's width over `pinballCols` and the air between the grid and the hull,
 * so a ring built on `l.tile` would be wider than the board it stands on
 * (`snake-grip.ts` makes the same trade for the same reason).
 */
function ringRadius(l: Layout, cfg: SimConfig, t: Table): number {
  return handleRadius(l, cfg) * (t.tile / l.tile);
}

/** The plunger: the right end of the band, where a table's spring lives. */
export function pinPlungerCircle(l: Layout, cfg: SimConfig): Circle {
  const t = pinTable(l, cfg);
  const r = ringRadius(l, cfg, t);
  return { x: t.x + t.tile * (t.cols - HAND_INSET) - r, y: handY(t), r };
}

/** And the shove: the left end of the same band, as far from his as it goes. */
export function pinTableCircle(l: Layout, cfg: SimConfig): Circle {
  const t = pinTable(l, cfg);
  const r = ringRadius(l, cfg, t);
  return { x: t.x + t.tile * HAND_INSET + r, y: handY(t), r };
}

/** The one line both of them hang on. */
function handY(t: Table): number {
  return t.y + t.tile * (t.rows - HAND_TILES);
}

/**
 * Whether the round is playing, which is the gate every hand of this round is
 * already behind: `pinballRoundHeard` hears nothing at all in any other phase
 * (`sim/pinball-round.ts`), and it is asked here rather than left to the two
 * predicates because neither of them says anything about the clock.
 *
 * It matters. `pinWindable` is true through a verdict reached on a slack
 * spring — the shot is still `power` and nothing resets it — so without this a
 * ring would stand on a picture of an ending, offering a gesture the round has
 * already stopped listening for.
 */
function afoot(state: PinballState): boolean {
  return state.phase === "play";
}

/**
 * The press, answered for whichever of the two this seat owns. A press from
 * the wrong seat falls through to whatever is behind it exactly as if no ring
 * were there — the wind is the pilot's because he is the seat that owns *where
 * from*, and the shove is hers because it is the one thing she has while a
 * ball falls (`pinball-hand.ts`).
 */
export function pinballGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const pin = bossOf(field, "pinball");
  if (pin === null || !afoot(pin)) return null;
  const { cfg, seat } = field;
  if (seat === 1 && pinWindable(pin) && hitCircle(pinPlungerCircle(l, cfg), x, y)) {
    return grab("pinPlunger", 1, x, y);
  }
  if (seat === 2 && pinNudgeable(pin) && hitCircle(pinTableCircle(l, cfg), x, y)) {
    return grab("pinTable", 2, x, y);
  }
  return null;
}

function grab(target: "pinPlunger" | "pinTable", player: 1 | 2, x: number, y: number): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
  };
}

/**
 * Both hands, drawn **after the hull**: the table's floor is the ship's own
 * skin and these two stand a tile and a half above it, which is inside the
 * band the hull pass bows, parts and lights (`pinball-round.ts` draws the
 * membrane last for the same reason the blast is drawn there).
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb, and each
 * of these is a thing the other seat is waiting on. It earns it twice here —
 * a navigator who could not see that the spring is slack would be firing on a
 * bar that is not going to run, and a pilot who could not see her one shove
 * spent would go on asking for another.
 *
 * **The shove's dial is the count, and it fills when the nudge is gone**:
 * `nudges` out of `pinballNudges`, which is one — so an empty ring is a shove
 * in hand and a full one is *the next one tilts it*, which is the sentence the
 * round exists to make the pair say. The tilt itself takes the ring off the
 * table, because from there her hand is dead for the rest of the flight and a
 * handle that answered nothing would be worse than none.
 *
 * **The plunger's is empty and stays empty.** The wind is a carry measured on
 * the lift and the simulation remembers nothing about a thumb on the way down
 * (`windHeard`), so there is no number to put on the ring that would not be
 * the picture inventing one. What answers instead is the bar beside it: the
 * ring goes out and the trough starts running, in the same frame.
 */
export function drawPinballGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PinballState,
  time: number,
): void {
  if (!afoot(state)) return;
  if (pinWindable(state)) ring(ctx, pinPlungerCircle(l, cfg), l, 1, 0, time);
  if (!pinNudgeable(state)) return;
  const spent = Math.max(0, Math.min(1, state.nudges / Math.max(1, cfg.pinballNudges)));
  ring(ctx, pinTableCircle(l, cfg), l, 2, spent, time);
}

/**
 * One ring, in the hull's own violet.
 *
 * Not the board's colours: a peg is `rock` and a target is `pod`, and a ring
 * in either would read as one more thing on the table to hit rather than as a
 * thing to take hold of. Violet is what every handle in the game is, and on
 * this table it is worn by nothing else.
 */
function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  pull: number,
  time: number,
): void {
  const mine = l.role === "test" || (l.role === "p1") === (player === 1);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.hull : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held: false,
    pull,
    time,
  });
}
