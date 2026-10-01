import {
  type GrindstoneAsk,
  type GrindstoneState,
  grindstoneAxleAsks,
  grindstoneFlatAsks,
  grindstoneJawAsks,
  type SimEvent,
} from "@neon-spore/sim";
import {
  grindstoneAxleR,
  grindstoneBolt,
  grindstoneJawTurn,
  grindstonePadAt,
  grindstonePadR,
  turnedAbout,
} from "./grindstone-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE GRINDSTONE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one wheel
 * (`grindstone-draw.ts`), so this is THE VISE's arrangement again.
 *
 * Five marks. **The two flats and the two jaws** are each one seat's — the
 * left the pilot's, the right the navigator's (`sim/grindstone-hand.ts`). A
 * flat asks while a pass is lit on it (`grindstoneFlatAsks`), and a jaw while
 * a clamp is lit and it is not yet held shut (`grindstoneJawAsks`): the halo
 * on the owner's screen, the partner's ring and clock on the other's, so a
 * seat already holding its jaw sees the other still waited on. **The axle**
 * asks for a shot while a fire step stands with the caliper locked
 * (`grindstoneAxleAsks`); it is either seat's, and wears the halo on both
 * screens and nobody's clock.
 *
 * The verdicts are the wheel's own words: a pass ground clean greens its
 * flat, a clamp held greens both jaws, an axle hit greens the axle. A pad
 * lifted off a held clamp reddens its own jaw, and a grind or a pad through
 * the fade reddens both of that seat's marks, since the simulation does not
 * say which it was. A step let run out — a flat gritted over again, the
 * caliper sprung, a shot missed — reddens only what that step asked,
 * remembered from its light. **A flat or a jaw worked by the wrong seat is not
 * refused red**: the simulation says nothing of it (`sim/grindstone-hand.ts`),
 * and nor does a wrong colour.
 *
 * Held in `GrindstoneFx` (`grindstone-fx.ts`). Everything here is in the
 * axle's frame, as the drawer has it: translated to the axle, thudded and
 * shaken, and not yet turned edge-on.
 */
export const GRINDSTONE_AXLE_MARK = 0;
export const GRINDSTONE_LEFT_FLAT_MARK = 1;
export const GRINDSTONE_RIGHT_FLAT_MARK = 2;
export const GRINDSTONE_LEFT_JAW_MARK = 3;
export const GRINDSTONE_RIGHT_JAW_MARK = 4;

const FLATS = [GRINDSTONE_LEFT_FLAT_MARK, GRINDSTONE_RIGHT_FLAT_MARK] as const;
const JAWS = [GRINDSTONE_LEFT_JAW_MARK, GRINDSTONE_RIGHT_JAW_MARK] as const;

/** A flat's mark round the middle of its face, in tiles. */
const FLAT_R = 0.6;

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<GrindstoneAsk, readonly number[]>> = {
  left: [GRINDSTONE_LEFT_FLAT_MARK],
  right: [GRINDSTONE_RIGHT_FLAT_MARK],
  clamp: JAWS,
  fire: [GRINDSTONE_AXLE_MARK],
};

/** Each word of the wheel's that answers, but a pass: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  grindstoneClamp: JAWS,
  grindstoneHit: [GRINDSTONE_AXLE_MARK],
};

/** Each word of the wheel's that says a step ran out. */
const LAPSES = new Set(["grindstoneRegrit", "grindstoneLoose", "grindstoneMiss"]);

export class GrindstoneVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "grindstoneLight") this.owed = OWES[e.ask];
      else if (e.type === "grindstoneSlip") this.verdicts.mark(JAWS[e.side], false);
      else if (e.type === "grindstoneJar") {
        this.verdicts.mark(FLATS[e.side], false);
        this.verdicts.mark(JAWS[e.side], false);
      } else if (e.type === "grindstoneClear") {
        this.verdicts.mark(FLATS[e.side], true);
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

/** The axle, the two flats cut `cuts` deep and the two jaws `shut` of the way, as the drawer puts them. */
function marksAt(l: Layout, cuts: readonly [number, number], shut: number): Circle[] {
  const flatR = FLAT_R * l.tile;
  const bolt = grindstoneBolt(l, shut);
  const jaw = (side: 0 | 1): Circle => {
    const turn = grindstoneJawTurn(side, shut);
    const pad = (k: 0 | 1) => turnedAbout(grindstonePadAt(l, side, k, shut), bolt, turn);
    const [a, b] = [pad(0), pad(1)];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: grindstonePadR(l) * 2 };
  };
  return [
    { x: 0, y: 0, r: grindstoneAxleR(l) },
    { x: -cuts[0], y: 0, r: flatR },
    { x: cuts[1], y: 0, r: flatR },
    jaw(0),
    jaw(1),
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: GrindstoneState, mark: number): "own" | "theirs" | null {
  if (mark === GRINDSTONE_AXLE_MARK) return grindstoneAxleAsks(s) ? "own" : null;
  const flat = mark === GRINDSTONE_LEFT_FLAT_MARK || mark === GRINDSTONE_RIGHT_FLAT_MARK;
  const side = mark === GRINDSTONE_LEFT_FLAT_MARK || mark === GRINDSTONE_LEFT_JAW_MARK ? 0 : 1;
  if (!(flat ? grindstoneFlatAsks(s, side) : grindstoneJawAsks(s, side))) return null;
  return l.role === "test" || seatOf(l.role) === side + 1 ? "own" : "theirs";
}

/**
 * Over the wheel: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawGrindstoneMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GrindstoneState,
  time: number,
  cuts: readonly [number, number],
  shut: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  marksAt(l, cuts, shut).forEach((c, mark) => {
    const says = asked(l, s, mark);
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
