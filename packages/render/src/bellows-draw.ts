import { BELLOWS_SEAMS, type BellowsState, bellowsLeaking, type World } from "@neon-spore/sim";
import { drawBellowsCap, drawBellowsHandle } from "./bellows-handle.js";
import {
  bellowsApart,
  bellowsFillMilli,
  bellowsSeamGoing,
  bellowsStillPhase,
} from "./bellows-pose.js";
import { bellowsBodyPath, bellowsCentre, bellowsMouthPath, type Point } from "./bellows-shape.js";
import { bellowsSeamPath, bellowsWaistHalf, bellowsWaistPath } from "./bellows-waist.js";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsBellowsPull, showsBellowsPush } from "./view-role-clocks-b.js";

/**
 * **THE BELLOWS**: a double-chambered lung slung across the top of the field,
 * a ribbed housing to a seat and a leather waist between them, and the one
 * boss that may only ever be worked by one of the pair at a time (§11.35,
 * §19).
 *
 * Five poses, in the order the fight runs through them and drawn off the
 * world alone: shut and still; the pilot's chamber drawn open under his
 * thumb; hers pressed flat as the breath crosses; both caught halfway and
 * shuddering in a jam; both swollen full with the handles glowing; and the
 * waist letting go, the halves falling away and turning on their caps to show
 * the hollow they have been squeezing all fight. The morph between any two of
 * them is one number — how far a housing is drawn out — eased over the
 * phase's own beats and never cut (`bellows-pose.ts`).
 *
 * **Its health is the waist.** Four seams, one parting per exchange, and the
 * leather pinches thinner with every gap: a waist with one seam left is a
 * different silhouette from a waist with four, and nothing anywhere prints
 * the number (`bellows-waist.ts`).
 *
 * **Each seat is shown its own handle and not the other's**
 * (`view-role-clocks-b.ts`). Both are shown the whole lung — how far each
 * chamber is drawn out is exactly what *now* and *not yet* are said about,
 * and a seat that could not see the other's chamber could not take its turn.
 * What is kept from a seat is the *handle*: a rail nobody at that desk can
 * reach is a thing to point at instead of a thing to say.
 */
export function drawBellows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: BellowsFx,
): void {
  const cfg = world.cfg;
  const lit = smoothstep(bellowsStillPhase(s, cfg, beat, beatPhase));
  const apart = bellowsApart(s, cfg, beat, beatPhase);
  const going = bellowsSeamGoing(s, cfg, beat, beatPhase);
  const at = bellowsCentre(l, cfg);

  ctx.save();
  // What the reactions do to the whole lung, and they only ever move *it*:
  // the jolt of a seam letting go drops it in its mounting, the shudder of a
  // jam shakes the pair of chambers together, and the vent's own light washes
  // the lot. Applied to the context rather than to any path, so the housings,
  // the waist and the handles stay one rigid body — a handle that shook loose
  // of the chamber it works would be the boss lying about the one thing it
  // may not lie about (`bellows-fx.ts`).
  ctx.globalAlpha = Math.min(1, 0.15 + 0.85 * lit + 0.3 * fx.glare);
  ctx.translate(at.x, at.y + fx.jolt * l.tile);
  ctx.rotate(fx.shudder * 0.02 * Math.sin(time * 44));
  ctx.translate(-at.x, -at.y);
  drawWaist(ctx, l, world, s, apart, going);
  for (const player of [1, 2] as const) {
    drawChamber(ctx, l, world, s, player, beat, beatPhase, time, apart);
  }
  if (bellowsLeaking(s)) drawSpark(ctx, l, world, s, at, beat, beatPhase);
  ctx.restore();
}

/** What the drawer needs of the transients, taken as an interface so this page
 * does not import the class it is handed (`bellows-fx.ts`). */
interface BellowsFx {
  readonly shudder: number;
  readonly jolt: number;
  readonly glare: number;
}

/** The leather between the housings: two lips, the stitches still holding, and
 * the gaps where a seam has gone. */
function drawWaist(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  apart: number,
  going: number,
): void {
  const cfg = world.cfg;
  const lips = bellowsWaistPath(l, cfg, s, apart);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.85);
  ctx.stroke(lips);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.55);
  ctx.stroke(bellowsSeamPath(l, cfg, s, false, going));
  // A gap is lit rather than drawn dark: it is the one part of this body that
  // says how far along the fight is, and the newest is still opening. Nothing
  // is stroked while the waist is whole — an empty path would cost the glow's
  // three passes for no marks (`glow.ts`).
  if (s.seams < BELLOWS_SEAMS) {
    const gaps = bellowsSeamPath(l, cfg, s, true, going);
    strokeGlow(ctx, gaps, PALETTE.wispRim, STROKE.inner, 0.5 + 0.8 * going);
  }
}

/**
 * One seat's chamber: the concertina at the fill its own beat has left it,
 * the cap on the end, the mouth once the halves have fallen apart, and — on
 * that seat's screen alone — the rail and bar under it at the depth their
 * thumb has it.
 */
function drawChamber(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  player: 1 | 2,
  beat: number,
  beatPhase: number,
  time: number,
  apart: number,
): void {
  const cfg = world.cfg;
  const open = bellowsFillMilli(s, cfg, player, beat, beatPhase);
  const body = bellowsBodyPath(l, cfg, player, open, apart);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.85);
  ctx.fill(body);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(body);
  drawBellowsCap(ctx, l, world, s, player, open, apart);
  if (apart > 0) {
    // The hollow is the body's own violet seen from the inside, edge and all.
    // The brighter rim is spent on the waist's gaps, which are the health, so
    // the two violets on this boss never say the same thing.
    const mouth = bellowsMouthPath(l, cfg, player, open, apart);
    ctx.fillStyle = rgba(PALETTE.wisp, 0.25 + 0.5 * apart);
    ctx.fill(mouth);
    strokeGlow(ctx, mouth, PALETTE.wisp, STROKE.inner, 0.6 + 0.9 * apart);
  }
  const mine = player === 1 ? showsBellowsPull(l.role) : showsBellowsPush(l.role);
  if (mine && apart < 1) drawBellowsHandle(ctx, l, world, s, player, open, time, apart);
}

/**
 * The spark leaking out of the newest gap and running down the field toward
 * the column it will breach, so the hit is seen coming rather than announced.
 * Ember rather than red or cyan: either bolt shuts it, and a spark wearing a
 * colour would be a colour to load (`sim/bellows-shot.ts`, §11.35).
 */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const cfg = world.cfg;
  const along = Math.min(
    1,
    Math.max(0, (beat - s.sparkBeat + beatPhase) / Math.max(1, cfg.bellowsSparkBeats)),
  );
  const x = fieldX(l, s.sparkCol);
  const y = at.y + bellowsWaistHalf(l, s.seams) + (l.hullY - at.y) * smoothstep(along);
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * 0.2, l.tile * 0.28, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.ember, 0.5 + 0.4 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.emberRim, STROKE.inner, 1 + along);
}
