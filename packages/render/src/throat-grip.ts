import {
  type SimConfig,
  type ThroatState,
  throatCinchable,
  throatCinched,
  throatHauling,
  throatRingAsks,
  throatTubeAsks,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { mouthX, mouthY, rings } from "./throat-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE THROAT's two hands**, and the two circles the drawing and the hit test
 * share: the navigator's thumb on a ring already gone slack and the pilot's
 * carry on the tube itself (`sim/throat-hand.ts`, `docs/spec/bosses.md`
 * §11.19).
 *
 * Both gestures shipped in the simulation with nothing drawn to take hold of,
 * and the cue was saying `CINCH` and `HAUL` over bare tube (now `PULL` and `HOLD`)
 * (`boss-cue-read-k.ts`). The look is exempt under *a look with no shipped
 * alternative*: there was no drawing of either control to run a candidate
 * against.
 *
 * **The gullet hands out its own controls as it loses them**, which is the one
 * thing worth saying about where these two stand. There is nothing to pinch
 * until the pair has choked a ring, and nothing to haul until four are slack
 * and the mouth has stopped travelling — so a fight that is going badly grows
 * handles, and a frame of this boss with two rings on it is a frame of a boss
 * most of the way down.
 *
 * **Neither ring covers what the pair is reading.** Hers is on the lowest
 * muscle, which is always the slack one (`ringSlack` chokes from the mouth
 * upward), and a slack muscle is a limp curve rather than a number — the count
 * that matters is the four *taut* rings above it, and those are untouched.
 * His hangs a tile **below** the mouth rather than on it, because
 * `drawHandleRing` fills opaquely and the mouth is the one thing in this fight
 * both seats aim at: a ring over the lip would hide the body standing in it on
 * the beat it is about to be swallowed.
 */

/** How far below the mouth the pilot's ring hangs, in tiles — clear of the
 * lip at its widest gape (`LIP_OPEN` in `throat-mouth.ts`) and of the handle's
 * own radius. */
const BELOW_MOUTH = 0.95;

/** The navigator's circle: on the lowest ring, which is the slack one. */
export function throatRingCircle(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): Circle | null {
  const ring = rings(l, cfg, b, beat, beatPhase)[cfg.throatRings - 1];
  return ring === undefined ? null : { x: ring.x, y: ring.y, r: handleRadius(l, cfg) };
}

/** The pilot's circle: under the mouth, travelling with it. */
export function throatTubeCircle(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): Circle {
  return {
    x: mouthX(l, cfg, b, beat, beatPhase),
    y: mouthY(l, cfg) + l.tile * BELOW_MOUTH,
    r: handleRadius(l, cfg),
  };
}

interface Hand {
  target: "throatRing" | "throatTube";
  seat: 1 | 2;
  c: Circle;
}

/**
 * The rings on offer under a point, this seat's own first where they overlap.
 * Whether each is on offer is the simulation's (`sim/throat-hand.ts`
 * `throatRingAsks`, `throatTubeAsks`): a slack ring with the last cinch paid
 * for and no thumb on it yet, and the tube only in `open` with no carry still
 * to land.
 */
function handsUnder(l: Layout, x: number, y: number, field: Field, b: ThroatState): Hand[] {
  const { cfg, beat, beatPhase } = field;
  const hands: Hand[] = [];
  const ring = throatRingAsks(b) ? throatRingCircle(l, cfg, b, beat, beatPhase) : null;
  if (ring !== null) hands.push({ target: "throatRing", seat: 2, c: ring });
  if (throatTubeAsks(b)) {
    hands.push({ target: "throatTube", seat: 1, c: throatTubeCircle(l, cfg, b, beat, beatPhase) });
  }
  return hands
    .filter((h) => hitCircle(h.c, x, y))
    .sort((a, c) => Number(c.seat === field.seat) - Number(a.seat === field.seat));
}

/**
 * The press on whichever ring is on offer, from either seat. The cinch is hers
 * and the haul is his, and neither can do the other's: **a press from the other
 * seat is handed through with no hold**, so the simulation refuses it once and
 * the ring washes red (`throat-marks.ts`) — both rings are drawn on both
 * screens.
 */
export function throatGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "throat");
  if (b === null) return null;
  const hand = handsUnder(l, x, y, field, b)[0];
  if (hand === undefined) return null;
  return grab(hand.target, field.seat, hand.seat === field.seat, x, y);
}

/**
 * The seat a press on a ring on offer belongs to, so one mouse at a desk
 * takes the navigator's cinch rather than having it refused as the pilot's
 * (`desk-grab.ts` `markSeat`).
 */
export function throatGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const b = bossOf(field, "throat");
  if (b === null) return undefined;
  return handsUnder(l, x, y, field, b)[0]?.seat;
}

function grab(
  target: "throatRing" | "throatTube",
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
 * Both rings, drawn from `drawThroat` so the gullet and the hands on it are
 * one drawing — over the tube and the mouth, under the navigator's readout
 * (`throat-lock.ts`), which is words and must never be behind anything.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb, and the
 * cinch is a freeze the pilot is spending his beats inside.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background first so it reads
 * over whatever it hangs on, and these two hang on the tube and on a slack
 * ring of the gullet itself. The seat that may not press one cannot see the
 * wash inside the hole, so its copy came out a gap in the gullet — a throat
 * with a piece missing, on the boss whose whole picture is how much of it is
 * left. Theirs is its rim and its wash over the plating now.
 *
 * **Each stays up while its gesture is standing, drawn `held`.** A cinched
 * ring refuses a second thumb and a spent haul refuses a second carry, so
 * `throatRingAsks` and `throatTubeAsks` both say no there — but the
 * ring is showing the hold that *is* running, and one that vanished on the
 * press would take the freeze off both screens on the beat it began to matter.
 *
 * The halo and the verdicts are `throat-marks.ts`', drawn round these two:
 * `drawThroat` passes the verdicts in so they land over the rings.
 */
export function drawThroatGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (throatCinchable(b) || throatCinched(b)) {
    const at = throatRingCircle(l, cfg, b, beat, beatPhase);
    if (at !== null) ring(ctx, at, l, 2, throatCinched(b), time);
  }
  if (b.phase === "open") {
    ring(ctx, throatTubeCircle(l, cfg, b, beat, beatPhase), l, 1, throatHauling(b), time);
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
    hex: mine ? PALETTE.rock : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull: held ? 1 : 0,
    time,
    theirs: !mine,
  });
}
