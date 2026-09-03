import {
  type Creature,
  type CreatureKind,
  type SimConfig,
  veilBeatsToMorph,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawRadarLock, drawTargetLock } from "./target-lock.js";
import { showsVeilCore, VEIL_RADIUS_MUL, veils } from "./veil.js";
import { VEIL_FLATTEN, VEIL_TOP } from "./veil-shape.js";

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
 * **Player 2 gets a target lock and nothing else.** Not a dimmed body, not a
 * guess, not a countdown — a countdown on the navigator's screen would be half
 * the pilot's sentence arriving without them, and the sentence is the game.
 * It was a question mark until the owner asked for one picture instead of
 * four; `target-lock.ts` carries that reversal and its reasoning.
 *
 * **The two seats still share nothing, which is the check this owes.** They
 * are the same creature seen from opposite sides, and if they converged the
 * pair would stop talking:
 *
 * - *What it is.* The navigator gets a frame around a contact and no clock at
 *   all. The pilot gets a clock and no frame: a ring that drains, the one
 *   thing in this game that does, because the whole creature expires.
 * - *What colour.* The navigator's frame is the HUD's off-white, which says
 *   nothing about ammunition because there is nothing here it may say. The
 *   pilot's ring is the colour the cloud is turning *into*.
 * - *Where.* The navigator's frame is **around** the cloud, because a contact
 *   is a thing with an extent. The pilot's clock stands **above** it, clear of
 *   the weather, in the gap the radar strip trains the eye to read down from.
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
/** How far the navigator's frame stands outside the cloud's own silhouette,
 * in cloud radii. The heaps reach about 1.05 sideways (`BILLOWS`) and
 * `VEIL_TOP`/`VEIL_FLATTEN` say how far up and down, so the frame is those
 * plus a gap rather than four numbers typed beside them. */
const BOX_GAP = 0.16;
/** How wide the blip's own frame is on the radar strip, in pixels. */
const BLIP_HALF = 7;

export function drawVeilMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  /** The wall clock, for the lock's flicker (`target-lock.ts`). */
  time: number,
): void {
  for (const c of veils(world)) {
    const { x, y } = creatureCenter(l, c, beatPhase);
    const r = l.tile * 0.4 * VEIL_RADIUS_MUL;
    if (showsVeilCore(l)) {
      drawClock(ctx, l.tile, world.cfg, world.beat, beatPhase, x, y - r * (VEIL_TOP + LIFT), c);
      continue;
    }
    // Around the weather rather than above it: the cloud is what was found,
    // and a frame set off to one side of it would be pointing at the gap.
    const halfH = (r * (VEIL_TOP + VEIL_FLATTEN)) / 2 + r * BOX_GAP;
    const mid = y + (r * (VEIL_FLATTEN - VEIL_TOP)) / 2;
    drawTargetLock(ctx, x, mid, r * (1.05 + BOX_GAP), halfH, MARK, time, 0.9, c.id);
  }
}

/**
 * The strip's half of the same thing: a veil is announced as a **contact**,
 * never as a colour.
 *
 * `drawRadar` reads `q.color` off the queue entry to tint every blip, and a
 * veil's queue entry carries none — the body inside is rolled when it enters
 * the field, so there is nothing there to read and the ordinary fallback would
 * have painted it cyan. That would be worse than a leak: it would be a
 * confident announcement of a colour that is right half the time.
 *
 * docs/spec/systems.md 5.2 asked for a question mark here by name, in the same
 * paragraph that lists the veil among the rows that were not built. The word
 * it wanted is the one this frame says; it is now said the same way over every
 * body the game picks out, which the spec could not have anticipated.
 */
export function drawRadarVeilMark(
  ctx: CanvasRenderingContext2D,
  kind: CreatureKind,
  x: number,
  y: number,
  alpha: number,
  time: number,
): void {
  if (kind !== "veil") return;
  drawRadarLock(ctx, x, y, BLIP_HALF, MARK, time, alpha, x);
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
