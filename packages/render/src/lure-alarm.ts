import type { Creature, CreatureKind, World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { drawRadarLock, drawTargetLock } from "./target-lock.js";

/**
 * The alarm player 2 sees over a lure, and player 1 never does.
 *
 * The body underneath is drawn by `creatures.ts` from `wornKind`, identically
 * on both screens — full size, full colour, the real contour and the real
 * own-motion. This file is the *only* difference between the two devices, and
 * it is drawn on one of them.
 *
 * **The ring and the exclamation are gone; the frame is `target-lock.ts`'s.**
 * This file used to argue at length that it had to look unlike every other
 * marking in the game, and that argument is answered in the file that replaced
 * its ring: the pair was learning four pictures for one idea. What is left
 * here is what is genuinely this creature's and nobody else's — the white, the
 * words, and the hole burning through the middle of the body — that last is
 * drawn with the body rather than here (`lure-hole.ts`), because it is a hole
 * in a contour and only the file that has the contour can cut one.
 *
 * **Still deliberately unlike `torch-alarm.ts`, and that is the check this
 * owes.** There is another alarm in the game, and two alarms that look alike
 * are worse than one alarm that is ugly. Every axis is still opposed:
 *
 * - *Where.* The torch alarm is a band across the HUD strip and a wash down
 *   both screen edges. This is on the body, in the field, and nowhere else.
 * - *What colour.* The torch alarm is `PALETTE.rock`, the grey the whole rock
 *   vocabulary is written in. This is white — a colour nothing else on the
 *   field carries, so it cannot be read as a body, a shot or a shield.
 * - *What it says about time.* The torch alarm pulses hard, because it is
 *   about something that has not arrived: the pulse is the countdown. The lock
 *   only flickers, which is a signal being held rather than a clock running
 *   down — the one thing a lure never does is get worse, it goes on its own
 *   two rows short of the ship.
 *
 * So the pair still learns two markings that share nothing: grey and moving at
 * the top of the screen means take the column; a white frame around a body
 * means leave that one alone.
 */

/** A colour nothing else on the field is drawn in. Not in `PALETTE`: it is not
 * part of the game's palette, it is the absence of one. */
const ALARM = "#FFFFFF";
/** The frame stands outside the body's own contour with a clear gap, so it
 * never reads as a rim the creature grew. Square, because a lure wears an
 * ordinary body and there is nothing beside it to make room for. */
const BOX_MUL = 1.55;
/** How wide the blip's own frame is on the radar strip, in pixels. */
const BLIP_HALF = 7;
/** Two words, and the shortest pair that is still an instruction. It was
 * `LURE — DO NOT SHOOT` until the owner asked for it shorter: the hole in the
 * middle of the body now carries *which creature this is*, so the words beside
 * it only have to carry *what to do*, and a label half as wide is one that
 * fits beside a body in the first or last column. */
const LABEL = "DO NOT SHOOT";

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
  /** The wall clock, for the lock's flicker. Render's own — see
   * `target-lock.ts` on why the simulation never sees it. */
  time: number,
  /**
   * A picture of the body rather than of the screen it is on (`ViewState.bare`)
   * — the frame is on the body and stays; the words are as wide as a phone and
   * are laid out against the screen's own edge, so in a crop three tiles across
   * they arrive as a torn-off half sentence.
   */
  bare = false,
): void {
  if (!showsLureAlarm(l)) return;
  for (const c of lures(world)) {
    const { x, y } = creatureCenter(l, c, beatPhase);
    drawOne(ctx, l, x, y, creatureRadius(l, c, beatPhase, world.cfg), time, c.id, bare);
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  time: number,
  id: number,
  bare: boolean,
): void {
  const half = r * BOX_MUL;
  drawTargetLock(ctx, x, y, half, half, ALARM, time, 0.95, id);
  if (bare) return;
  ctx.save();
  ctx.fillStyle = ALARM;
  drawLabel(ctx, l, x, y, half);
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
  half: number,
): void {
  ctx.font = '600 9px "Courier New",monospace';
  ctx.textBaseline = "middle";
  const width = ctx.measureText(LABEL).width;
  const gap = half + 6;
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
  time: number,
): void {
  if (!showsLureAlarm(l) || kind !== "lure") return;
  ctx.save();
  // The same corner frame as on the body, small: one marking, two places, so
  // the strip and the field are plainly saying the same word.
  drawRadarLock(ctx, x, y, BLIP_HALF, ALARM, time, 1, x);
  ctx.fillStyle = ALARM;
  ctx.globalAlpha = 1;
  ctx.font = '600 7px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillText("LURE", x, y - 18);
  ctx.textAlign = "left";
  ctx.restore();
}
