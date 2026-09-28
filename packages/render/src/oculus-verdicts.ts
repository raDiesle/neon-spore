import {
  type OculusAsk,
  type OculusState,
  oculusCoreAsks,
  oculusHullAsks,
  oculusLeafAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { oculusSide } from "./oculus-grip.js";
import { oculusRadius, oculusSocketRadius } from "./oculus-shape.js";
import { oculusCorePose, oculusGaze, oculusGlare } from "./oculus-story.js";

/**
 * **THE OCULUS's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one lens
 * (`oculus-draw.ts`), so this is THE SINEW's case for the leaves and THE
 * PULSE's for the rest.
 *
 * Four marks. **The two halves of the lens** are each one seat's leaf — the
 * left the pilot's, the right the navigator's (`oculus-grip.ts`) — and a half
 * asks while a pair to hold is lit and that seat's thumb is not down
 * (`oculusLeafAsks`): the halo on the owner's screen, the partner's ring and
 * clock on the other's, so a thumb already down sees the one still missing.
 * **The core** asks for a shot while a fire step stands open
 * (`oculusCoreAsks`) and **the hull under the eye** for the shield through
 * the glare and the cannon up the look's column (`oculusHullAsks`); both are
 * either seat's, and wear the halo on both screens and nobody's clock.
 *
 * The verdicts are the lens's own words: a pair shut or resealed greens both
 * halves and a thumb slipping reddens its own seat's; a core hit greens the
 * core; the glare blocked and the look landed green the hull. A step let run
 * out — a pair springing open, a reseal swallowed, a shot or a shield missed
 * — reddens only what that step asked, which is remembered from its light.
 * **A leaf pressed by the wrong seat is not refused red**: the simulation
 * says nothing of it (`sim/oculus-hand.ts`), and nor does a wrong colour.
 *
 * Held in `OculusFx` (`oculus-fx.ts`). Everything here is in the lens's own
 * frame, as the drawer has it: translated to its centre, lifted and thudded.
 */
export const OCULUS_CORE_MARK = 0;
export const OCULUS_LEFT_MARK = 1;
export const OCULUS_RIGHT_MARK = 2;
export const OCULUS_HULL_MARK = 3;

const HALVES = [OCULUS_LEFT_MARK, OCULUS_RIGHT_MARK] as const;

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<OculusAsk, readonly number[]>> = {
  shut: HALVES,
  reseal: HALVES,
  fire: [OCULUS_CORE_MARK],
  glare: [OCULUS_HULL_MARK],
  look: [OCULUS_HULL_MARK],
  break: [],
};

/** Each word of the lens's that answers: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  oculusShut: HALVES,
  oculusReseal: HALVES,
  oculusHit: [OCULUS_CORE_MARK],
  oculusBlock: [OCULUS_HULL_MARK],
  oculusGlance: [OCULUS_HULL_MARK],
};

/** Each word of the lens's that says a step ran out. */
const LAPSES = new Set(["oculusSpring", "oculusSwallow", "oculusMiss"]);

export class OculusVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "oculusLight") this.owed = OWES[e.ask];
      else if (e.type === "oculusSlip")
        this.verdicts.mark(e.seat === 1 ? OCULUS_LEFT_MARK : OCULUS_RIGHT_MARK, false);
      else if (LAPSES.has(e.type)) {
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

/** Where each mark stands this frame, in the lens's frame; `hull` is the hull under the eye or up the look's column. */
function marksAt(
  l: Layout,
  cfg: SimConfig,
  s: OculusState,
  beat: number,
  beatPhase: number,
  hull: { x: number; y: number },
): Circle[] {
  const { rim } = oculusRadius(l);
  const core = oculusCorePose(
    l,
    oculusGaze(s, cfg, beat, beatPhase),
    oculusGlare(s, cfg, beat, beatPhase),
  );
  const half = (seat: 1 | 2): Circle => ({ x: (oculusSide(seat) * rim) / 2, y: 0, r: rim / 2 });
  return [
    { x: core.x, y: core.y, r: oculusSocketRadius(l) * core.scale },
    half(1),
    half(2),
    { x: hull.x, y: hull.y, r: l.tile * 0.5 },
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: OculusState, mark: number): "own" | "theirs" | null {
  if (mark === OCULUS_CORE_MARK) return oculusCoreAsks(s) ? "own" : null;
  if (mark === OCULUS_HULL_MARK) return oculusHullAsks(s) ? "own" : null;
  const seat = mark === OCULUS_LEFT_MARK ? 1 : 2;
  if (!oculusLeafAsks(s, seat)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the lens: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawOculusMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: OculusState,
  beat: number,
  beatPhase: number,
  time: number,
  hull: { x: number; y: number },
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  marksAt(l, cfg, s, beat, beatPhase, hull).forEach((c, mark) => {
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
