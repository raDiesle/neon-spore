import { RATCHET_TEETH, type RatchetState, ratchetLoose, type World } from "@neon-spore/sim";
import { type BossHurt, drawHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import {
  drawRatchetCatch,
  drawRatchetLock,
  drawRatchetPawl,
  drawRatchetSpring,
} from "./ratchet-parts.js";
import {
  ratchetDrive,
  ratchetFold,
  ratchetPawlLift,
  ratchetRise,
  ratchetStillPhase,
} from "./ratchet-pose.js";
import {
  ratchetLock,
  ratchetPawlY,
  ratchetPlatePath,
  ratchetRails,
  ratchetStep,
  ratchetX,
} from "./ratchet-shape.js";
import { showsRatchetCatch, showsRatchetPawl } from "./view-role-clocks-c.js";

/**
 * **THE RATCHET**: a strut down the middle of the field, a rack of seven
 * plates climbing inside it past a pawl, and a lock at the top that five
 * clean teeth open — the one boss where a step, once taken, stays taken
 * (§11.38, §22).
 *
 * Four poses, fewer than any other boss on the page on purpose, since the
 * picture is the rack's own teeth rather than a body changing shape: still
 * and unset; the catch glowing under a held hand; a tooth climbing with a
 * click and a jolt; and the strut folding away at the top. And the fifth,
 * which the page does not draw because it is the loss: the rack driven down
 * into the hull. Every morph is eased over the phase's own beats
 * (`ratchet-pose.ts`).
 *
 * **Its health is the rack.** The plates still below the pawl are the teeth
 * left, the ones above it are spent and drawn slack, and the lock's pins count
 * the clean ones — nothing prints a number.
 *
 * **Both seats are shown the whole rack**, because this boss splits the hands
 * and not the eyes: the catch is the navigator's alone and the pawl's pad the
 * pilot's alone (`view-role-clocks-c.ts`), and neither is shown the other's.
 * A burnt tooth climbs the same rack with no glow and no shudder — §22's one
 * silence.
 */
export function drawRatchet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: RatchetState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: RatchetFx,
): void {
  const cfg = world.cfg;
  const lit = smoothstep(ratchetStillPhase(s, cfg, beat, beatPhase));
  const fold = ratchetFold(s, cfg, beat, beatPhase);
  const rise = ratchetRise(s, cfg, beat, beatPhase);
  const step = ratchetStep(l);
  const lock = ratchetLock(l, cfg);
  const rest = ratchetPawlY(l) - rise * step;
  const drop = l.hullY + 0.4 * l.tile - (rest + RATCHET_TEETH * step);
  const top = rest + drop * ratchetDrive(s, beat, beatPhase);

  ctx.save();
  // The jolt of a clean tooth drops the whole strut in its mounting, applied
  // to the context so the rack, the pawl and the lock stay one machine.
  ctx.globalAlpha = (0.15 + 0.85 * lit) * (1 - 0.55 * fold);
  ctx.translate(fx.hurt.shakeX(time, l.tile), fx.jolt * l.tile);
  // **The perspective change**: once the lock gives, the strut tips down and
  // away from the ship about the lock at its top — foreshortened toward it,
  // and a little wider as its far end comes nearer the eye.
  if (fold > 0) {
    ctx.translate(lock.x, lock.y);
    ctx.scale(1 + 0.12 * fold, 1 - 0.82 * fold);
    ctx.translate(-lock.x, -lock.y);
  }
  drawStrut(ctx, l, world);
  drawRatchetSpring(ctx, l, cfg, top);
  for (let i = 0; i < RATCHET_TEETH; i++) {
    drawPlate(ctx, l, world, i, top, i + 1 <= rise + 1e-6, fx.hurt.value);
  }
  const bears = Math.max(0, Math.min(RATCHET_TEETH - 1, Math.round(rise) - 1));
  const lift = ratchetPawlLift(s, cfg, beat, beatPhase);
  drawRatchetPawl(ctx, l, cfg, s, bears, lift, showsRatchetPawl(l.role));
  if (fx.click > 0) drawClick(ctx, l, world, fx.click);
  drawRatchetLock(ctx, l, cfg, s, fold);
  if (showsRatchetCatch(l.role)) drawRatchetCatch(ctx, l, cfg, s);
  ctx.restore();

  if (ratchetLoose(s)) drawBolt(ctx, l, world, s, beat, beatPhase);
}

/** What the drawer needs of the transients, taken as an interface so this page
 * does not import the class it is handed (`ratchet-fx.ts`). */
interface RatchetFx {
  readonly jolt: number;
  readonly click: number;
  readonly hurt: BossHurt;
}

/** The strut: two rails from the lock down past the rack's lowest reach, and the seam the pawl bears on. */
function drawStrut(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const lock = ratchetLock(l, world.cfg);
  const rails = ratchetRails(l, world.cfg);
  const strut = new Path2D();
  strut.moveTo(rails.left, lock.y);
  strut.lineTo(rails.left, rails.bottom);
  strut.moveTo(rails.right, lock.y);
  strut.lineTo(rails.right, rails.bottom);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.35);
  ctx.stroke(strut);
}

/**
 * One plate at the rack's height. A plate still below the pawl is a tooth
 * left and is drawn whole; one that has climbed past it is spent and drawn
 * slack, so the rack reads as a count from across a room.
 */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  i: number,
  top: number,
  spent: boolean,
  hurt: number,
): void {
  const plate = ratchetPlatePath(l, world.cfg, i, top);
  ctx.fillStyle = rgba(PALETTE.rockDark, spent ? 0.3 : 0.9);
  ctx.fill(plate);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = spent ? rgba(PALETTE.rock, 0.35) : PALETTE.rock;
  ctx.stroke(plate);
  drawHurt(ctx, plate, hurt);
}

/** The click: a flash along the seam where the pawl has just dropped onto a clean tooth. */
function drawClick(ctx: CanvasRenderingContext2D, l: Layout, world: World, click: number): void {
  const y = ratchetPawlY(l);
  const x = ratchetX(l, world.cfg);
  const seam = new Path2D();
  seam.moveTo(x - l.tile * 1.3, y);
  seam.lineTo(x + l.tile * 1.3, y);
  strokeGlow(ctx, seam, PALETTE.rock, STROKE.outline, 1.6 * click);
}

/**
 * The loose bolt the half-wound spring throws, falling from the lock down its
 * column to the hull, so the hit is seen coming rather than announced. Pale
 * rather than red or cyan: either colour shoots it (`sim/ratchet-shot.ts`,
 * §11.38), and a bolt wearing one would be a colour to load. Drawn outside
 * the strut's fold, since it has left the rack.
 */
function drawBolt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: RatchetState,
  beat: number,
  beatPhase: number,
): void {
  const cfg = world.cfg;
  const along = Math.min(
    1,
    Math.max(0, (beat - s.boltBeat + beatPhase) / Math.max(1, cfg.ratchetBoltBeats)),
  );
  const lock = ratchetLock(l, cfg);
  const from = lock.y + lock.half;
  const x = fieldX(l, s.boltCol);
  const y = from + (l.hullY - from) * smoothstep(along);
  const bolt = new Path2D();
  bolt.roundRect(x - l.tile * 0.12, y - l.tile * 0.3, l.tile * 0.24, l.tile * 0.6, l.tile * 0.1);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.55 + 0.35 * along);
  ctx.fill(bolt);
  strokeGlow(ctx, bolt, PALETTE.hullRim, STROKE.inner, 1 + along);
}
