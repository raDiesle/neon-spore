import {
  type Creature,
  SHELL_COLS,
  type SimConfig,
  shellHasPiece,
  shellIsBare,
  type World,
} from "@neon-spore/sim";
import { hazed } from "./depth.js";
import type { Layout } from "./layout.js";
import { applyLivingFrame, livingFrame } from "./living-frame.js";
import { PALETTE } from "./palette.js";
import { crackSeed, drawBareRim, drawPlate, PLATE, PLATE_RIM } from "./shell-plate.js";

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
 *  - **One half chipped** — the plate is gone, so the body underneath stands
 *    bare at its true size and its true colour, right beside a half still
 *    wearing armour a size too big — but the bared half keeps the plate's grey
 *    rim along its own outline, so the thing still reads as one armoured body
 *    with one side opened. The pair have to name *which* column, and the
 *    picture has already told them the answer is one of two.
 *  - **Bare** — nothing here draws at all: the last plate takes the grey rim
 *    with it. The body is the whole picture, and `drawCreatures` has already
 *    drawn it.
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
  // not would sit off it on one of the two. The placement is `living-frame.ts`
  // — the one copy of what `drawLiving` does to this same creature on this
  // same frame, shared with THE STRAND's plating so neither can drift off the
  // body it is supposed to sit on.
  const f = livingFrame(l, c, beatPhase, time);
  const { shape, near, r, scale, t } = f;

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
  applyLivingFrame(ctx, l, cfg, c, f, beats, beatPhase);

  for (let piece = 0; piece < SHELL_COLS; piece++) {
    // A piece that is gone is not nothing: while any plate is still on, the
    // bared half keeps the plate's own grey edge along the body's contour, so
    // the two halves read as one armoured thing with one side opened rather
    // than as a body with a plate stuck to it. The pass never reaches here on
    // a bare body, which is what makes the rim leave with the last plate.
    if (shellHasPiece(c, c.col + piece))
      drawPlate(ctx, shape, piece, crackSeed(c.id, piece), t, ink);
    else drawBareRim(ctx, shape, piece, t, ink);
  }

  ctx.restore();
}
