import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import {
  gyreMass,
  gyreSkinPath,
  gyreSpecular,
} from "../../../../../packages/render/src/gyre-core.js";
import type { GyreCoreDraw } from "../../../../../packages/render/src/gyre-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * HELIX, drawn: something coiled is growing inside the ball, and it is
 * winding.
 *
 * Where the shipped organelle suspends nine loose granules in its fluid, this
 * one holds a single strand wound round the inside of the membrane from the
 * bottom of the ball to the top — thirty beads on a helix, each one pinned
 * at a longitude and a latitude and carried round by the wheel's true rate
 * (`facet`), the near ones drawn over the mass and the far ones seen dimly
 * through it. The last bead is the head: bigger, brighter, and the one thing a
 * nucleus was for.
 *
 * And the strand *creeps*. On top of the wheel's turn the coil advances along
 * itself on a slow clock of its own, so it is not a pattern rotating but a
 * thing moving through the fluid — the motion the owner named as the one to
 * aim for, a grown thing rather than a mechanism (`docs/queue.md`, this slot).
 * The two clocks are not multiples of each other, so the coil never comes back
 * to the same picture.
 *
 * Every mark goes through `pin` and `facet`; nothing here re-derives the turn.
 * Each bead is foreshortened by its own tangent plane, so one going round the
 * limb narrows to nothing rather than being cut by an edge.
 */

/** Beads on the strand, and how many times it winds from bottom to top. */
const BEADS = 30;
const WINDS = 2.4;

/** How far out the strand lies, as a share of the mass, and how near the poles
 * it is allowed to reach. */
const REACH = 0.62;
const POLE = LAT_LIMIT * 0.86;

/** A bead's radius as a share of the organelle's, and the head's. */
const BEAD = 0.07;
const HEAD = 0.16;

/** What a far bead keeps of a near one's light, through the mass. */
const THROUGH = 0.45;

/** Seconds for the coil to creep one bead's length along itself. Slow, and not
 * a multiple of anything the wheel does. */
const CREEP_SECONDS = 2.9;

/** What a bead keeps where the surface has turned from the light. Generous,
 * for `gyre-core.ts`'s reason: the mass is lit from inside too. */
const FLOOR = 0.45;

/** How far the coil wanders off a true helix, in radians of latitude, and how
 * often. A helix wound to the number is a spring, and a spring is a made
 * thing; a strand that has grown round the inside of something sags. */
const WANDER = 0.11;
const WANDER_TURNS = 3.7;

/** The bead at parameter `s` along the strand, 0 at the bottom and 1 at the
 * head, pinned fresh because the creep moves every one of them. */
function bead(s: number) {
  const lat = -POLE + 2 * POLE * s + WANDER * Math.sin(s * WANDER_TURNS * Math.PI * 2);
  return pin(s * WINDS * Math.PI * 2, lat, REACH);
}

/**
 * One pass over the strand, drawing the side asked for. Beads first, then the
 * thread between neighbours on the same side — so the strand reads as one
 * thing, and breaks where it goes over the limb.
 *
 * The head stays at the top of the coil and the beads creep up into it: a
 * bead is born faint at the bottom and fades into the head as it arrives, so
 * the creep wrapping from one bead to the next moves nothing visibly.
 */
function strand(
  ctx: CanvasRenderingContext2D,
  r: number,
  hex: string,
  flow: number,
  creep: number,
  nearSide: boolean,
): void {
  let prev: { x: number; y: number } | null = null;
  for (let i = 0; i <= BEADS; i++) {
    const isHead = i === BEADS;
    const s = isHead ? 1 : (i + creep) / BEADS;
    const f = facet(bead(s), flow);
    if (f.near !== nearSide) {
      prev = null;
      continue;
    }
    // Faint at birth, and gone into the head on arrival.
    const life = isHead ? 1 : Math.min(1, s * BEADS, (1 - s) * BEADS);
    const keep = (nearSide ? 1 : THROUGH) * life;
    const px = f.x * r;
    const py = f.y * r;
    if (prev !== null) {
      const thread = new Path2D();
      thread.moveTo(prev.x, prev.y);
      thread.lineTo(px, py);
      ctx.globalAlpha = 0.5 * keep;
      strokeGlow(ctx, thread, hex, STROKE.inner * 0.8, 0.6);
    }
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.arc(0, 0, r * (isHead ? HEAD : BEAD), 0, Math.PI * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(hex, (isHead ? 0.95 : 0.6) * keep * surfaceDim(FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
    prev = { x: px, y: py };
  }
  ctx.globalAlpha = 1;
}

export function helix(d: GyreCoreDraw): void {
  const { ctx, x, y, r, tint, rim, flow, time, pull } = d;
  // Where along itself the coil has crept, in beads. A fraction — the whole
  // number of beads is what wraps.
  const creep = (time / CREEP_SECONDS) % 1;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The aura, the shipped pass.
  halo(ctx, x, y, r * (2.4 + pull * 0.9), tint, 0.13 + 0.16 * pull);

  ctx.save();
  ctx.translate(x, y);
  const skin = gyreSkinPath(r, time);
  ctx.save();
  ctx.rotate(flow);
  ctx.clip(skin);
  ctx.rotate(-flow);

  // The far side of the strand, then the mass over it, then the near side.
  strand(ctx, r, rim, flow, creep, false);
  gyreMass(ctx, r, tint, pull);
  strand(ctx, r, rim, flow, creep, true);
  gyreSpecular(ctx, r);
  ctx.restore();

  // The membrane over its contents, turned with the wheel — the shipped pass.
  ctx.globalAlpha = 0.9;
  ctx.rotate(flow);
  strokeGlow(ctx, skin, tint, STROKE.inner, 1.4 + pull);
  ctx.restore();
  ctx.restore();
}
