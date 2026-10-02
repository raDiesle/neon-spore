import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The ring itself**, cut from `thumb-aura.ts` along the line between what a
 * held mark's ring *is* this frame — where, how old, judged or not — and how
 * it is put down.
 */

/** How long the ring stays white before it beats green, in seconds. */
export const AURA_ONSET_SECONDS = 0.25;
/** How long a verdict's flash lasts on the ring, in seconds. */
export const FLASH_SECONDS = 0.35;

/**
 * The ring's radius `t` seconds into a press, in the mark's own radii.
 *
 * The owner's *first quick and then very slow*, and both halves meant to be
 * seen (2 October 2026, on the first cut: *are you sure it slowly grows, but
 * some faster at the beginning?* — it jumped most of the way in a fifth of a
 * second and then crept a pixel or two a second, which read as a ring that
 * appeared and stood). So two parts, each with a time an eye can follow:
 *
 * - **quick**: from just outside the mark to half a radius further, most of
 *   it inside the first half second;
 * - **slow**: another radius and a fifth over the next several seconds, still
 *   moving visibly at two and three seconds, so a hold that is running is a
 *   ring that is still opening.
 */
export function auraRadius(t: number): number {
  const quick = 1 - Math.exp(-t / 0.2);
  const slow = 1 - Math.exp(-t / 3);
  return 1.3 + 0.5 * quick + 1.2 * slow;
}

export interface AuraLook {
  x: number;
  y: number;
  /** The radius drawn, in pixels. */
  r: number;
  red: boolean;
  /** Before the press could have been judged: white, not yet green. */
  onset: boolean;
  /** 0..1: how far into the lift's fade. */
  fade: number;
  /** 0..1: a verdict landing on it, loud and gone. */
  flash: number;
  /** 0..1: the beat, loud on it and gone before the next. */
  beat: number;
}

/** A green circle round the mark, a narrow glow either side of it. */
export function drawAuraRing(ctx: CanvasRenderingContext2D, a: AuraLook): void {
  const colour = a.red ? PALETTE.red : a.onset ? PALETTE.text : PALETTE.good;
  const r = a.r * (1 + 0.04 * a.beat + 0.06 * a.flash);
  const glow = (0.3 + 0.3 * a.beat + 0.35 * a.flash) * a.fade;
  const inner = r * 0.82;
  const outer = r * 1.18;
  ctx.save();
  const g = ctx.createRadialGradient(a.x, a.y, inner, a.x, a.y, outer);
  g.addColorStop(0, rgba(colour, 0));
  g.addColorStop(0.5, rgba(colour, glow));
  g.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(a.x, a.y, outer, 0, Math.PI * 2);
  ctx.arc(a.x, a.y, inner, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.strokeStyle = rgba(colour, (0.75 + 0.25 * Math.max(a.beat, a.flash)) * a.fade);
  ctx.lineWidth = STROKE.inner * (1.3 + a.flash);
  ctx.beginPath();
  ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
