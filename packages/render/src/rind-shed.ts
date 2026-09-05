import { livingPath, livingSilhouette } from "@neon-spore/content";
import { type Color, type SimEvent, type World, wornKind } from "@neon-spore/sim";
import {
  contourClock,
  creatureCenter,
  creatureRadius,
  livingBodyMul,
  rindPrevBodyMul,
} from "./creature-place.js";
import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A layer coming off THE RIND — the owner's picture of it: it should look like
 * it is shrinking, hit with a shrink cannon, with a glow explosion around it and
 * the full skin thrown away from the body into the space. A look asked for by
 * name: the first of `CLAUDE.md`'s three exemptions.
 *
 * The shed was a step and nothing else before this: one size on one frame, a
 * smaller one on the next, ten particles over it. That step is still exactly
 * what happens — `livingBodyMul` is untouched, and so is the argument for it
 * (`creature-place.ts`: a size that eases is a body breathing, a size that
 * jumps is an event). What was missing is the *sentence* around the jump, and
 * it has two halves.
 *
 * **The crush.** The silhouette it was wearing, collapsing onto the body it
 * now is. This is the shrinking, and it is a ghost rather than an ease on the
 * creature for a reason the grip cares about: a rind is grippable and
 * `creatureRadius` is what a thumb is hit-tested against, so a body eased
 * between two sizes is a body drawn at one size and grabbed at another for the
 * length of the ease. The body steps; the outline it left behind moves.
 *
 * **The husk.** The same contour, left where it was and thrown outward — the
 * skin, off the body, into the space around it — thinning and going out as it
 * goes, in a bloom of the body's own colour. It comes apart into plates on the
 * way, so it reads as material rather than as a shockwave.
 *
 * Both start on the same frame from the same outline and go opposite ways: the
 * split is the whole picture.
 *
 * Pure render, and keyed by the body rather than by a tile: the rind is
 * **still falling** when the layer comes off, so this is redrawn around
 * wherever it is this frame — `ClaspBreakFx`'s rule, arrived at the same way,
 * and the reason `rindShed` carries an `id`.
 */

/** Long enough to be a picture, over well inside the beat it happened on — a
 * beat is 0.625 s at 96 bpm, and the next *again* has to land in a clear field. */
const LIFE = 0.42;
/** The share of the life the old silhouette takes to fall onto the new one.
 * Short: this is a cannon hit, not a body settling. */
const CRUSH = 0.3;
/**
 * How far past the size it came off at the husk travels, in that size. Under
 * half, and the bound is the field rather than taste: a rind arrives wearing
 * three whole bodies, so its skin is already the widest thing out there, and
 * one that doubled would cover the columns either side. `rind.ts` says the size
 * is a picture of what is left and never a claim on the field — a husk three
 * lanes wide would argue with the number player 1 just said.
 */
const REACH = 0.45;
/** Plates the skin comes apart into on the way out. Enough to read as a
 * surface breaking up, few enough that each one is still a piece. */
const PLATES = 9;
interface Shed {
  /** The body it came off. One size smaller than it was, and still falling. */
  id: number;
  age: number;
  hex: string;
  rim: string;
  /**
   * The contour wobble, frozen at the instant it came off: the body goes on
   * breathing and the husk does not, because it is attached to nothing now —
   * and it starts as exactly the outline the body had, which is what makes the
   * split read as one skin tearing off rather than as two shapes.
   */
  wobble: number;
}

export class RindShedFx {
  private live: Shed[] = [];

  ingest(events: readonly SimEvent[], time: number): void {
    for (const e of events) {
      if (e.type !== "rindShed") continue;
      this.live.push({
        id: e.id,
        age: 0,
        hex: hexFor(e.color),
        rim: rimFor(e.color),
        wobble: contourClock(e.id, time),
      });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      // The last layer was taken and the body under it killed inside the same
      // half-second. There is nothing left to be a skin *of*, and a husk
      // hanging in the column would say the body is still coming.
      if (!c) continue;
      const { x, y } = creatureCenter(l, c, beatPhase);
      // Both radii off the one rule: the husk is exactly the footprint the body
      // had a moment ago, the crush lands exactly on the one it has.
      const rNow = creatureRadius(l, c, beatPhase, world.cfg);
      const rWas = (rNow * rindPrevBodyMul(c)) / livingBodyMul(c);
      const shape = livingSilhouette(wornKind(c));
      const unit = Math.max(shape.rx, shape.ry) / (shape.sizeMul ?? 1);
      const path = new Path2D(livingPath(shape, fx.wobble, 28));
      const t = fx.age / LIFE;
      drawCrush(ctx, { x, y, path, unit, hex: fx.rim, t }, rWas, rNow);
      drawHusk(ctx, { x, y, path, unit, hex: fx.hex, t }, rWas);
    }
  }
}

function hexFor(color: Color): string {
  return color === "red" ? PALETTE.red : PALETTE.cyan;
}

function rimFor(color: Color): string {
  return color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
}

interface Ring {
  x: number;
  y: number;
  path: Path2D;
  /** What one unit of radius is worth in contour space — `living-draw.ts`'s
   * `scale`, factored out so a radius is all a draw below has to think about. */
  unit: number;
  hex: string;
  /** 0..1 across the whole shed. */
  t: number;
}

/**
 * The shrinking. The outline of the size it was, falling onto the size it is
 * and fading out as it arrives, so it merges into the body rather than stopping
 * on top of it. `smoothstep` and not a linear fall: a crush that arrives at
 * full speed reads as a cut, and the flat end is what makes the body look like
 * it settled at the smaller size rather than having always been that size.
 */
function drawCrush(ctx: CanvasRenderingContext2D, ring: Ring, from: number, to: number): void {
  const k = smoothstep(Math.min(1, ring.t / CRUSH));
  if (k >= 1) return;
  const r = from + (to - from) * k;
  const s = r / ring.unit;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(ring.x, ring.y);
  ctx.scale(s, s);
  ctx.globalAlpha = (1 - k) * 0.75;
  ctx.strokeStyle = ring.hex;
  ctx.lineWidth = Math.max(0.6, r * 0.09) / s;
  ctx.stroke(ring.path);
  ctx.restore();
}

/**
 * The skin, off the body and into the space around it. Out fast and then
 * slowing — `1 - (1 - t)²` rather than `smoothstep` — because something thrown
 * leaves at its top speed and is spent by the end, which is the opposite shape
 * of curve to the crush above and reads as the opposite event.
 */
function drawHusk(ctx: CanvasRenderingContext2D, ring: Ring, was: number): void {
  const k = 1 - (1 - ring.t) ** 2;
  const r = was * (1 + REACH * k);
  const alpha = (1 - ring.t) ** 1.6;
  // The bloom. Quantised to a quarter of the body it came off: `haloSprite`
  // caches one canvas per (colour, radius), and a radius that grows every
  // frame would mint a fresh one every frame — `glow.ts` says so.
  const step = Math.max(2, was * 0.25);
  halo(ctx, ring.x, ring.y, Math.round((r * 0.85) / step) * step, ring.hex, alpha * 0.5);

  const s = r / ring.unit;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = ring.hex;
  ctx.globalAlpha = alpha * 0.9;
  ctx.translate(ring.x, ring.y);
  ctx.scale(s, s);
  // Thinning as it stretches: the same amount of skin over a bigger contour.
  // Divided by the scale, so the width is in screen pixels and not in a
  // contour's own units, which the transform would otherwise stretch too.
  ctx.lineWidth = Math.max(0.5, was * 0.18 * (1 - k * 0.75)) / s;
  ctx.stroke(ring.path);
  ctx.restore();

  drawPlates(ctx, ring, was, r, alpha);
}

/**
 * The skin breaking up on the way out — short arcs riding just past the husk,
 * each turned by its own amount. Without them the husk is a ring, and a ring
 * expanding out of a body is the grammar this game already spends on a shield
 * failing (`clasp-break.ts`). Plates say *surface*, which is what came off.
 */
function drawPlates(
  ctx: CanvasRenderingContext2D,
  ring: Ring,
  was: number,
  r: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = ring.hex;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.6, was * 0.13 * (1 - ring.t * 0.6));
  for (let i = 0; i < PLATES; i++) {
    // Each plate keeps the angle it broke off at and drifts a little past the
    // husk, so the ring never sweeps as one piece.
    const a = (i / PLATES) * Math.PI * 2 + sinHash(i * 7.1) * 0.6;
    const d = r * (1.02 + 0.22 * sinHash(i * 3.7) * ring.t);
    const arc = 0.12 + 0.16 * sinHash(i * 11.3);
    ctx.globalAlpha = alpha * (0.5 + 0.5 * sinHash(i * 2.3));
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, d, a - arc, a + arc);
    ctx.stroke();
  }
  ctx.restore();
}
