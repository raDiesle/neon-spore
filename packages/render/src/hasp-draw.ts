import { HASP_COUNT, type HaspState, haspLoose, type World } from "@neon-spore/sim";
import { type BossHurt, drawHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { drawHaspCap, drawHaspLatch, drawHaspWheel } from "./hasp-parts.js";
import { haspClearing, haspGape, haspOpened, haspStillPhase } from "./hasp-pose.js";
import { haspCentre, haspHubRadius, haspShellPath } from "./hasp-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsHaspLatch, showsHaspWheel } from "./view-role-clocks-c.js";

/**
 * **THE HASP**: three sealed clasps down the middle of the field, each two
 * hinged half-shells pinned over a hub, and the one boss whose question is
 * whether a grip nobody can see is the one holding the door (§11.37, §20).
 *
 * Five poses, drawn off the world alone: all sealed with the wheels dark; one
 * latch glowing under a held hand; its wheel spinning free; a wheel seized
 * dark mid-turn; and the row swung open, every hub spinning down and the
 * passage behind the door lit for the first time. The morph between any two
 * is how far each clasp's halves have swung, eased over the phase's own beats
 * (`hasp-pose.ts`).
 *
 * **Its health is the row.** A hasp is sealed or it has swung, and the count
 * of shut clasps is the count left — nothing prints the number.
 *
 * **Each seat is shown its own half and never the other's**
 * (`view-role-clocks-c.ts`): the latch and its heat on the pilot's screen, the
 * wheel and whether it is free on the navigator's, the row on both. The two
 * pictures of the same clasp differ exactly where the fight does
 * (`hasp-parts.ts`).
 */
export function drawHasp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HaspState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: HaspFx,
): void {
  const cfg = world.cfg;
  const lit = smoothstep(haspStillPhase(s, cfg, beat, beatPhase));
  const clearing = haspClearing(s, cfg, beat, beatPhase);
  const wheel = showsHaspWheel(l.role);

  ctx.save();
  // The jolt of a hasp giving drops the whole row in its mounting — applied to
  // the context, so the clasps, the hubs and the latch stay one rigid door.
  ctx.globalAlpha = 0.15 + 0.85 * lit;
  ctx.translate(fx.hurt.shakeX(time, l.tile), fx.jolt * l.tile);
  if (clearing > 0) drawPassage(ctx, l, world, clearing);
  for (let i = 0; i < HASP_COUNT; i++) {
    const gape = haspGape(s, cfg, i, beat, beatPhase, wheel);
    drawClasp(ctx, l, world, s, i, gape, fx.hurt.value);
    if (wheel) drawHaspWheel(ctx, l, cfg, s, i, beat, beatPhase);
    else drawHaspCap(ctx, l, cfg, i);
  }
  if (showsHaspLatch(l.role)) drawHaspLatch(ctx, l, cfg, s, beat, beatPhase, fx.flare);
  if (haspLoose(s)) drawBolt(ctx, l, world, s, beat, beatPhase);
  ctx.restore();

  // The seize, said as the design says it: the whole field dark for a beat,
  // on the screens that are shown a wheel to seize (§20, *Presentation*).
  if (wheel && fx.dim > 0) {
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.background, 0.5 * fx.dim);
    ctx.fillRect(l.gridLeft, l.gridTop, l.gridWidth, l.hullY - l.gridTop);
    ctx.restore();
  }
}

/** What the drawer needs of the transients, taken as an interface so this page
 * does not import the class it is handed (`hasp-fx.ts`). */
interface HaspFx {
  readonly hurt: BossHurt;
  readonly jolt: number;
  readonly flare: number;
  readonly dim: number;
}

/**
 * One clasp's shell at the gape its pose gives it. A sealed clasp is drawn
 * whole and a swung one is drawn fainter, so the row reads as a count from
 * across a room: two bright shut lids and one gone slack is one hasp done.
 */
function drawClasp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HaspState,
  i: number,
  gape: number,
  hurt: number,
): void {
  const shell = haspShellPath(l, world.cfg, i, gape);
  const spent = haspOpened(s, i) && s.phase !== "clear";
  ctx.fillStyle = rgba(PALETTE.rockDark, spent ? 0.5 : 0.88);
  ctx.fill(shell);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = spent ? rgba(PALETTE.rock, 0.45) : PALETTE.rock;
  ctx.stroke(shell);
  drawHurt(ctx, shell, hurt);
}

/**
 * **The perspective change**: once the row has swung clear, the passage the
 * door was shut over, lit for the first time down the middle column from the
 * top of the field to the ship. It widens with the clearing, behind the
 * clasps, so the lids are seen swinging off something rather than into the
 * dark. The body's own violet, which nothing else on this boss wears.
 */
function drawPassage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  clearing: number,
): void {
  const x = haspCentre(l, world.cfg, 0).x;
  const half = l.tile * 1.1 * clearing;
  const band = new Path2D();
  band.rect(x - half, l.gridTop, half * 2, l.hullY - l.gridTop);
  ctx.fillStyle = rgba(PALETTE.wisp, 0.3 * clearing);
  ctx.fill(band);
  const edges = new Path2D();
  edges.moveTo(x - half, l.gridTop);
  edges.lineTo(x - half, l.hullY);
  edges.moveTo(x + half, l.gridTop);
  edges.lineTo(x + half, l.hullY);
  strokeGlow(ctx, edges, PALETTE.wispRim, STROKE.inner, 0.4 + 0.8 * clearing);
}

/**
 * The loose bolt the second hasp's spring throws, falling from that clasp's
 * hub down its column to the hull, so the hit is seen coming rather than
 * announced. Pale rather than red or cyan: either colour shoots it
 * (`sim/hasp-shot.ts`, §11.37), and a bolt wearing one would be a colour to load.
 */
function drawBolt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HaspState,
  beat: number,
  beatPhase: number,
): void {
  const cfg = world.cfg;
  const along = Math.min(
    1,
    Math.max(0, (beat - s.boltBeat + beatPhase) / Math.max(1, cfg.haspBoltBeats)),
  );
  const from = haspCentre(l, cfg, 1).y + haspHubRadius(l);
  const x = fieldX(l, s.boltCol);
  const y = from + (l.hullY - from) * smoothstep(along);
  const bolt = new Path2D();
  bolt.roundRect(x - l.tile * 0.12, y - l.tile * 0.3, l.tile * 0.24, l.tile * 0.6, l.tile * 0.1);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.55 + 0.35 * along);
  ctx.fill(bolt);
  strokeGlow(ctx, bolt, PALETTE.hullRim, STROKE.inner, 1 + along);
}
