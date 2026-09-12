import { livingMotion, poseClock } from "@neon-spore/content";
import { countdownIsOpen, countdownMarks } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { livingBodyMul, livingRadius } from "./creature-place.js";
import { colorTrio, type Tint } from "./creature-tint.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";

/**
 * THE COUNT: the COUNTDOWN draft's disc, and on one screen only, the marks.
 *
 * **On player 2's screen the body is bare.** `showsCount` is that sentence,
 * and it is the whole creature: the navigator holds the trigger and cannot
 * see the beat, so the beat has to come out of the pilot's mouth. Nothing on
 * that screen may change with the count — not a flare on zero, not a breath,
 * not a brighter rim — because the pair sit side by side and a body that
 * blinked when it opened would be a count the navigator could keep by eye.
 * The reject spark and the hull breaking are what player 2 gets, and both
 * arrive after the shot.
 *
 * **On player 1's the marks are cut into the rim**, the draft's own idea: dark
 * notches in the body's own shadow colour, `countdownBeats` slots round the
 * rim from twelve o'clock clockwise, and one goes each beat — a clock
 * draining. Cut across the rim rather than drawn inside it because the count
 * has to read at 26 px, and a notch through the edge is legible where a dot
 * inside is not. On zero there are none and the rim is lit instead: a halo in
 * the body's colour, held while it is open, so "open" is a thing seen and not
 * only the absence of marks.
 *
 * The marks are read off `world.beat` through `countdownMarks`, the same
 * function the shot is judged by (`sim/countdown.ts`), so the rim the pilot
 * counts and the beat a bullet is let in on are one fact.
 */

/** Which screens draw the marks: the pilot's, and the test view that is both. */
export function showsCount(l: Layout): boolean {
  return l.role !== "p2";
}

/** Where a mark begins and ends, as shares of the body radius: it starts well
 * inside so the contour's wobble never lifts the rim off it, and reaches past
 * the edge so it reads as cut through rather than painted on. */
const MARK_IN = 0.62;
const MARK_OUT = 1.12;
/** A mark's width as a share of the radius: three pixels on a phone. */
const MARK_W = 0.17;

/**
 * Where the disc actually is, and how big: the own-motion's drift, applied
 * the way `living-draw.ts` applies it, so anything drawn on the rim sits on
 * the rim and not beside it. HOLD carries no turn and no scale, so the offset
 * is the whole pose. Shared with every look in `countdown-look.ts`.
 */
export function countDisc(b: Body): { cx: number; cy: number; r: number; trio: Tint } {
  const { l, c, x, y, beats } = b;
  const r = livingRadius(l.tile, livingBodyMul(c));
  const pose = livingMotion(c.kind).poseAt(poseClock(c.id, beats));
  return { cx: x + pose.dx * l.tile, cy: y + pose.dy * l.tile, r, trio: colorTrio(c.color) };
}

/** The marks, over a body `drawLivingBody` has already drawn — the row in
 * `creature-body.ts` calls the two in that order, on the screens `showsCount`
 * names. */
export function drawCountMarks(b: Body): void {
  const { ctx, world, c, near } = b;
  const cfg = world.cfg;
  const { cx, cy, r, trio } = countDisc(b);
  if (countdownIsOpen(cfg, world.beat, c)) {
    // Zero: nothing to cut, and the rim lit for the beat instead.
    halo(ctx, cx, cy, Math.round(r * 2.6), trio.hex, 0.55);
    ctx.strokeStyle = hazed(cfg, trio.rim, near);
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.04, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  const slots = Math.max(1, cfg.countdownBeats);
  const marks = countdownMarks(cfg, world.beat, c);
  ctx.save();
  ctx.lineCap = "butt";
  ctx.strokeStyle = hazed(cfg, trio.dark, near);
  ctx.lineWidth = Math.max(2, r * MARK_W);
  ctx.beginPath();
  for (let k = 0; k < marks; k++) {
    const a = -Math.PI / 2 + (k / slots) * Math.PI * 2;
    ctx.moveTo(cx + Math.cos(a) * r * MARK_IN, cy + Math.sin(a) * r * MARK_IN);
    ctx.lineTo(cx + Math.cos(a) * r * MARK_OUT, cy + Math.sin(a) * r * MARK_OUT);
  }
  ctx.stroke();
  // A hairline of the rim colour down each cut, so a notch reads as an edge
  // catching light and not as a smudge — the same two colours the body's own
  // material is painted from.
  ctx.strokeStyle = hazed(cfg, trio.rim, near);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.beginPath();
  for (let k = 0; k < marks; k++) {
    const a = -Math.PI / 2 + (k / slots) * Math.PI * 2;
    ctx.moveTo(cx + Math.cos(a) * r * (MARK_IN + 0.06), cy + Math.sin(a) * r * (MARK_IN + 0.06));
    ctx.lineTo(cx + Math.cos(a) * r * (MARK_OUT - 0.04), cy + Math.sin(a) * r * (MARK_OUT - 0.04));
  }
  ctx.stroke();
  ctx.restore();
}
