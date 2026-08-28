import {
  blobRadiusMul,
  bodyPhase,
  catmullRomToBezierPath,
  livingMotion,
  openSmoothPath,
  type Point,
  poseClock,
  SHELL,
} from "@neon-spore/content";
import {
  type Creature,
  SHELL_COLS,
  SHELL_INTACT,
  type SimConfig,
  shellHasPiece,
  shellIsBare,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * A piece off THE SHELL: the raw edge the sim's own bitmask (`Creature.shell`)
 * has no picture for. `drawCreatures` in `creatures.ts` still draws the whole
 * two-column body the same way it always has — a full blob, in the neutral
 * grey a colourless kind gets — and knows nothing about pieces. This file adds
 * one more pass over the *missing* piece, on top of that: a bite taken out of
 * the silhouette exactly where a column lost its armour, so the interruption
 * reads before either player is told which column it was.
 *
 * **Nothing here is cached across a frame.** `Creature.shell` already answers
 * "which piece, right now" every tick, on both devices, so recomputing the
 * bite from scratch each frame costs nothing and cannot go stale — unlike a
 * remembered break time, which would need clearing on every way a wave can
 * restart (`Effects.reset`, `packages/render/test/restart.test.ts`) and is
 * exactly the class of bug `world.beat`/`tick`/`nextId` resetting to 0
 * produces when render remembers something across that reset. The raw edge
 * itself is therefore always exactly as current as the body it belongs to,
 * and never needs a clear.
 *
 * The *burst* at the break — `effects-spark.ts`'s `shellBreak` and
 * `shellBare` cases — is a separate, genuinely transient effect and stays
 * where every other burst already lives, in `Effects`' own particle system,
 * which already resets correctly. This file only draws the thing that
 * outlives the burst: the wound.
 */

/** Local units match `SHELL`'s own `rx`/`ry` — the same silhouette
 * `livingSilhouette("shell")` hands `drawLiving`, so the bite's outer edge
 * traces exactly where the base body's own contour already is. */
const EXPOSED = "#171019";
/** The raw edge's hairline — the same "still hot" cue `craters.ts` draws
 * along a rock's own mouth. Not time-limited, on purpose: a crater's hairline
 * never fades either, and a piece that came off is material that stays raw,
 * not a flash that passes. */
const RAW_EDGE_A = "rgba(255,122,47,0)";
const RAW_EDGE_B = "rgba(255,122,47,0.55)";

/** Points sampled along the missing piece's own half of the contour. Coarse
 * on purpose — the body draws at a couple of dozen pixels on a phone, and a
 * jagged edge reads from far fewer points than a smooth one needs. */
const ARC_POINTS = 14;

/**
 * The angular span (`cos(a)`'s sign) each piece owns — a vertical line
 * through the body's own centre, which is where the two columns actually
 * divide it (`shell.ts`: "every column of the body has exactly one piece in
 * front of it"). Exact for `SHELL_COLS === 2` only; a third piece would need
 * an x-based split rather than an angle-based one, and nothing here claims to
 * generalise past two columns.
 */
function pieceAngleSpan(piece: number): { from: number; to: number } {
  return piece === 0
    ? { from: Math.PI / 2, to: (Math.PI * 3) / 2 }
    : { from: -Math.PI / 2, to: Math.PI / 2 };
}

/**
 * How far inward the torn edge pulls, as a fraction of the intact radius at
 * that angle. A function of the angle and a per-piece seed only — no `t`, no
 * wall clock — so the notch's own jaggedness never reshuffles frame to frame.
 * Only the whole body's sway carries it, which is the thing the brief asks
 * for by name: "the interruption keeps its shape as the body sways."
 */
function tornMul(a: number, seed: number): number {
  const jag = 0.22 * Math.sin(a * 6 + seed * 3.1) + 0.13 * Math.sin(a * 11 - seed * 1.7 + 1.3);
  return Math.max(0.08, 0.3 + jag);
}

/** The bite: the band between the body's own live contour (`outer`, sampled
 * with the exact same `blobRadiusMul` call `blobPath` makes) and a jagged
 * contour pulled inward from it (`inner`). Filling it covers exactly the
 * piece that came off, seamlessly, because `outer` is not an approximation of
 * the base body's edge — it is the same arithmetic that drew it. */
function drawBite(ctx: CanvasRenderingContext2D, piece: number, seedBase: number, t: number): void {
  const { from, to } = pieceAngleSpan(piece);
  const seed = seedBase + piece * 3;
  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let i = 0; i <= ARC_POINTS; i++) {
    const a = from + ((to - from) * i) / ARC_POINTS;
    const m = blobRadiusMul(a, SHELL.lobes, SHELL.depth, SHELL.wobble, t, SHELL.seed);
    outer.push({ x: Math.cos(a) * SHELL.rx * m, y: Math.sin(a) * SHELL.ry * m });
    const im = m * tornMul(a, seed);
    inner.push({ x: Math.cos(a) * SHELL.rx * im, y: Math.sin(a) * SHELL.ry * im });
  }

  const loop = [...outer, ...[...inner].reverse()];
  ctx.fillStyle = EXPOSED;
  ctx.fill(new Path2D(catmullRomToBezierPath(loop)));

  const p0 = inner[0]!;
  const p1 = inner[inner.length - 1]!;
  const rim = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  rim.addColorStop(0, RAW_EDGE_A);
  rim.addColorStop(0.5, RAW_EDGE_B);
  rim.addColorStop(1, RAW_EDGE_A);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.4;
  ctx.stroke(new Path2D(openSmoothPath(inner)));
}

/**
 * The whole pass, over every shelled body that has lost a piece but is not
 * yet bare. Called from `drawBodies` right after `drawCreatures` — see
 * `frame-passes.ts` — so the bite paints on top of the same frame's ordinary
 * body, at the position, scale and sway that body was already drawn at.
 *
 * Skipped for a fully-intact shell (nothing missing to bite) and for a bare
 * one (`shellIsBare`): the last piece coming off replaces the whole picture
 * with the exposed core's own colour — `drawLiving` already does that once
 * `Creature.color` stops being `null` — and two bites meeting in the middle
 * would draw a doubled wound for an event that is not "two pieces gone", it
 * is "the body underneath, entire".
 */
export function drawShellDamage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const beats = world.beat + beatPhase;
  for (const c of world.creatures) {
    if (c.kind !== "shell" || c.shell === SHELL_INTACT || shellIsBare(c)) continue;
    drawOne(ctx, l, world.cfg, c, beats, time, beatPhase);
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  beats: number,
  time: number,
  beatPhase: number,
): void {
  // Exactly the transform `drawLiving` (creatures.ts) applies to this same
  // creature: the depth envelope about the body's own centre, then the
  // own-motion translate/rotate/scale. Built from the same exported
  // primitives it calls, not re-derived, so the bite cannot drift from the
  // body it is supposed to sit on.
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const k = depthScale(cfg, l, row);
  const spread = bodyPhase(c.id);
  const t = time + spread * 5.4;
  const pose = livingMotion(c.kind).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * l.tile;
  const oy = pose.dy * l.tile;
  const r = l.tile * 0.4;
  const scale = r / Math.max(SHELL.rx, SHELL.ry);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  ctx.translate(x + ox, y + oy);
  ctx.rotate(pose.rot);
  ctx.scale(scale * pose.sx, scale * pose.sy);

  for (let piece = 0; piece < SHELL_COLS; piece++) {
    if (!shellHasPiece(c, c.col + piece)) drawBite(ctx, piece, c.id * 7, t);
  }

  ctx.restore();
}
