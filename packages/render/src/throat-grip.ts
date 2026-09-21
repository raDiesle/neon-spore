import {
  type SimConfig,
  type ThroatState,
  throatCinchable,
  throatCinched,
  throatHauling,
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
 * and the cue has been saying `CINCH` and `HAUL` over bare tube ever since
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

/**
 * Whether the gullet is offering the navigator a ring: `ringHeard`'s own gate
 * read back rather than restated. A slack ring, a tube that is not everting,
 * the last cinch paid for — and no thumb on it already, because there is one
 * cinch however many rings are slack.
 */
export function throatRingGrippable(b: ThroatState): boolean {
  return throatCinchable(b) && !throatCinched(b);
}

/**
 * Whether it is offering the pilot the tube, which is the whole of
 * `tubeHeard`: only `open`, where the mouth has stopped travelling and inhales
 * every beat, and not while a carry it has already been given is still to
 * land.
 */
export function throatTubeGrippable(b: ThroatState): boolean {
  return b.phase === "open" && !throatHauling(b);
}

/**
 * The press, answered for whichever of the two this seat owns. A press from
 * the wrong seat falls through to whatever is behind it, exactly as if no ring
 * were there — the cinch is hers and the haul is his, and neither can do the
 * other's.
 */
export function throatGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "throat");
  if (b === null) return null;
  const { cfg, seat, beat, beatPhase } = field;
  if (seat === 2 && throatRingGrippable(b)) {
    const ring = throatRingCircle(l, cfg, b, beat, beatPhase);
    if (ring !== null && hitCircle(ring, x, y)) return grab("throatRing", 2, x, y);
  }
  if (seat === 1 && throatTubeGrippable(b)) {
    if (hitCircle(throatTubeCircle(l, cfg, b, beat, beatPhase), x, y)) {
      return grab("throatTube", 1, x, y);
    }
  }
  return null;
}

function grab(target: "throatRing" | "throatTube", player: 1 | 2, x: number, y: number): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
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
 * **Each stays up while its gesture is standing, drawn `held`.** A cinched
 * ring refuses a second thumb and a spent haul refuses a second carry, so
 * `throatRingGrippable` and `throatTubeGrippable` both say no there — but the
 * ring is showing the hold that *is* running, and one that vanished on the
 * press would take the freeze off both screens on the beat it began to matter.
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
  });
}
