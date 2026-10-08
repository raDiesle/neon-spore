import {
  blisterByOf,
  blisterIsUp,
  blisterSwelling,
  type Creature,
  type SimConfig,
} from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { flatRadius } from "./creature-place.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { type Layout, seatOf } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE BLISTER, drawn: **the pore, the body coming up out of it and going back
 * into it, and the bulge a beat before** (`docs/spec/blister.md`).
 *
 * The body is ROOTED CLOVER through the ordinary living draw
 * (`content/silhouettes-blister.ts`), its roots running down into a dark pore
 * in the membrane. It comes up over the first `RISE_BEATS` of its time up and
 * goes back down over the last, clipped at the pore so it is seen to come out
 * of the field rather than to grow on top of it; the pore's front lip is drawn
 * over it again, so the hole has a near side.
 *
 * **The pore and the bulge are on one screen.** While it is under, the screen
 * of the seat that may *not* knock it down is drawn its pore, shut — *where*;
 * on the last beat under the pore swells, a dome pushing up through the skin —
 * *when*. With `by` both, on both. The hand that can do it is drawn nothing
 * while it is under: where and when it comes up are the partner's to say. On
 * the beat it sinks the pore glides to the next one, the body moving under
 * the skin, because the simulation picks the next pore on that beat.
 *
 * The help for the gesture — the glyph, the pips, whose it is — is laid over
 * it flat after every body (`blister-help.ts`), and never changes this shape.
 */

/** Beats it takes to come up out of the pore, and to go back into it. A third
 * of a beat: long enough to read as rising, short enough that a hand told
 * *now* on the beat it surfaces is reaching for something already there. */
const RISE_BEATS = 0.3;

/** How far up a body is, 0 under its pore and 1 fully up — the same number
 * the help fades in on (`blister-help.ts`). */
export function blisterRise(cfg: SimConfig, c: Creature, beatPhase: number): number {
  if (!blisterIsUp(c)) return 0;
  const up = cfg.blisterUpBeats;
  const elapsed = up - (c.blisterClock ?? up) + beatPhase;
  return smoothstep(Math.min(elapsed, up - elapsed) / RISE_BEATS);
}

/**
 * Whether this screen is drawn the bulge: the seat that may not knock it down,
 * both with `by` both, and the rig, which is both halves at once.
 */
export function showsBlisterBulge(l: Layout, c: Creature): boolean {
  if (l.role === "test") return true;
  const by = blisterByOf(c);
  return by === "both" || by !== seatOf(l.role);
}

/** Where the pore sits under a body of radius `r` at `y`: under the lobes,
 * where the roots go in. */
const poreY = (y: number, r: number): number => y + r * 0.55;

export function drawBlisterBody(b: Body): void {
  const { ctx, c } = b;
  const r = flatRadius(b.l, b.world.cfg, c, b.beatPhase);
  if (!blisterIsUp(c)) {
    if (!showsBlisterBulge(b.l, c)) return;
    if (blisterSwelling(c)) drawBulge(ctx, b.x, b.y, r, b.beatPhase);
    else drawPore(ctx, b.x, poreY(b.y, r), r, "shut");
    return;
  }
  const h = blisterRise(b.world.cfg, c, b.beatPhase);
  const py = poreY(b.y, r);
  drawPore(ctx, b.x, py, r, "back");
  ctx.save();
  // Everything above the pore's middle, and the mouth of the pore itself: the
  // body is seen coming out of the hole and is never drawn below its lip.
  const clip = new Path2D();
  clip.rect(b.x - r * 4, b.y - r * 4, r * 8, py - (b.y - r * 4));
  clip.ellipse(b.x, py, r * PORE_RX, r * PORE_RY, 0, 0, Math.PI * 2);
  ctx.clip(clip);
  ctx.globalAlpha *= Math.min(1, h * 2);
  drawLivingBody({ ...b, y: b.y + (1 - h) * r * 1.5 });
  ctx.restore();
  drawPore(ctx, b.x, py, r, "lip");
}

/** The pore's half-width and half-height, in body radii. */
const PORE_RX = 0.8;
const PORE_RY = 0.28;

/**
 * The pore: a dark hole in the membrane, its back wall under the body and its
 * near lip over it, so the roots go *into* something — and, smaller and shut,
 * where the body is under, on the screen that is drawn the bulge.
 */
function drawPore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  part: "back" | "lip" | "shut",
): void {
  const k = part === "shut" ? 0.6 : 1;
  const rx = r * PORE_RX * k;
  const ry = r * PORE_RY * k;
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.dim, 0.9);
  ctx.beginPath();
  if (part !== "lip") {
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.background, 0.95);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The bulge, on the last beat under: a dome of membrane pushing up where the
 * body will come out, growing over the beat and lit along its crown. Faint at
 * the start of the beat and plain by its end — the partner's *now* is the end
 * of this beat.
 */
function drawBulge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  phase: number,
): void {
  const p = smoothstep(0.25 + phase * 0.75);
  const py = poreY(y, r);
  const rx = r * PORE_RX * (0.7 + 0.3 * p);
  const height = r * (0.25 + 0.55 * p);
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.moveTo(x - rx, py);
  ctx.bezierCurveTo(x - rx, py - height * 1.3, x + rx, py - height * 1.3, x + rx, py);
  ctx.closePath();
  ctx.fillStyle = rgba(PALETTE.dim, 0.25 + 0.3 * p);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.text, 0.5 + 0.4 * p);
  ctx.stroke();
  // The crown catching the light, so the dome reads as pushed *up*.
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.2, py - height * 0.7, rx * 0.35, height * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.35 * p);
  ctx.fill();
  ctx.restore();
}
