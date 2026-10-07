import {
  midCol,
  type SimEvent,
  type ViseAsk,
  type ViseState,
  viseBiting,
  viseKernelAsks,
  viseLobeAsks,
  viseSeedAsks,
  viseSeedCol,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { viseSide } from "./vise-grip.js";
import { viseCentre, viseKernel, viseRadius } from "./vise-shape.js";
import { viseSeedAt, viseSpit } from "./vise-story.js";
import { viseSwing, viseSwung } from "./vise-sway.js";

/**
 * **THE VISE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one case
 * (`vise-draw.ts`), so this is THE OCULUS's arrangement again.
 *
 * Five marks. **The two lobes** are each one seat's — the left the pilot's,
 * the right the navigator's (`vise-grip.ts`) — and a lobe asks while a pinch
 * step naming it is lit and its gap is not yet shut (`viseLobeAsks`): the
 * halo on the owner's screen, the partner's ring and clock on the other's, so
 * a seat already pinching sees the one still open. **The kernel** asks for a
 * shot while a fire step stands with it bare (`viseKernelAsks`), **the hull
 * under the case** for the shield through the bite (`viseBiting`), and **the
 * spat seed** for a shot up its column (`viseSeedAsks`); those three are
 * either seat's, and wear the halo on both screens and nobody's clock.
 *
 * The verdicts are the case's own words: a seam cracked greens its lobe and a
 * brace greens both; a pinch slipping open reddens its own lobe; a kernel hit,
 * the bite blocked and the seed burst green their marks. A step let run out —
 * a lobe springing, the cover closing, a shot or a shield missed — reddens
 * only what that step asked, remembered from its light. **A lobe pinched by
 * the wrong seat is not refused red**: the simulation says nothing of it
 * (`sim/vise-hand.ts`), and nor does a wrong colour.
 *
 * Held in `ViseFx` (`vise-fx.ts`). Everything here is in the case's own frame,
 * as the drawer has it: translated to its middle, dropped, thudded and lunged.
 */
export const VISE_KERNEL_MARK = 0;
export const VISE_LEFT_MARK = 1;
export const VISE_RIGHT_MARK = 2;
export const VISE_HULL_MARK = 3;
export const VISE_SEED_MARK = 4;

const LOBES = [VISE_LEFT_MARK, VISE_RIGHT_MARK] as const;
const lobeMark = (side: 0 | 1) => LOBES[side];

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<ViseAsk, readonly number[]>> = {
  left: [VISE_LEFT_MARK],
  right: [VISE_RIGHT_MARK],
  both: LOBES,
  fire: [VISE_KERNEL_MARK],
  bite: [VISE_HULL_MARK],
  spit: [VISE_SEED_MARK],
};

/** Each word of the case's that answers, but a crack: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  viseBrace: LOBES,
  viseHit: [VISE_KERNEL_MARK],
  viseBlock: [VISE_HULL_MARK],
  viseSeedBurst: [VISE_SEED_MARK],
};

/** Each word of the case's that says a step ran out. */
const LAPSES = new Set(["viseSpring", "viseCover", "viseMiss"]);

export class ViseVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "viseLight") this.owed = OWES[e.ask];
      else if (e.type === "viseSlip") this.verdicts.mark(lobeMark(e.side), false);
      else if (e.type === "viseCrack") {
        this.verdicts.mark(lobeMark(e.side), true);
        this.owed = [];
      } else if (LAPSES.has(e.type)) {
        for (const k of this.owed) this.verdicts.mark(k, false);
        this.owed = [];
      } else {
        const said = ANSWERS[e.type];
        if (said === undefined) continue;
        for (const k of said) this.verdicts.mark(k, true);
        this.owed = [];
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
}

/** Where each mark stands this frame, in the case's frame; `toHull` is how far below it the hull is. */
function marksAt(
  l: Layout,
  world: World,
  s: ViseState,
  beat: number,
  beatPhase: number,
  toHull: number,
): Circle[] {
  const { cfg } = world;
  const { rx } = viseRadius(l);
  // The lobes' marks ride the case's swing, as their hit test does (`viseLobeCircle`).
  const swing = viseSwing(cfg, s, beat, beatPhase, world);
  const lobe = (seat: 1 | 2): Circle =>
    viseSwung(l, { x: (viseSide(seat) * rx) / 2, y: 0, r: rx / 2 }, swing);
  // The seed of the step lit, or of the one just past, as the drawer hangs it.
  const spat = s.phase === "lit" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
  const seedX =
    spat === undefined ? 0 : fieldX(l, viseSeedCol(midCol(cfg), spat)) - viseCentre(l, cfg).x;
  return [
    viseKernel(l),
    lobe(1),
    lobe(2),
    { x: 0, y: toHull, r: l.tile * 0.5 },
    viseSeedAt(l, viseSpit(s, cfg, beat, beatPhase), seedX),
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, world: World, s: ViseState, mark: number): "own" | "theirs" | null {
  if (mark === VISE_KERNEL_MARK) return viseKernelAsks(s) ? "own" : null;
  if (mark === VISE_HULL_MARK) return viseBiting(s) ? "own" : null;
  if (mark === VISE_SEED_MARK) return viseSeedAsks(s) ? "own" : null;
  const seat = mark === VISE_LEFT_MARK ? 1 : 2;
  if (!viseLobeAsks(world, s, seat === 1 ? 0 : 1)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the case: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawViseMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ViseState,
  beat: number,
  beatPhase: number,
  time: number,
  toHull: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  marksAt(l, world, s, beat, beatPhase, toHull).forEach((c, mark) => {
    const says = asked(l, world, s, mark);
    if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = fade;
}
