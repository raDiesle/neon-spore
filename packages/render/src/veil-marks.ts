import { type CreatureKind, type SimConfig, veilBeatsToMorph, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsVeilCore, VEIL_RADIUS_MUL, veils } from "./veil.js";
import { VEIL_TOP } from "./veil-shape.js";

/**
 * What stands over a cloud, and it is a different thing in each seat.
 *
 * **Player 1 gets a clock and a shut eye.** The clock is the ring that drains
 * to the morph — the pilot's whole second sentence, because "cyan" alone is
 * worth nothing to somebody who will be loading it two beats from now. The
 * shut eye says *your partner cannot see this*, which is the fact that turns
 * a pilot who is looking at an obvious answer into a pilot who says it out
 * loud. Without it the commonest failure of this creature is silence: the one
 * who can see forgets that the one who can shoot cannot.
 *
 * **Player 2 gets a question mark and nothing else.** Not a dimmed body, not a
 * guess, not a countdown — a countdown on the navigator's screen would be half
 * the pilot's sentence arriving without them, and the sentence is the game.
 *
 * **Deliberately unlike `lure-alarm.ts`, and this is the check it owes.** That
 * file argued at length that two markings which look alike are worse than one
 * that is ugly, and it now has a neighbour to be unlike:
 *
 * - *Where.* The lure's alarm is a ring **around** the body with a label out
 *   to one side. Both of these stand **above** the cloud, clear of it, in the
 *   gap the radar strip already trains the eye to read downward from.
 * - *What colour.* The lure's alarm is pure white, which is the absence of a
 *   palette. These are `PALETTE.text`, the off-white the HUD is written in —
 *   because a mark over a veil is not an alarm. Nothing is going wrong.
 * - *What it says about time.* The lure's alarm is steady, because it is a
 *   label on a body that will resolve itself. The ring here **drains**, which
 *   is the one thing in this game that does, because the whole creature is a
 *   thing that expires.
 *
 * So the pair learns three markings that share nothing: white and still around
 * a body means leave that one alone; grey and pulsing at the top of the screen
 * means take the column; off-white and draining above a cloud means say it
 * again, it is about to be wrong.
 */

/** The off-white both marks are drawn in — the HUD's own, not the lure's
 * absence-of-a-palette white. */
const MARK = PALETTE.text;
/** How far above the cloud's own top edge the marks sit, in units of the
 * cloud's radius. `VEIL_TOP` is where that edge is, so a cloud reshaped next
 * door does not leave a ring floating inside its own weather. */
const LIFT = 0.5;

export function drawVeilMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  for (const c of veils(world)) {
    const { x, y } = creatureCenter(l, c, beatPhase);
    const r = l.tile * 0.4 * VEIL_RADIUS_MUL;
    const top = y - r * (VEIL_TOP + LIFT);
    if (showsVeilCore(l)) drawClock(ctx, l.tile, world.cfg, world.beat, beatPhase, x, top);
    else drawQuestion(ctx, l.tile, x, top);
  }
}

/**
 * The morph clock: a ring that drains clockwise to the turn, filling in at its
 * centre for the last beat before it, with a blind eye beside it.
 *
 * `veilBeatsToMorph` is the whole of the arithmetic and it is called, never
 * re-derived — the modulo written out here would be a second copy of the rule
 * that decides what the body under this ring actually is, and the two would
 * disagree the first time the period changed.
 */
function drawClock(
  ctx: CanvasRenderingContext2D,
  tile: number,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  x: number,
  y: number,
): void {
  const left = veilBeatsToMorph(cfg, beat);
  // Beats left, minus how far into the current beat this frame is: the ring
  // has to run down smoothly, or the pilot reads it as a number that jumps
  // and stops trusting it in between the jumps. `beatPhase` is the only part
  // of this the world does not carry, and it is the renderer's own — both
  // devices derive it from the same tick counter.
  const phase = Math.max(0, Math.min(1, (left - beatPhase) / cfg.veilMorphBeats));
  const r = tile * 0.24;

  ctx.save();
  ctx.lineWidth = Math.max(1.4, tile * 0.045);
  ctx.strokeStyle = MARK;

  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // The remaining arc, from the top and clockwise, so it empties the way a
  // clock hand goes round rather than the way a battery gauge does.
  ctx.globalAlpha = left <= 1 ? 1 : 0.85;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * phase);
  ctx.stroke();

  // The last beat, said louder: a filled centre, because "it turns over on the
  // next one" is the moment the pilot has to be speaking rather than reading.
  if (left <= 1) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = MARK;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBlindEye(ctx, tile, x + r * 2.1, y);
  ctx.restore();
}

/**
 * An eye with a line through it: *the other screen does not have this.*
 *
 * Drawn rather than typed, for `lure-alarm.ts`'s reason — a glyph in a font at
 * this size is a smear, and the mark has half a second to be read in. Two arcs
 * meeting at the corners make the lid, a dot makes the pupil, and one stroke
 * corner to corner is the whole message.
 */
function drawBlindEye(ctx: CanvasRenderingContext2D, tile: number, x: number, y: number): void {
  const w = tile * 0.17;
  const h = tile * 0.1;
  ctx.save();
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = Math.max(1.1, tile * 0.028);
  ctx.globalAlpha = 0.75;

  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x, y - h * 1.9, x + w, y);
  ctx.quadraticCurveTo(x, y + h * 1.9, x - w, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, h * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(x - w * 1.05, y + h * 1.15);
  ctx.lineTo(x + w * 1.05, y - h * 1.15);
  ctx.stroke();
  ctx.restore();
}

/**
 * Player 2's question mark, drawn as a hook and a dot rather than typed. The
 * same argument as the eye above, and the same one `lure-alarm.ts` makes about
 * its exclamation: at the size a body draws on a phone, a `?` in nine-point
 * type is three grey pixels.
 */
function drawQuestion(ctx: CanvasRenderingContext2D, tile: number, x: number, y: number): void {
  const s = tile * 0.2;
  ctx.save();
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = Math.max(1.6, tile * 0.055);
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.92;

  // The hook: three quarters of a circle, opening at the bottom left, then
  // down into the stem.
  ctx.beginPath();
  ctx.arc(x, y - s * 0.45, s * 0.52, Math.PI * 0.9, Math.PI * 0.35, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.36, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.42);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y + s * 0.9, s * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The strip's half of the same thing: a veil is announced as a **question
 * mark**, never as a colour.
 *
 * `drawRadar` reads `q.color` off the queue entry to tint every blip, and a
 * veil's queue entry carries none — the body inside is rolled when it enters
 * the field, so there is nothing there to read and the ordinary fallback would
 * have painted it cyan. That would be worse than a leak: it would be a
 * confident announcement of a colour that is right half the time.
 *
 * docs/spec/systems.md 5.2 asked for exactly this shape — *"the veil appears on
 * the radar as a question mark"* — in the same paragraph that lists the veil
 * among the rows that were not built.
 */
export function drawRadarVeilMark(
  ctx: CanvasRenderingContext2D,
  kind: CreatureKind,
  x: number,
  y: number,
  alpha: number,
): void {
  if (kind !== "veil") return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y - 2.4, 3, Math.PI * 0.9, Math.PI * 0.35, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2.1, y);
  ctx.lineTo(x, y + 2.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
