import {
  blobPath,
  bodyPhase,
  livingMotion,
  livingSilhouette,
  poseClock,
} from "@neon-spore/content";
import {
  type Creature,
  isBossBody,
  isMeteorKind,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawDetails } from "./creature-detail.js";
import { creatureCenter } from "./creature-place.js";
import { byDepth, depthScale, drawnRow, hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawMeteor } from "./meteor.js";
import { PALETTE } from "./palette.js";
import { drawTorch } from "./torch.js";

/**
 * Creature silhouettes come from `legacy/style-guide.html` by way of
 * `content/shapes.ts`: one blob contour per kind, tuned by lobes, depth and
 * wobble. The wobble is time-based, so a creature is never quite still.
 *
 * On top of the contour sits the own-motion the raster prototype gives each
 * kind. Spec 5.8 is strict about what it may touch: **nothing**. The bulb
 * sways and pumps, the slick tilts and ripples, but neither ever leaves its
 * column, so the lane stays exactly readable while the picture stays alive.
 *
 * The pose is sampled on `beat + beatPhase`, which both devices derive from
 * the same tick counter — not on `time`, which is `performance.now()` and is
 * therefore a different number on each phone. See `content/own-motion.ts`.
 */
export function drawCreatures(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
  blocked: ReadonlyMap<number, number>,
): void {
  // The pose clock, in beats. `beatPhase` alone would restart it every beat.
  const beats = world.beat + beatPhase;
  // Farthest first: which of two overlapping bodies is in front used to be
  // decided by spawn order, which is not a fact about the picture. See
  // `byDepth` — it copies rather than sorting the simulation's own array.
  for (const c of byDepth(world.creatures, beatPhase)) {
    // A boss body is drawn by `boss-draw.ts`, because its picture depends on
    // `world.boss` and not on the creature alone — and so is the tether, which
    // is a line down a column rather than a thing standing on a tile.
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    const row = drawnRow(c, beatPhase);
    const near = nearness(l, row);
    // Perspective as one transform about the body's own centre, rather than a
    // radius threaded through three drawing files: it takes the rock and the
    // torch with it, and it scales their line weights by the same factor, so
    // the style guide's "1.2–1.8 px at 26 px object size" survives the growth.
    const k = depthScale(world.cfg, l, row);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.translate(-x, -y);
    if (c.kind === "torch") drawTorch(ctx, l, c, x, y, time);
    else if (isMeteorKind(c.kind)) drawMeteor(ctx, l, c, x, y, time);
    else drawLiving(ctx, l, c, x, y, beats, time, blocked.get(c.id) ?? 0, world.cfg, near);
    ctx.restore();
  }
}

function drawLiving(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beats: number,
  time: number,
  blocked: number,
  cfg: SimConfig,
  near: number,
): void {
  const isBulb = c.kind === "bulb";
  const shape = livingSilhouette(c.kind);
  // Runt and Throb carry no colour at all (bullet-hit.ts's own branches, not
  // a colour match) — the red/cyan ternary below would otherwise read a null
  // colour as cyan, painting a decoy in one of the two ammunition colours.
  const neutral = c.color === null;
  // Every colour goes through `hazed`: distance is spent on the palette here
  // and nowhere else, so the far rows come out dimmer, cooler and at lower
  // contrast in one operation instead of three.
  const haze = (h: string): string => hazed(cfg, h, near);
  const rim = haze(
    neutral ? PALETTE.sparkDim : c.color === "red" ? PALETTE.redRim : PALETTE.cyanRim,
  );
  const hex = haze(neutral ? PALETTE.dim : c.color === "red" ? PALETTE.red : PALETTE.cyan);
  const dark = haze(
    neutral ? PALETTE.rockDark : c.color === "red" ? PALETTE.redDark : PALETTE.cyanDark,
  );

  // Variation without randomness in the simulation: the id is deterministic on
  // both devices, so two screens shake the same creature the same way.
  const spread = bodyPhase(c.id);
  // The contour wobble is still on the wall clock, which the pose no longer
  // is: `blobPath` is sampled in seconds by every shape tool too, and its
  // excursion is a couple of percent of a radius — a fraction of a pixel of
  // disagreement, against the fifth of a lane the pose was worth.
  const t = time + spread * 5.4;
  const r = l.tile * 0.4;
  // The Throb's whole "swells and shrinks" tell: bigger while `throbOpen` is
  // true (a shot lands), smaller while it is shut (a shot does nothing) — the
  // same flag bullet-hit.ts reads, so the picture never disagrees with what a
  // shot actually does.
  const throbMul = c.kind === "throb" ? (c.throbOpen ? 1.3 : 0.7) : 1;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1) * throbMul;

  // The sway itself is data, in `content/own-motion.ts`, so the shape tools
  // can animate a creature the way the game does instead of re-typing it.
  // Offsets come back in tiles, which is the only form that survives a
  // different screen.
  const pose = livingMotion(c.kind).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * l.tile;
  const oy = pose.dy * l.tile;
  const { rot, sx, sy } = pose;

  const d = blobPath(
    0,
    0,
    shape.rx,
    shape.ry,
    shape.lobes,
    shape.depth,
    shape.wobble,
    t,
    shape.seed,
    28,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + ox, y + oy);
  ctx.rotate(rot);
  ctx.scale(scale * sx, scale * sy);

  if (blocked > 0) {
    // Wrong colour: no resonance, so the light organ stays shut. Grey outline
    // only — the shot is spent and the creature keeps coming.
    ctx.strokeStyle = haze(PALETTE.sparkDim);
    ctx.lineWidth = 2 / scale;
    ctx.stroke(path);
  } else {
    ctx.fillStyle = dark;
    ctx.fill(path);
    strokeGlow(ctx, path, hex, Math.max(1, r * 0.1) / scale, 1);
    drawDetails(ctx, isBulb, shape.rx, shape.ry, rim, hex);
  }
  ctx.restore();

  if (blocked <= 0) {
    drawMotionTrail(ctx, l, x, y, r, hex, t);
    halo(ctx, x + ox, y + oy, r * 1.9, hex, 0.16);
  }
}

/** The pod wreck's trail (`drawWreck` in pods.ts), in the creature's own
 * colour: fading halos strung out behind — up, since row only grows toward
 * the hull. */
function drawMotionTrail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  hex: string,
  t: number,
): void {
  for (let k = 1; k <= 2; k++) {
    const a = (1 - k / 5) * 0.4;
    const ty = y - k * l.tile * 0.26;
    const tx = x - Math.sin(t * 3 + k) * l.tile * 0.05 * k;
    halo(ctx, tx, ty, r * (0.85 - k * 0.12), hex, a * 0.5);
  }
}
