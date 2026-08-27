import {
  blobPath,
  bodyPhase,
  crystalPath,
  livingMotion,
  livingSilhouette,
  METEOR,
  poseClock,
} from "@neon-spore/content";
import { type Creature, isBossBody, isMeteorKind, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawTorch, rockRadius } from "./torch.js";

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
  for (const c of world.creatures) {
    // A boss body is drawn by `boss-draw.ts`, because its picture depends on
    // `world.boss` and not on the creature alone — and so is the tether, which
    // is a line down a column rather than a thing standing on a tile.
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    if (c.kind === "torch") drawTorch(ctx, l, c, x, y, time);
    else if (isMeteorKind(c.kind)) drawMeteor(ctx, l, c, x, y, time);
    else drawLiving(ctx, l, c, x, y, beats, time, blocked.get(c.id) ?? 0);
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
): void {
  const isBulb = c.kind === "bulb";
  const shape = livingSilhouette(c.kind);
  // Runt and Throb carry no colour at all (bullet-hit.ts's own branches, not
  // a colour match) — the red/cyan ternary below would otherwise read a null
  // colour as cyan, painting a decoy in one of the two ammunition colours.
  const neutral = c.color === null;
  const rim = neutral ? PALETTE.sparkDim : c.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const hex = neutral ? PALETTE.dim : c.color === "red" ? PALETTE.red : PALETTE.cyan;
  const dark = neutral ? PALETTE.rockDark : c.color === "red" ? PALETTE.redDark : PALETTE.cyanDark;

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
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + ox, y + oy);
  ctx.rotate(rot);
  ctx.scale(scale * sx, scale * sy);

  if (blocked > 0) {
    // Wrong colour: no resonance, so the light organ stays shut. Grey outline
    // only — the shot is spent and the creature keeps coming.
    ctx.strokeStyle = PALETTE.sparkDim;
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
  for (let k = 1; k <= 4; k++) {
    const a = (1 - k / 5) * 0.4;
    const ty = y - k * l.tile * 0.3;
    const tx = x - Math.sin(t * 3 + k) * l.tile * 0.05 * k;
    halo(ctx, tx, ty, r * (0.85 - k * 0.12), hex, a * 0.5);
  }
}

/** Core and trailing filaments. Inner drawing is thinner than the outline
 * (docs/spec/graphics.md). */
function drawDetails(
  ctx: CanvasRenderingContext2D,
  isBulb: boolean,
  rx: number,
  ry: number,
  rim: string,
  hex: string,
): void {
  ctx.fillStyle = rim;
  if (isBulb) {
    ctx.beginPath();
    ctx.arc(0, ry * 0.3, ry * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex;
    ctx.lineWidth = Math.max(0.6, ry * 0.035);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(-rx * 0.39, -ry * 0.68, -rx * 0.22, -ry * 0.9);
    ctx.moveTo(rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(rx * 0.39, -ry * 0.68, rx * 0.22, -ry * 0.9);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.beginPath();
  ctx.arc(-rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md). Craters from
 * shots are placed from the creature id, so both screens agree without the
 * simulation having to store an angle per hole.
 */
function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, c.kind);
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(spin + time * 0.12);

  const rg = ctx.createLinearGradient(-r, -r, r, r);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);

  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    ctx.fillStyle = "#17181D";
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(199,203,214,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x + wobble, y, r * 1.6, PALETTE.rock, 0.1);
}
