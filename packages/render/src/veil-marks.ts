import { type Creature, type SimConfig, veilBeatsToMorph, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsVeilCore, VEIL_RADIUS_MUL, veils } from "./veil.js";
import { drawQuestion } from "./veil-question.js";
import { VEIL_TOP } from "./veil-shape.js";

/**
 * What stands over a cloud, and it is a different thing in each seat.
 *
 * **Player 1 gets a clock and the colour it is running out into.** The clock
 * is the ring that drains to the morph — the pilot's whole second sentence,
 * because "cyan" alone is worth nothing to somebody who will be loading it two
 * beats from now. Inside it is a pair of curved arrows: *this turns over*, and
 * they are drawn in the colour it turns over **into**, so the ring answers
 * "how long" and "into what" in one glance and the pilot never has to work the
 * second one out from the first.
 *
 * It used to carry a shut eye beside it as well — *your partner cannot see
 * this* — and that mark is gone from here. It was right and it was in the
 * wrong place: five creatures each said it in their own hand, over their own
 * body, so a pair had to learn five markings to learn one sentence. It is said
 * once now, in the corner of the screen, by `siren.ts`.
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
 *   to one side. This stands **above** the cloud, clear of it, in the gap the
 *   radar strip already trains the eye to read downward from.
 * - *What colour.* The lure's alarm is pure white, which is the absence of a
 *   palette. This is the ammunition colour the cloud is about to want —
 *   because a mark over a veil is not an alarm. Nothing is going wrong.
 * - *What it says about time.* The lure's alarm is steady, because it is a
 *   label on a body that will resolve itself. The ring here **drains**, which
 *   is the one thing in this game that does, because the whole creature is a
 *   thing that expires.
 */

/** The off-white the empty half of the ring is drawn in — the HUD's own, not
 * the lure's absence-of-a-palette white. The part that is still to run is the
 * *next colour* instead (`nextHex`), because that half is a sentence and this
 * one is only a track for it. */
const MARK = PALETTE.text;
/** How far above the cloud's own top edge the mark sits, in units of the
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
    if (showsVeilCore(l)) drawClock(ctx, l.tile, world.cfg, world.beat, beatPhase, x, top, c);
    else drawQuestion(ctx, l.tile, x, top);
  }
}

/**
 * The colour the body inside is about to become.
 *
 * A veil only ever holds one of two, and `veilMorph` swaps between them — so
 * "the next one" is "the other one", and that is the whole of it. It is read
 * off the creature rather than off a second copy of the swap, because the two
 * disagreeing would put a cyan arrow over a cloud about to turn red, which is
 * worse than no arrow at all.
 *
 * A veil with no colour cannot happen on the field (`veilOnSpawn` rolls one
 * before the body arrives) and is drawn as if it were about to become cyan,
 * the same fallback shape `veilBecomes` takes.
 */
function nextHex(c: Creature): string {
  return c.color === "cyan" ? PALETTE.red : PALETTE.cyan;
}

/**
 * The morph clock: a ring that drains clockwise to the turn, with the switch
 * mark standing in the middle of it, both in the colour the cloud is turning
 * *into*.
 *
 * `veilBeatsToMorph` is the whole of the arithmetic and it is called, never
 * re-derived — the modulo written out here would be a second copy of the rule
 * that decides what the body under this ring actually is, and the two would
 * disagree the first time the period changed.
 *
 * **There is no dot in the middle any more.** The last beat before a turn used
 * to fill the ring's centre, on the reasoning that "it goes over on the next
 * one" is the moment the pilot has to be talking. The dot said that and it
 * also said *loading*, which is the one thing this ring is not — it is a
 * countdown to a change, and a filling dot is a thing arriving. What carries
 * the last beat instead is the ring and the mark both coming up to full
 * strength, which says the same and does not read as a progress spinner.
 */
function drawClock(
  ctx: CanvasRenderingContext2D,
  tile: number,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  x: number,
  y: number,
  c: Creature,
): void {
  const left = veilBeatsToMorph(cfg, beat);
  // Beats left, minus how far into the current beat this frame is: the ring
  // has to run down smoothly, or the pilot reads it as a number that jumps
  // and stops trusting it in between the jumps. `beatPhase` is the only part
  // of this the world does not carry, and it is the renderer's own — both
  // devices derive it from the same tick counter.
  const phase = Math.max(0, Math.min(1, (left - beatPhase) / cfg.veilMorphBeats));
  const r = tile * 0.24;
  const hex = nextHex(c);

  ctx.save();
  ctx.lineWidth = Math.max(1.4, tile * 0.045);
  ctx.strokeStyle = MARK;

  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // The remaining arc, from the top and clockwise, so it empties the way a
  // clock hand goes round rather than the way a battery gauge does. In the
  // colour it is running out *into*, so the ring is the sentence rather than
  // half of it.
  ctx.strokeStyle = hex;
  ctx.globalAlpha = left <= 1 ? 1 : 0.85;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * phase);
  ctx.stroke();

  drawSwitch(ctx, tile, x, y, r * 0.62, hex, left <= 1 ? 1 : 0.75);
  ctx.restore();
}

/**
 * The switch mark: two arcs chasing each other round a circle, each with a
 * head on its leading end. *This turns over into the other one.*
 *
 * Drawn rather than typed, for `lure-alarm.ts`'s reason — a glyph in a font at
 * this size is a smear, and the mark has half a second to be read in. Two
 * quarter-turns opposite each other read as rotation at eleven pixels across,
 * where an arrow chasing its own tail reads as a blob.
 */
function drawSwitch(
  ctx: CanvasRenderingContext2D,
  tile: number,
  x: number,
  y: number,
  r: number,
  hex: string,
  alpha: number,
): void {
  const w = Math.max(1.1, tile * 0.026);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hex;
  ctx.fillStyle = hex;
  ctx.lineWidth = w;
  ctx.lineCap = "round";

  for (const side of [0, Math.PI]) {
    ctx.beginPath();
    ctx.arc(x, y, r, side + 0.35, side + Math.PI - 0.35);
    ctx.stroke();
    // The head, at the end the arc runs to: three points, so it stays a
    // triangle at any size instead of collapsing into the stroke.
    const a = side + Math.PI - 0.35;
    const hx = x + Math.cos(a) * r;
    const hy = y + Math.sin(a) * r;
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const h = r * 0.55;
    ctx.beginPath();
    ctx.moveTo(hx + tx * h, hy + ty * h);
    ctx.lineTo(hx + Math.cos(a) * h * 0.7, hy + Math.sin(a) * h * 0.7);
    ctx.lineTo(
      hx - Math.cos(a) * h * 0.5 + tx * h * 0.1,
      hy - Math.sin(a) * h * 0.5 + ty * h * 0.1,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
