import { blobPath, livingMotion, livingSilhouette, poseClock } from "@neon-spore/content";
import {
  type Creature,
  isBossBody,
  isMeteorKind,
  type SimConfig,
  veilArmourPhase,
  type World,
  wornKind,
} from "@neon-spore/sim";
import { claspResonance, drawClaspShield } from "./clasp.js";
import { drawDetails, drawMotionTrail } from "./creature-detail.js";
import { contourClock, creatureCenter } from "./creature-place.js";
import { dartFlip, dartLean, drawDartJet } from "./dart.js";
import { byDepth, depthScale, drawnRow, hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawMeteor } from "./meteor.js";
import { PALETTE } from "./palette.js";
import { drawTorch } from "./torch.js";
import { drawVeilCloud, showsVeilCore } from "./veil.js";

/**
 * The Throb's "swells and shrinks" tell, at rest (`shut`) and mid-pulse
 * (`open`) — see the draw site below. `tools/shape-sheet` reads this to show
 * the same two sizes rather than a hand-typed `[0.7, 1.3]` that could drift
 * from what the game actually draws.
 */
export const THROB_SWELL = { open: 1.3, shut: 0.7 } as const;

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
  claspImage: CanvasImageSource | null = null,
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
    // Under the body it is pushing, so the contour sits on its own exhaust
    // rather than inside it. Inside the perspective transform with everything
    // else, so a jet at the bottom of the field grows the way its body does.
    if (c.kind === "dart") drawDartJet(ctx, l, c, x, y, beatPhase);
    if (c.kind === "torch") drawTorch(ctx, l, c, x, y, time);
    else if (isMeteorKind(c.kind)) drawMeteor(ctx, l, c, x, y, time);
    // A veil is drawn as the body inside the cloud — `wornKind` again — but on
    // player 2's screen it is drawn as *nothing*, and the cloud alone stands
    // there. Not an opaque cloud over a hidden body: a halo, a motion trail
    // and a glow pass all reach outside the contour they belong to, so the
    // colour would show as a rim of light around a shape player 2 must not be
    // able to name. `showsVeilCore` is the one gate (`veil.ts`).
    else if (c.kind !== "veil" || showsVeilCore(l))
      drawLiving(ctx, l, c, x, y, beats, beatPhase, time, blocked.get(c.id) ?? 0, world.cfg, near);
    // The weather over that body, on both screens and identical on both — the
    // clasp's arrangement below, one creature earlier in the pass.
    if (c.kind === "veil") {
      const seen = showsVeilCore(l);
      const open = veilArmourPhase(world, c);
      drawVeilCloud(ctx, l, world.cfg, c, x, y, time, beats, near, open, seen);
    }
    // The clasp's shield goes on *after* the body, because it is a membrane
    // around one and not a substitute for one — `wornKind` has already drawn
    // the slick or the bulb inside, in its own colour, which is what player 2
    // has to be able to read through it (`clasp.ts`).
    if (c.kind === "clasp") {
      drawClaspShield(
        ctx,
        l,
        world.cfg,
        x,
        y,
        time,
        near,
        claspResonance(world.shieldCol, c.col),
        claspImage,
      );
    }
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
  beatPhase: number,
  time: number,
  blocked: number,
  cfg: SimConfig,
  near: number,
): void {
  // **Not `c.kind`.** A lure is drawn as the body it wears — the contour, the
  // own-motion, the interior, the size, all of it — and this is the line that
  // makes that true. Every appearance below reads `look`; `c.kind` decides
  // nothing about how this body draws, on either device, right up to the beat
  // it goes. See `wornKind` in sim/creature-rules.ts, and purity.test.ts's own
  // row on it: one site left asking `c.kind` and player 1 has a tell.
  const look = wornKind(c);
  const isBulb = look === "bulb";
  const shape = livingSilhouette(look);
  // The Throb carries no colour at all (bullet-hit.ts's own branch, not a
  // colour match) — the red/cyan ternary below would otherwise read a null
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

  // The contour wobble is still on the wall clock, which the pose no longer
  // is: `blobPath` is sampled in seconds by every shape tool too, and its
  // excursion is a couple of percent of a radius — a fraction of a pixel of
  // disagreement, against the fifth of a lane the pose was worth. Variation
  // without randomness in the simulation lives inside `contourClock`: the id
  // is deterministic on both devices, so two screens shake the same creature
  // the same way.
  const t = contourClock(c.id, time);
  const r = l.tile * 0.4;
  // The Throb's whole "swells and shrinks" tell: bigger while `throbOpen` is
  // true (a shot lands), smaller while it is shut (a shot does nothing) — the
  // same flag bullet-hit.ts reads, so the picture never disagrees with what a
  // shot actually does.
  const throbMul = look === "throb" ? (c.throbOpen ? THROB_SWELL.open : THROB_SWELL.shut) : 1;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1) * throbMul;

  // The sway itself is data, in `content/own-motion.ts`, so the shape tools
  // can animate a creature the way the game does instead of re-typing it.
  // Offsets come back in tiles, which is the only form that survives a
  // different screen.
  const pose = livingMotion(look).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * l.tile;
  const oy = pose.dy * l.tile;
  const { sx, sy } = pose;
  // The dart's lean, on top of its own-motion rather than inside it: POISE is
  // a pure function of the beat like every other motion and cannot know which
  // way this body is pointing, and the direction is the whole creature. Zero
  // for everything else, so nothing but a dart is turned by a line of this.
  const rot = pose.rot + (look === "dart" ? dartLean(c, beatPhase) : 0);
  // And which way round it is drawn. 1 for every other body — a contour with
  // no point on it does not care — and the whole of how a dart's nose leads in
  // both directions (`dartFlip`).
  const flip = look === "dart" ? dartFlip(c) : 1;

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
  ctx.scale(scale * sx * flip, scale * sy);

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
