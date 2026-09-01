import { livingMotion, livingSilhouette, poseClock } from "@neon-spore/content";
import {
  type Creature,
  SHELL_COLS,
  type SimConfig,
  shellHasPiece,
  shellIsBare,
  type World,
  wornKind,
} from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, hazed, nearness } from "./depth.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { crackSeed, drawPlate, PLATE, PLATE_RIM } from "./shell-plate.js";

/**
 * THE SHELL's plating: the picture the sim's own bitmask (`Creature.shell`)
 * has no shape for. One plate's geometry is `shell-plate.ts`; this file finds
 * the bodies and puts it on them.
 *
 * `drawCreatures` in `creatures.ts` draws the body first and knows nothing
 * about pieces — and since `wornKind` answers `shell` with the slick or the
 * bulb inside it, what it draws is an ordinary body at its ordinary size in
 * its ordinary colour. This is the one pass on top: a hard plate over each
 * half that still carries armour, standing outside the body's own contour,
 * with the body's light coming out through the splits in it.
 *
 * The whole read is that arithmetic:
 *
 *  - **Intact** — plating on both halves, so the thing is a little bigger than
 *    the body it is, hard-edged where a body is soft, and lit only by three
 *    splits: one down the middle where the two pieces meet and one across each
 *    half. Shielded, and visibly not permanently.
 *  - **One half chipped** — that half is simply gone, so the body underneath
 *    stands bare at its true size and its true colour, right beside a half
 *    still wearing armour a size too big. The pair have to name *which*
 *    column, and the picture has already told them the answer is one of two.
 *  - **Bare** — nothing here draws at all. The body is the whole picture, and
 *    `drawCreatures` has already drawn it.
 *
 * **Nothing here is cached across a frame.** `Creature.shell` already answers
 * "which piece, right now" every tick on both devices, so recomputing costs
 * nothing and cannot go stale — unlike a remembered break time, which would
 * need clearing on every way a wave can restart (`Effects.reset`,
 * `packages/render/test/restart.test.ts`) and is exactly the class of bug
 * `world.beat`/`tick`/`nextId` resetting to 0 produces when render remembers
 * something across that reset.
 *
 * The *burst* at the break — `effects-spark.ts`'s `shellBreak` and
 * `shellBare` cases — is a separate, genuinely transient effect and stays in
 * `Effects`' own particle system, which already resets correctly.
 */
export function drawShellArmour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const beats = world.beat + beatPhase;
  for (const c of world.creatures) {
    if (c.kind !== "shell" || shellIsBare(c)) continue;
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
  // The body inside the plating, and therefore the contour the plating hugs.
  // `wornKind`, never `c.kind`: a Shell-Slick and a Shell-Bulb wear the same
  // armour over two different shapes, and a plate cut to a shape the body is
  // not would sit off it on one of the two.
  const look = wornKind(c);
  const shape = livingSilhouette(look);

  // Exactly the transform `drawLiving` (creatures.ts) applies to this same
  // creature: the depth envelope about the body's own centre, then the
  // own-motion translate/rotate/scale. Built from the same exported
  // primitives it calls, not re-derived, so the plating cannot drift from the
  // body it is supposed to sit on.
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const k = depthScale(cfg, l, row);
  const near = nearness(l, row);
  const t = contourClock(c.id, time);
  const pose = livingMotion(look).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * l.tile;
  const oy = pose.dy * l.tile;
  const r = l.tile * 0.4;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);

  // The colour coming out of the cracks is the body's own, hazed by distance
  // exactly as `drawLiving` hazes the body it belongs to — so the light in the
  // splits and the light on a bared half are the same colour at the same row,
  // which is the whole point of showing it at all. `sparkDim` is the same
  // fallback a colourless body is drawn in, and nothing in the game builds one.
  const light = hazed(
    cfg,
    c.color === null ? PALETTE.sparkDim : c.color === "red" ? PALETTE.red : PALETTE.cyan,
    near,
  );
  const ink = {
    plate: hazed(cfg, PLATE, near),
    rim: hazed(cfg, PLATE_RIM, near),
    light,
    lineWidth: Math.max(1, r * 0.09) / scale,
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  ctx.translate(x + ox, y + oy);
  ctx.rotate(pose.rot);
  ctx.scale(scale * pose.sx, scale * pose.sy);

  for (let piece = 0; piece < SHELL_COLS; piece++) {
    if (shellHasPiece(c, c.col + piece))
      drawPlate(ctx, shape, piece, crackSeed(c.id, piece), t, ink);
  }

  ctx.restore();
}
