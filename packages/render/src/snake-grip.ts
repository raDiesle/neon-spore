import {
  type SimConfig,
  type SnakeState,
  snakeCrashed,
  snakeGrip,
  snakeJawsAsks,
  snakeTailAsks,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { snakeJoints, snakeSlide } from "./snake-body.js";
import { gape } from "./snake-clock.js";
import { type Arena, snakeArena } from "./snake-draw.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **SNAKE's two hands on its own body**: the pilot prising the stuck jaws open
 * and the driver holding the dragging tail clear (`sim/snake-controls.ts`,
 * `docs/spec/interludes.md`, SNAKE's *Three bodies, three gestures*).
 *
 * Both shipped in the simulation on 18 September 2026 with nothing on either
 * screen to take hold of: past `snakeGorgeTiles` the MAW press goes dead and
 * the mouth becomes a thing to be pulled open, past `snakeShedTiles` the tail
 * may be lifted — and neither the head nor the tail has carried a mark saying
 * so. The look is exempt under *a look with no shipped alternative*: there was
 * no drawing of either control to run a candidate against.
 *
 * **The body grows its own controls**, which is what makes these two unlike
 * every handle on a field. A boss hands out a handle when it is losing; this
 * round hands them out when the pair is *winning* — the body is long because
 * it has eaten — so a frame with two rings on it is a frame of a round going
 * well and about to become unplayable without them.
 *
 * **Neither ring covers what the pair is reading.** `drawHandleRing` fills
 * opaquely, and the head is the muzzle, the mouth and the heading all at once —
 * the one thing on this arena both seats aim with. So the pilot's ring sits a
 * tile back, on the first segment of the neck: his thumb lands behind the jaws and pulls,
 * which is what prising them apart is. Hers is on the tail's last joint, where
 * there is nothing else drawn at all.
 *
 * **Both ride the slide.** The body steps a whole tile at a time and the
 * picture carries it the whole way there between steps (`snake-body.ts`), so a
 * circle placed on the stored tiles would be up to a tile behind the thing it
 * is drawn on — which is why `Field` carries a tick now and not only a beat.
 */

/** The segment the pilot's ring stands on: the neck, one back from the jaws. */
const NECK = 1;

/**
 * The handle's radius on the arena's own scale.
 *
 * `handleRadius` owns what fraction of a tile a handle is and is called for
 * it; what changes here is *which* tile. The arena's is the narrower of the
 * field's width over `snakeCols` and the air it has to stand in, so a ring
 * built on `l.tile` would be a handle wider than the body it is on.
 */
function ringRadius(l: Layout, cfg: SimConfig, arena: Arena): number {
  return handleRadius(l, cfg) * (arena.tile / l.tile);
}

/** Where the body's joints are this tick, slid. Null while there is no body. */
function joints(l: Layout, cfg: SimConfig, snake: SnakeState, tick: number) {
  const arena = snakeArena(l, cfg);
  return { arena, at: snakeJoints(arena, snake, snakeSlide(cfg, snake, tick)) };
}

/** The pilot's circle: on the neck, a tile behind the jaws he is prising. */
export function snakeJawsCircle(
  l: Layout,
  cfg: SimConfig,
  snake: SnakeState,
  tick: number,
): Circle | null {
  const { arena, at } = joints(l, cfg, snake, tick);
  const neck = at[NECK];
  return neck === undefined ? null : { x: neck.x, y: neck.y, r: ringRadius(l, cfg, arena) };
}

/** The driver's circle: on the last joint of the tail she is lifting. */
export function snakeTailCircle(
  l: Layout,
  cfg: SimConfig,
  snake: SnakeState,
  tick: number,
): Circle | null {
  const { arena, at } = joints(l, cfg, snake, tick);
  const tail = at[at.length - 1];
  return tail === undefined ? null : { x: tail.x, y: tail.y, r: ringRadius(l, cfg, arena) };
}

/**
 * Whether there is a body on the arena at all: playing, and not folded up
 * against whatever stopped it. Nothing player 1 has works through a crash
 * (`snakeHeard`), and a ring on a body being drawn crumpling would be a handle
 * on a picture of a mistake.
 */
export function snakeAfoot(snake: SnakeState): boolean {
  return snake.phase === "play" && !snakeCrashed(snake);
}

/**
 * The press on whichever of the two is asked, from either seat. Which seat
 * each is asked of is the simulation's (`snakeJawsAsks`, `snakeTailAsks`): the
 * prise is the pilot's and the lift is the driver's, and the split is the
 * round's whole content. **A press from the other seat is handed through with
 * no hold**, so the sim can refuse it once and the ring wash red
 * (`snake-marks.ts`) — both rings are drawn on both screens, so a thumb can
 * land on the wrong one.
 */
export function snakeGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const snake = bossOf(field, "snake");
  if (snake === null) return null;
  const { cfg, seat, tick } = field;
  if (snakeJawsAsks(cfg, snake, tick)) {
    const at = snakeJawsCircle(l, cfg, snake, tick);
    if (at !== null && hitCircle(at, x, y)) return grab("snakeJaws", seat, seat === 1, x, y);
  }
  if (snakeTailAsks(cfg, snake)) {
    const at = snakeTailCircle(l, cfg, snake, tick);
    if (at !== null && hitCircle(at, x, y)) return grab("snakeTail", seat, seat === 2, x, y);
  }
  return null;
}

/**
 * The seat a press on an asked part belongs to, so one mouse at a desk takes
 * the driver's tail rather than having it refused as the pilot's
 * (`desk-grab.ts` `markSeat`): the jaws are always his and the tail hers.
 */
export function snakeGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const snake = bossOf(field, "snake");
  if (snake === null) return undefined;
  const { cfg, tick } = field;
  const jaws = snakeJawsAsks(cfg, snake, tick) ? snakeJawsCircle(l, cfg, snake, tick) : null;
  if (jaws !== null && hitCircle(jaws, x, y)) return 1;
  const tail = snakeTailAsks(cfg, snake) ? snakeTailCircle(l, cfg, snake, tick) : null;
  if (tail !== null && hitCircle(tail, x, y)) return 2;
  return undefined;
}

function grab(
  target: "snakeJaws" | "snakeTail",
  player: 1 | 2,
  owns: boolean,
  x: number,
  y: number,
): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: owns ? { kind: "drag", target, player, originX: x, originY: y } : null,
  };
}

/**
 * Both rings, drawn from the round with the body so the body and the hands on
 * it are one drawing.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb, and each of
 * these two is a thing the other seat is waiting on.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background before it draws its
 * own colour, so it reads over whatever it is standing on — and both of these
 * stand on the body. The seat that may not press one cannot see the wash
 * inside it, so the disc came out a bite taken out of the snake, at the head
 * or at the tail, which is the one thing on this field a bite means. Theirs is
 * its rim and its wash now, over the segment, and it cuts nothing.
 *
 * **The pilot's stays up through the mouth's rest**, drawn `held` for as long
 * as the jaws are actually open (`snake-clock.ts`'s own window, so the ring and
 * the gape agree). `snakeJawsAsks` says no there and the ring is showing
 * the pull that *is* running — one that vanished on the prise would take the
 * mark off both screens on the tick it began to matter, and come back a moment
 * later as if the round had changed its mind.
 */
export function drawSnakeGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  snake: SnakeState,
  tick: number,
  time: number,
): void {
  if (!snakeAfoot(snake)) return;
  const grip = snakeGrip(cfg, snake);
  if (grip !== "crawl") {
    const at = snakeJawsCircle(l, cfg, snake, tick);
    if (at !== null) ring(ctx, at, l, 1, gape(cfg, tick, snake) > 0, time);
  }
  if (grip === "shed") {
    const at = snakeTailCircle(l, cfg, snake, tick);
    if (at !== null) ring(ctx, at, l, 2, snake.tailHeld, time);
  }
}

function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  held: boolean,
  time: number,
): void {
  const mine = l.role === "test" || (l.role === "p1") === (player === 1);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.hull : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull: held ? 1 : 0,
    time,
    theirs: !mine,
  });
}
