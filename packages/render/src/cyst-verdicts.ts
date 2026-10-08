import {
  type CystAsk,
  type CystState,
  cystBudAsks,
  cystCoreAsks,
  cystFlankAsks,
  cystFreezer,
  cystLitStep,
  cystMarkAsks,
  cystPincher,
  cystSide,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import { cystCoreR, cystMarkAt, cystR } from "./cyst-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { drawMarkHeld, drawMarkProgress, MARK_PROGRESS_R } from "./mark-progress.js";

/**
 * **THE CYST's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one sac
 * (`cyst-draw.ts`), so this is THE GRINDSTONE's arrangement again.
 *
 * Six marks. **The two freeze marks and the two flanks** are each one seat's,
 * and on each side the two belong to different seats (`sim/cyst-hand.ts`):
 * the pilot pinches the left flank and taps the right mark, the navigator the
 * other way about. A freeze mark asks while its flank's step is lit and not
 * yet stilled (`cystMarkAsks`); a flank while it is stilled, or on a swell,
 * and not yet pinched shut (`cystFlankAsks`) — the halo on the owner's
 * screen, the partner's ring and clock on the other's, so a seat already
 * holding its flank on a swell sees the other still waited on. **The core**
 * asks for a shot while a fire step is lit with it bare (`cystCoreAsks`), and
 * **the bud** while a bud step is lit (`cystBudAsks`); each is either seat's,
 * and wears the halo on both screens and nobody's clock.
 *
 * The verdicts are the sac's own words: a tap that stills greens its mark, a
 * crack or a guard greens its flank, a swell clenched greens both, a core
 * hit greens the core and a bud shot greens the bud. A flank never tapped
 * still reddens its mark; a pinch that slips or a stilled flank let spring
 * reddens its flank; a shot, a swell or a bud let run out reddens what that
 * step asked, remembered from its light. **The spit has no mark here** — it is
 * the shield's, under its column — and **neither a wrong seat's touch nor a
 * wrong colour is refused red**: the simulation says nothing of either
 * (`sim/cyst-hand.ts`, `sim/cyst-shot.ts`).
 *
 * **A part held right says so, and the pinch says how far** (the owner, 7
 * October 2026, THE CAPSTAN's rule, `mark-progress.ts`): a freeze mark whose
 * flank it has stilled, and a flank pinched shut, wear the steady green ring
 * on both screens for as long as they stay so; and the flank being kept shut
 * carries the beats it has been, out of the step's own, as segments round it
 * — both flanks on a swell — so the seat that tapped sees the partner still
 * at it, and how far.
 *
 * Held in `CystFx` (`cyst-fx.ts`). Everything here is in the sac's frame, as
 * the drawer has it: translated to its middle, thudded and shaken.
 */
export const CYST_CORE_MARK = 0;
export const CYST_BUD_MARK = 1;
export const CYST_LEFT_FREEZE_MARK = 2;
export const CYST_RIGHT_FREEZE_MARK = 3;
export const CYST_LEFT_FLANK_MARK = 4;
export const CYST_RIGHT_FLANK_MARK = 5;

const FREEZES = [CYST_LEFT_FREEZE_MARK, CYST_RIGHT_FREEZE_MARK] as const;
const FLANKS = [CYST_LEFT_FLANK_MARK, CYST_RIGHT_FLANK_MARK] as const;

/**
 * What each step reddens if it runs out with `cystMiss`. A flank step's
 * lapses say their side (`cystShudder`, `cystSpring`); a spit is the shield's.
 */
const OWES: Readonly<Record<CystAsk, readonly number[]>> = {
  left: [],
  right: [],
  fire: [CYST_CORE_MARK],
  swell: FLANKS,
  spit: [],
  bud: [CYST_BUD_MARK],
};

/** Each word of the sac's that answers, but one about a side: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  cystHit: [CYST_CORE_MARK],
  cystPop: [CYST_BUD_MARK],
  cystClench: FLANKS,
};

export class CystVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "cystLight") this.owed = OWES[e.ask];
      else if (e.type === "cystStill") this.verdicts.mark(FREEZES[e.side], true);
      else if (e.type === "cystShudder") this.verdicts.mark(FREEZES[e.side], false);
      else if (e.type === "cystSlip" || e.type === "cystSpring") {
        this.verdicts.mark(FLANKS[e.side], false);
      } else if (e.type === "cystCrack" || e.type === "cystGuard") {
        this.verdicts.mark(FLANKS[e.side], true);
        this.owed = [];
      } else if (e.type === "cystMiss") {
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

/** The core, the bud where it hangs (or nowhere), the two freeze marks and the two flanks. */
function marksAt(l: Layout, bud: Circle | null): (Circle | null)[] {
  const r = cystR(l);
  const flank = (side: 0 | 1): Circle => ({ x: (side === 0 ? -1 : 1) * r * 0.75, y: 0, r: r / 2 });
  return [
    { x: 0, y: 0, r: cystCoreR(l) },
    bud,
    cystMarkAt(l, 0),
    cystMarkAt(l, 1),
    flank(0),
    flank(1),
  ];
}

/** Whether a mark is held where it is wanted: a freeze mark its flank stilled, a flank pinched shut on its step. */
export function cystMarkHeld(world: World, s: CystState, mark: number): boolean {
  const side = mark === CYST_LEFT_FREEZE_MARK || mark === CYST_LEFT_FLANK_MARK ? 0 : 1;
  const frozen = s.phase === "frozen" && cystSide(s) === side;
  if (mark === CYST_LEFT_FREEZE_MARK || mark === CYST_RIGHT_FREEZE_MARK) return frozen;
  if (mark !== CYST_LEFT_FLANK_MARK && mark !== CYST_RIGHT_FLANK_MARK) return false;
  const swell = s.phase === "lit" && cystLitStep(s)?.ask === "swell";
  return (frozen || swell) && s.gapMilli[side] <= world.cfg.cystShutMilli;
}

/**
 * How far the pinch has got, in beats kept shut out of the step's, and the
 * flanks that wear it: the stilled one, or both on a swell. Null otherwise.
 */
export function cystPinchCount(
  s: CystState,
): { share: number; segments: number; flanks: readonly number[] } | null {
  const step = cystLitStep(s);
  if (step === null || step.beats <= 0) return null;
  const side = cystSide(s);
  const flanks =
    s.phase === "frozen" && side !== null
      ? [FLANKS[side]]
      : s.phase === "lit" && step.ask === "swell"
        ? FLANKS
        : null;
  if (flanks === null) return null;
  return { share: s.heldBeats / step.beats, segments: step.beats, flanks };
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, world: World, s: CystState, mark: number): "own" | "theirs" | null {
  if (mark === CYST_CORE_MARK) return cystCoreAsks(s) ? "own" : null;
  if (mark === CYST_BUD_MARK) return cystBudAsks(s) ? "own" : null;
  const freeze = mark === CYST_LEFT_FREEZE_MARK || mark === CYST_RIGHT_FREEZE_MARK;
  const side = mark === CYST_LEFT_FREEZE_MARK || mark === CYST_LEFT_FLANK_MARK ? 0 : 1;
  if (!(freeze ? cystMarkAsks(s, side) : cystFlankAsks(world, s, side))) return null;
  const seat = freeze ? cystFreezer(side) : cystPincher(side);
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the sac: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 * `bud` is where the bud hangs this frame, or null with none out.
 */
export function drawCystMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: CystState,
  time: number,
  bud: Circle | null,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  const pinch = cystPinchCount(s);
  marksAt(l, bud).forEach((c, mark) => {
    if (c === null) return;
    const says = asked(l, world, s, mark);
    if (cystMarkHeld(world, s, mark)) drawMarkHeld(ctx, c.x, c.y, c.r, time);
    else if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    ctx.globalAlpha = fade;
    if (pinch?.flanks.includes(mark)) {
      drawMarkProgress(ctx, c.x, c.y, c.r * MARK_PROGRESS_R, pinch.share, pinch.segments);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = fade;
}
