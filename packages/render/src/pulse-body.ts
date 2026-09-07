import { PULSE_LANES, type PulseLane } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import { drawPulseBody, pulseLaneColor, pulseLaneOutline, pulseLaneRim } from "./pulse-shape.js";

/**
 * One arrival falling down a lane, and the two ways of drawing one that cannot
 * be read.
 *
 * **They are bodies now, and they were arrows.** The round was Dance Dance
 * Revolution unmodified and its four lanes were the arcade's four directions;
 * the owner replaced them with a slick, a bulb, a meteor and a pod, so what
 * falls here is what falls on every other wave and the pair name it with the
 * words they already have. `pulse-shape.ts` owns which body each lane is and
 * what colour it comes in — nothing here paints a contour.
 *
 * **A veiled arrival keeps the falling and loses the identity.** It cycles
 * through all four bodies on a fast clock rather than wearing a question
 * mark, because a question mark is a label and the pair's problem is not that
 * they do not know it is unknown — the ambiguity itself is what should be on
 * the screen, which is the rule the game marks a hidden body by everywhere
 * else. It is drawn as a bare silhouette while it cycles: the real bodies each
 * throw a halo in their own colour, and four colours flashing past would be
 * four answers a second rather than none.
 */

/** 0 far away, 1 on the line. */
export interface BodyLook {
  x: number;
  y: number;
  /** Half its height, in pixels. */
  r: number;
  lane: PulseLane;
  /** The note's own index, so two rocks on one screen face differently. */
  seed: number;
  /** Seconds, for the breath. Wall clock: nothing about it touches a tile. */
  time: number;
  /** 0 far away, 1 on the line — how bright and how solid it is. */
  near: number;
  /** Drawn cycling, with nothing about it to be read. */
  veiled?: boolean;
  /** This seat can read it and the other cannot: it wears the light. */
  calls?: boolean;
}

/**
 * Which of the four a veiled arrival is showing this instant.
 *
 * Six a second, which is fast enough that no single frame of it can be
 * mistaken for an answer and slow enough that a person can see it is cycling
 * through four things rather than flickering.
 */
function veilLane(time: number): PulseLane {
  return PULSE_LANES[Math.floor(time * 6) % PULSE_LANES.length] ?? "slick";
}

export function drawPulseArrival(ctx: CanvasRenderingContext2D, a: BodyLook): void {
  const lane = a.veiled === true ? veilLane(a.time) : a.lane;
  const color = pulseLaneColor(lane);

  // The light it throws, under everything, so a lane full of arrivals reads as
  // one lit channel rather than as separate stickers.
  halo(ctx, a.x, a.y, a.r * 1.9, a.veiled === true ? PALETTE.rockDark : color, 0.16 + 0.4 * a.near);

  ctx.save();
  // Far up the lane it is faint and it solidifies as it comes, which is what
  // gives the eye a distance to read off a screen with no perspective in it.
  ctx.globalAlpha = 0.35 + 0.65 * a.near;
  if (a.veiled === true) {
    // **The contour only, in the rock grey armour wears** — the game's own
    // word for *you cannot act on this yet*. Drawing the real body and then
    // greying it would leak the answer twice over: every one of the four
    // throws a halo in its own colour, and a slick's red under a grey wash is
    // still red. So a veiled arrival is a silhouette and nothing else, and the
    // silhouette is the thing that cycles.
    ctx.translate(a.x, a.y);
    ctx.scale(a.r, a.r);
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill(pulseLaneOutline(lane));
    strokeGlow(ctx, pulseLaneOutline(lane), PALETTE.rock, 2 / a.r, 1);
  } else {
    drawPulseBody(ctx, a.x, a.y, a.r, lane, a.time, a.seed);
  }
  ctx.restore();

  // The one thing that is added rather than changed: an arrival only this seat
  // can read wears a bright core, which is the game's own way of picking a
  // body out (light, never a ring).
  if (a.calls === true) halo(ctx, a.x, a.y, a.r * 0.9, PALETTE.text, 0.3 + 0.45 * a.near);
}

/**
 * A placeholder: the empty outline of a lane's body, cut into the ship.
 *
 * **It sits half inside the hull, and that is the owner's own picture** — *we
 * move the arrow placeholders so that half of it goes inside of the ship, like
 * a crater of meteor when hitting the ship.* So there is no line across them
 * any more: the four sockets in the skin *are* the line, and a body is judged
 * when it is drawn touching the ship, which is how every other collision in
 * this game resolves. The caller passes the skin's own y at this x, so a
 * socket rides the membrane's breathing the way a crater does.
 *
 * Drawn as the contour with nothing in it, so what a landing body does is
 * *fill* a shape that was already there — the one moment in the round the eye
 * has to catch, and it catches a fill far faster than it catches two shapes
 * overlapping.
 */
export function drawPulseSocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  /** The skin line at this x: the socket's waist sits on it. */
  skin: number,
  r: number,
  lane: PulseLane,
  /** 0 resting, 1 the instant a press landed in this lane. */
  lit: number,
  /** 1 while a miss in this lane is still being felt. */
  sore: number,
): void {
  const path = pulseLaneOutline(lane);
  const color = sore > 0 ? PALETTE.red : pulseLaneColor(lane);
  const grow = r * (1 + 0.16 * lit);

  // **The pit is the half below the skin and only that half.** Filling the
  // whole contour drew a dark decal lying on the hull; cutting the fill at the
  // skin line is what makes the same shape read as a hole the ship has in it —
  // above the line an open mouth with the field showing through, below it
  // depth. The outline runs all the way round, because the rim of a crater
  // does.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - grow * 1.2, skin, grow * 2.4, grow * 1.2);
  ctx.clip();
  ctx.translate(x, skin);
  ctx.scale(grow, grow);
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.72 + 0.2 * lit;
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.translate(x, skin);
  ctx.scale(grow, grow);
  if (lit > 0) {
    ctx.fillStyle = pulseLaneRim(lane);
    ctx.globalAlpha = 0.5 * lit;
    ctx.fill(path);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 0.45 + 0.5 * Math.max(lit, sore);
  strokeGlow(ctx, path, color, 2 / grow, 1);
  ctx.globalAlpha = 1;
  ctx.restore();

  if (lit > 0) halo(ctx, x, skin, r * 2.2, pulseLaneColor(lane), 0.5 * lit);
  if (sore > 0) halo(ctx, x, skin, r * 1.6, PALETTE.red, 0.45 * sore);
}
