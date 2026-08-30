import type { Creature, CreatureKind, World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";

/**
 * The alarm player 2 sees over a lure, and player 1 never does.
 *
 * The body underneath is drawn by `creatures.ts` from `wornKind`, identically
 * on both screens — full size, full colour, the real contour and the real
 * own-motion. This file is the *only* difference between the two devices, and
 * it is drawn on one of them.
 *
 * **Deliberately unlike `torch-alarm.ts`, and that is the check this owes.**
 * There is already an alarm marking in this game, and two alarms that look
 * alike are worse than one alarm that is ugly. Every axis is opposed:
 *
 * - *Where.* The torch alarm is a band across the HUD strip and a wash down
 *   both screen edges. This is on the body, in the field, and nowhere else.
 * - *What colour.* The torch alarm is `PALETTE.rock`, the grey the whole rock
 *   vocabulary is written in. This is white — a colour nothing else on the
 *   field carries, so it cannot be read as a body, a shot or a shield.
 * - *What it says about time.* The torch alarm pulses, because it is about
 *   something that has not arrived: the pulse is the countdown. This is
 *   steady, because it is a *label on a thing that is already here*, and the
 *   answer it wants is not a slide but a sentence. A pulse would have been
 *   read as "and it is getting worse", which is the one thing a lure never
 *   does — it goes on its own two rows short of the ship.
 *
 * So the pair learns two markings that share nothing: grey and moving at the
 * top of the screen means take the column; white and still around a body means
 * leave that one alone.
 */

/** A colour nothing else on the field is drawn in. Not in `PALETTE`: it is not
 * part of the game's palette, it is the absence of one. */
const ALARM = "#FFFFFF";
/** The ring sits outside the body's own contour with a clear gap, so it never
 * reads as a rim the creature grew. */
const RING_MUL = 1.55;
const LABEL = "LURE — DO NOT SHOOT";

/** Every lure on the field, in draw order. Exported so the radar and the body
 * marking ask the same question once. */
export function lures(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "lure");
}

/**
 * Whether this screen carries the alarm at all. `p1` never does — that is the
 * whole creature — and `test` does, because it is both halves at once on one
 * screen and a rig that hid half the picture would be no rig.
 */
export function showsLureAlarm(l: Layout): boolean {
  return l.role !== "p1";
}

export function drawLureAlarms(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  if (!showsLureAlarm(l)) return;
  for (const c of lures(world)) {
    const { x, y } = creatureCenter(l, c, beatPhase);
    drawOne(ctx, l, x, y, creatureRadius(l, c, beatPhase, world.cfg));
  }
}

function drawOne(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number, r: number): void {
  const ring = r * RING_MUL;
  ctx.save();
  ctx.strokeStyle = ALARM;
  ctx.fillStyle = ALARM;
  ctx.lineWidth = Math.max(1.5, r * 0.09);

  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, ring, 0, Math.PI * 2);
  ctx.stroke();

  // The exclamation, drawn rather than typed: a bar and a dot scale with the
  // body, and a glyph in a font does not — at 26 px a `!` in 10 px type is a
  // smear, and this marking has half a second to be read in.
  const top = y - ring - r * 0.55;
  const barH = r * 0.5;
  const barW = Math.max(1.5, r * 0.16);
  ctx.globalAlpha = 1;
  ctx.fillRect(x - barW / 2, top - barH, barW, barH);
  ctx.beginPath();
  ctx.arc(x, top + barW * 0.9, barW * 0.62, 0, Math.PI * 2);
  ctx.fill();

  drawLabel(ctx, l, x, y, ring);
  ctx.restore();
}

/**
 * The words, on whichever side keeps them on the screen. A lure in the first
 * or last column would otherwise have half its label off the edge, and half a
 * label is a marking the pair has to lean in to read at the one moment there
 * is no time to.
 */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  ring: number,
): void {
  ctx.font = '600 9px "Courier New",monospace';
  ctx.textBaseline = "middle";
  const width = ctx.measureText(LABEL).width;
  const gap = ring + 6;
  const right = x + gap + width <= l.width - 4;
  ctx.textAlign = right ? "left" : "right";
  ctx.globalAlpha = 0.92;
  ctx.fillText(LABEL, right ? x + gap : x - gap, y);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/**
 * The same alarm on the radar strip, which is the half that matters more: it
 * says *before* the body arrives rather than at the moment a thumb is already
 * moving, and a hit should always be player 2's haste and never player 2's
 * surprise.
 *
 * Drawn beside the ordinary blip rather than instead of it — the blip carries
 * the disguise's colour, which is still what player 2 has to name out loud so
 * that player 1 knows which of the bodies on their screen is meant.
 *
 * Player 1's strip is untouched by all of this and could not leak if it tried:
 * it carries `guard` kinds only (`showsRadar`, `radarOwner`), and a lure is an
 * `aim` kind like the two bodies it wears.
 */
export function drawRadarLureMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  kind: CreatureKind,
  x: number,
  y: number,
): void {
  if (!showsLureAlarm(l) || kind !== "lure") return;
  ctx.save();
  ctx.fillStyle = ALARM;
  ctx.globalAlpha = 1;
  // The same bar-and-dot as on the body, small: one glyph, two places, so the
  // strip and the field are plainly saying the same word.
  ctx.fillRect(x - 1, y - 15, 2, 5);
  ctx.beginPath();
  ctx.arc(x, y - 7.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '600 7px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillText("LURE", x, y - 18);
  ctx.textAlign = "left";
  ctx.restore();
}
