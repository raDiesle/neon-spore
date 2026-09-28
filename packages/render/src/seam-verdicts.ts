import {
  midCol,
  type SeamAsk,
  type SeamState,
  type SimConfig,
  type SimEvent,
  seamLitStep,
  seamStepCol,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { seamClosing, seamLitPoint } from "./seam-pose.js";
import { type Point, seamLobe } from "./seam-shape.js";

/**
 * **THE SEAM's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — for a boss answered with nothing
 * but the cannon and the shield, so its marks are what those are asked for
 * (`seam-marks.ts`): the lit point on the crack, the spat rock, and the place
 * under the ridge where the shield takes the grit.
 *
 * **Every mark is both seats'**, THE PULSE's case (`pulse-marks.ts`): a point
 * wants the pilot's cannon under it and the navigator's trigger in its
 * colour, grit the navigator's shield and the pilot's guard (§11.43, *The
 * split*). So an asked mark wears the halo on both screens, and there is no
 * partner's ring and clock — nobody is waiting on the other alone. Whether a
 * mark is asked is the simulation's: the shot while `seamWantsShot`, the
 * shield while `seamWantsShield`, which is when the drawer throws the grit.
 *
 * The verdicts are the ridge's own words: a point dimmed or sealed and each
 * quench green the crack, a rock shot out greens the rock, grit taken greens
 * the shield's place, and a step run out reddens every mark it still owed.
 * **The wrong colour is not refused red**: the simulation says nothing of it
 * but the balance sheet (`sim/seam-shot.ts`), and the step stays lit.
 *
 * Held in `BossBlows` (`boss-blows.ts`), for a boss with no fx class.
 */
export const SEAM_CRACK_MARK = 0;
export const SEAM_ROCK_MARK = 1;
export const SEAM_GRIT_MARK = 2;

/** The marks each kind of step is answered on. */
const OWES: Readonly<Record<SeamAsk, readonly number[]>> = {
  point: [SEAM_CRACK_MARK],
  glow: [SEAM_CRACK_MARK],
  rock: [SEAM_ROCK_MARK],
  grit: [SEAM_GRIT_MARK],
  blind: [SEAM_GRIT_MARK],
  both: [SEAM_GRIT_MARK, SEAM_ROCK_MARK],
};

/** The words that answer a mark, and which. */
const ANSWERS: Readonly<Record<string, number>> = {
  seamDim: SEAM_CRACK_MARK,
  seamSeal: SEAM_CRACK_MARK,
  seamRockOut: SEAM_ROCK_MARK,
  seamBlock: SEAM_GRIT_MARK,
};

export class SeamMarks {
  /** Was the last answer on the crack, the rock and the shield's place right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step still owes, read off its light: what a miss reddens. */
  private owed: number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "seamLight") this.owed = [...OWES[e.ask]];
      else if (e.type === "seamQuench") this.answer(SEAM_CRACK_MARK, e.left === 0);
      else if (e.type === "seamMiss") {
        for (const k of this.owed) this.verdicts.mark(k, false);
        this.owed = [];
      } else {
        const k = ANSWERS[e.type];
        if (k !== undefined) this.answer(k, true);
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
    this.owed = [];
  }

  /** A landed answer greens its mark; `done` says the mark is owed nothing more. */
  private answer(k: number, done: boolean): void {
    this.verdicts.mark(k, true);
    if (done) this.owed = this.owed.filter((o) => o !== k);
  }
}

/** The crack's mark, off the ridge's centre `c`: the lit point, or the one closing over the rest after its seal. */
export function seamCrackCircle(l: Layout, s: SeamState, c: Point): Circle {
  const closing = seamClosing(s);
  const { y, h } = seamLobe(l, closing >= 0 ? closing : seamLitPoint(s));
  return { x: c.x, y: c.y + y, r: h * 0.75 };
}

/** Where the shield takes the grit: the hull under the ridge. */
export function seamGritCircle(l: Layout, cfg: SimConfig): Circle {
  return { x: fieldX(l, midCol(cfg)), y: l.hullY, r: l.tile * 0.5 };
}

/** The rock's mark, round it where it falls. */
export function seamRockCircle(l: Layout, at: Point): Circle {
  return { x: at.x, y: at.y, r: l.tile * 0.4 };
}

/** The halo under an asked mark, the fade the drawer had kept. */
export function drawSeamHalo(ctx: CanvasRenderingContext2D, at: Circle, time: number): void {
  const fade = ctx.globalAlpha;
  drawMarkHalo(ctx, at.x, at.y, at.r, time);
  ctx.globalAlpha = fade;
}

/** Whether the lit step asks a shot of the crack itself: a point or the glow. */
export function seamCrackAsks(s: SeamState): boolean {
  const ask = seamLitStep(s)?.ask;
  return seamWantsShot(s) && (ask === "point" || ask === "glow");
}

/** Over everything: each mark's verdict — the rock's on the hull in its column, where it was falling to. */
export function drawSeamVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  c: Point,
  v: GripVerdicts,
): void {
  const crack = v.at(SEAM_CRACK_MARK);
  if (crack !== null) {
    const at = seamCrackCircle(l, s, c);
    drawVerdictRing(ctx, at.x, at.y, at.r, crack);
  }
  const grit = v.at(SEAM_GRIT_MARK);
  if (grit !== null) {
    const at = seamGritCircle(l, world.cfg);
    drawVerdictRing(ctx, at.x, at.y, at.r, grit);
  }
  const rock = v.at(SEAM_ROCK_MARK);
  const step = s.phase === "lit" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
  if (rock !== null && step !== undefined) {
    const r = seamRockCircle(l, { x: fieldX(l, seamStepCol(world, step)), y: l.hullY });
    drawVerdictRing(ctx, r.x, r.y, r.r, rock);
  }
}
