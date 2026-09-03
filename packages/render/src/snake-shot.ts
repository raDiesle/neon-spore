import type { SnakeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { type Point, ribbonSides, traceRibbon } from "./snake-skin.js";
import { acidEtch, wet } from "./snake-venom.js";

/**
 * The spit: the one thing in this round both screens see the same way.
 *
 * Its own file because it is the only *event* the picture has — everything
 * next door is a thing standing on a tile, and this is a thing that happened
 * on a beat and is on its way out. It keeps no state to say so: the world
 * carries the beat the shot left on and where it stopped, so the fade is one
 * number against another and a restart cannot leave a beam hanging.
 *
 * **It is fluid acid**, which is what the owner asked for in those words, and
 * that is a picture with three requirements a straight line does not have.
 *
 * 1. **It has a mass, and the mass is at the front.** A thrown liquid is a
 *    bolus with a tail behind it, not a beam of even width: the contour is a
 *    ribbon that is fat at the leading end and draws down to a point at the
 *    snout, filled with a gradient that is palest where the mass is.
 * 2. **It flies.** The simulation is hit-scan and the picture is not obliged
 *    to be: the mass runs out from the snout over the first third of the fade
 *    and the tail follows it, so what the eye sees is something thrown rather
 *    than something switched on. It is fast enough that the enemy is already
 *    gone before it lands, which is the truth about the rule.
 * 3. **It is wet.** A specular runs down one side of the stream and sits on
 *    every bead, on the side the arena's own light comes from
 *    (`snake-skin.ts`). Without it, green fluid and green light are the same
 *    picture.
 *
 * Where it lands is `snake-venom.ts` — the pool that eats the tile, which is
 * the half of this that is about a surface rather than about a flight.
 */

/** Samples along the stream. Enough for a smooth edge at tile size. */
const STEPS = 9;
/** How far in front of its tile's centre the head's jaws are, in tiles. */
const SNOUT = 0.4;
/** The share of the fade the mass spends in the air. */
const FLIGHT = 0.34;

/**
 * The spit, for the beat after it was taken.
 *
 * Drawn on **both** screens, and it is the one thing in this round they see
 * the same way. Player 2 cannot see what was hit and has to be told; what they
 * can see is that the trigger was pulled, which is how they know the sentence
 * they just said was heard.
 */
export function drawSnakeShot(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  fade: number,
  slide = 0,
): void {
  const head = snake.body[0];
  if (!head || snake.shotCol < 0) return;
  // The snout: the head's tile, plus how far through its step it is, plus the
  // reach of the jaws in front of that. The far end is where the simulation
  // stopped the shot and cannot move; the near end is the head as it is
  // actually being drawn, because the head goes on travelling while this
  // fades and a stream anchored to the tile ran backwards through the face.
  const out = arena.tile * (slide + SNOUT);
  const from: Point = {
    x: arenaX(arena, head.col) + arena.tile / 2 + snake.dirCol * out,
    y: arenaY(arena, head.row) + arena.tile / 2 + snake.dirRow * out,
  };
  const to: Point = {
    x: arenaX(arena, snake.shotCol) + arena.tile / 2,
    y: arenaY(arena, snake.shotRow) + arena.tile / 2,
  };
  if (Math.hypot(to.x - from.x, to.y - from.y) < 1) return;

  const flown = Math.max(0, Math.min(1, (1 - fade) / FLIGHT));
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, fade));
  if (flown < 1) stream(ctx, arena, from, to, flown);
  else beads(ctx, arena, from, to, fade);
  acidEtch(ctx, arena, to, snake.shotHit, (1 - fade - FLIGHT) / (1 - FLIGHT));
  ctx.restore();
}

/**
 * The stream in flight: a ribbon from the leading mass back to the snout.
 *
 * The joints run *forwards* — index 0 is the mass and the last one is the
 * snout — because `traceRibbon` closes to a point at the far end of its list,
 * and the end that has to come to a point is the one still hanging off the
 * mouth.
 */
function stream(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  from: Point,
  to: Point,
  flown: number,
): void {
  const tipX = from.x + (to.x - from.x) * flown;
  const tipY = from.y + (to.y - from.y) * flown;
  const nx = tipX - from.x;
  const ny = tipY - from.y;
  const len = Math.hypot(nx, ny) || 1;
  // Across the flight, for the wobble that keeps the edges from being ruled.
  const ax = -ny / len;
  const ay = nx / len;

  const joints: Point[] = [];
  for (let i = 0; i < STEPS; i++) {
    const u = i / (STEPS - 1);
    // A liquid does not travel down a straight tube. The wobble is a fixed
    // function of where along the stream a point is, so two devices draw the
    // same one — this package has no rng and wants none.
    const wob = Math.sin(u * 6.1 + 1.3) * arena.tile * 0.04 * u;
    joints.push({ x: tipX - nx * u + ax * wob, y: tipY - ny * u + ay * wob });
  }
  // Fat at the mass and drawn down to nothing at the snout, with the swell
  // just behind the leading edge, where a thrown drop carries its weight.
  const half = (i: number): number => {
    const u = i / (STEPS - 1);
    return arena.tile * 0.2 * (1 - u) ** 0.6 * (1 + 0.4 * Math.sin(u * Math.PI * 1.6));
  };
  const sides = ribbonSides(joints, half);

  traceRibbon(ctx, joints, sides);
  const g = ctx.createLinearGradient(from.x, from.y, tipX, tipY);
  g.addColorStop(0, PALETTE.venomDeep);
  g.addColorStop(0.55, PALETTE.venom);
  g.addColorStop(1, PALETTE.venomRim);
  ctx.fillStyle = g;
  ctx.globalAlpha *= 0.92;
  ctx.fill();
  ctx.globalAlpha /= 0.92;

  // The leading drop, round and a shade paler than the tail behind it: the eye
  // reads the front of a thrown liquid as a bead.
  const r = arena.tile * 0.2;
  ctx.fillStyle = PALETTE.venom;
  ctx.beginPath();
  ctx.arc(tipX, tipY, r, 0, Math.PI * 2);
  ctx.fill();
  wet(ctx, tipX, tipY, r);

  // One specular down the lit side of the stream, and it stops short of the
  // snout: a highlight that ran the whole length would be a second outline.
  ctx.strokeStyle = PALETTE.venomRim;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha *= 0.6;
  ctx.beginPath();
  for (const [i, p] of sides.left.slice(0, STEPS - 3).entries()) {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.globalAlpha /= 0.6;
}

/** Where the beads hang once the mass has landed, and how big each one is. */
const BEADS = [0.26, 0.48, 0.68, 0.85];
const BEAD_SIZE = [1, 0.78, 0.6, 0.44];

/**
 * What is left in the air once the mass has landed: a few drops strung back
 * along the path, thinning and drifting off it. A stream that vanished the
 * instant it arrived would read as a beam being switched off.
 */
function beads(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  from: Point,
  to: Point,
  fade: number,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ax = -dy / len;
  const ay = dx / len;
  for (const [i, u] of BEADS.entries()) {
    const drift = arena.tile * 0.12 * (1 - fade) * (i % 2 === 0 ? 1 : -1);
    const x = from.x + dx * u + ax * drift;
    const y = from.y + dy * u + ay * drift;
    const r = arena.tile * 0.11 * (BEAD_SIZE[i] ?? 0.5) * (0.55 + 0.6 * fade);
    const dim = 0.4 + 0.6 * fade;
    ctx.globalAlpha *= dim;
    ctx.fillStyle = PALETTE.venom;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    wet(ctx, x, y, r);
    ctx.globalAlpha /= dim;
  }
}
