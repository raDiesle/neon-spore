import { type PinballState, pinPlungerAsks, pinWindable, type SimConfig } from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { pinTable, type Table } from "./pinball-table.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **PINBALL's hand on the table itself**: player 1 winding a spring his own
 * last shot left slack (`sim/pinball-hand.ts`, `docs/spec/interludes.md`,
 * PINBALL's *Three shots, three hands*).
 *
 * It shipped in the simulation on 18 September 2026 with nothing drawn to
 * take hold of, and the ring here was the look for it, exempt under *a look
 * with no shipped alternative*.
 *
 * **It stands at the right end of the band of air** the round keeps clear a
 * tile above the ship, where a table's spring lives. The bar runs in that band
 * while the wind is offered (`pinball-aim.ts`). A shove ring stood at the left
 * end through every flight until the owner made the nudge a press on 10
 * October 2026: ◀ and ▶ on both panels, there all the time
 * (`pinball-button.ts`).
 *
 * Nothing here outlives a frame, and the circle is read off `pinTable` — the
 * same call the board, the ball and the preview are drawn from, so a handle
 * cannot end up on a table that is somewhere else.
 */

/**
 * How high above the table's floor the ring hangs, in tiles.
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
 * so a ring built on `l.tile` would be wider than the board it stands on.
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

/** The line it hangs on. */
function handY(t: Table): number {
  return t.y + t.tile * (t.rows - HAND_TILES);
}

/**
 * Whether the round is playing, which is the gate every hand of this round is
 * already behind: `pinballRoundHeard` hears nothing at all in any other phase
 * (`sim/pinball-round.ts`). `pinPlungerAsks` asks it with its gate, because `pinWindable` is true through a verdict reached on a
 * slack spring and a ring would otherwise stand on a picture of an ending.
 */
export function pinAfoot(state: PinballState): boolean {
  return state.phase === "play";
}

/**
 * The press on the plunger, from either seat. The wind is the pilot's because
 * he is the seat that owns *where from* (`pinball-hand.ts`). **A press from
 * the other seat is handed through with no hold**, so the simulation can
 * refuse it once and the ring wash red (`pinball-marks.ts`) — the ring is
 * drawn on both screens. The shove that stood at the other end of the band is
 * ◀ and ▶ on both panels since 10 October 2026 (`pinball-button.ts`).
 */
export function pinballGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const pin = bossOf(field, "pinball");
  if (pin === null) return null;
  const { cfg, seat } = field;
  if (pinPlungerAsks(pin) && hitCircle(pinPlungerCircle(l, cfg), x, y)) {
    return grab(seat, seat === 1, x, y);
  }
  return null;
}

/**
 * The seat a press on an asked ring belongs to, so one mouse at a desk takes
 * the pilot's plunger rather than having it refused as the driver's
 * (`desk-grab.ts` `markSeat`).
 */
export function pinballGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const pin = bossOf(field, "pinball");
  if (pin === null) return undefined;
  if (pinPlungerAsks(pin) && hitCircle(pinPlungerCircle(l, field.cfg), x, y)) return 1;
  return undefined;
}

function grab(player: 1 | 2, owns: boolean, x: number, y: number): Touch {
  const target = "pinPlunger";
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: owns ? { kind: "drag", target, player, originX: x, originY: y } : null,
  };
}

/**
 * The plunger's ring, drawn **after the hull**: the table's floor is the
 * ship's own skin and the ring stands a tile and a half above it, which is
 * inside the band the hull pass bows, parts and lights (`pinball-round.ts`
 * draws the membrane last for the same reason the blast is drawn there).
 *
 * **It is drawn on both screens, his bright and hers dim**, the bargain
 * `sinew-handles.ts` made: a navigator who could not see that the spring is
 * slack would be firing on a bar that is not going to run.
 *
 * **Its dial is empty and stays empty.** The wind is a carry measured on the
 * lift and the simulation remembers nothing about a thumb on the way down
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
  if (!pinAfoot(state)) return;
  if (pinWindable(state)) ring(ctx, pinPlungerCircle(l, cfg), l, 1, 0, time);
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
    theirs: !mine,
  });
}
