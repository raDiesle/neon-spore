import {
  type SimEvent,
  VALVE_PINS,
  type ValveState,
  valveFrozen,
  valvePinAsks,
  valveWheelAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { pulled, valvePinReach } from "./valve-pose.js";
import { valvePinCentre, valveSocket, valveWheel } from "./valve-shape.js";

/**
 * **THE VALVE's wheel and pin answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — the whole convention, THE SINEW's
 * case, because both screens draw the one drum (`valve-draw.ts`). The marks
 * themselves are `valve-marks.ts`; this is what they say back.
 *
 * Whether a mark asks is the simulation's (`sim/valve.ts`): the wheel asks
 * the pilot while a mark is lit and the wheel is off it (`valveWheelAsks`);
 * the pin asks the navigator for the freeze, anybody for the pull, the cap
 * and the rub, and each thumb not yet on it through the brace and the seal
 * (`valvePinAsks`). **A mark that asks this screen's seat wears the halo; one
 * that asks only the partner's wears their ring and waiting clock** — so
 * while the wheel holds, the pilot sees the navigator's tap waited on, and
 * through the brace a thumb already down sees the one still missing.
 *
 * The verdicts are the drum's own words, each on the mark it names: the
 * wheel onto its mark greens the wheel and turned off it reddens it; every
 * step the pin answered — the freeze, the pull, the cap, the brace, the dry
 * face, the clean seal — greens the pin, and every window it let run out
 * reddens it. **The pilot's tap on the socket while the wheel holds is not
 * refused red**: the simulation says nothing of it (`sim/valve-hand.ts`).
 *
 * Held in `ValveFx` (`valve-fx.ts`). Everything here is in the drum's own
 * frame, as the drawer has it: translated to its centre and turned by the list.
 */
export const VALVE_WHEEL_MARK = 0;
export const VALVE_PIN_MARK = 1;

/** Each word of the drum's that is a verdict: the mark it lands on, and which way. */
const SAYS: Readonly<Record<string, readonly [number, boolean]>> = {
  valveHold: [VALVE_WHEEL_MARK, true],
  valveSlip: [VALVE_WHEEL_MARK, false],
  valveFreeze: [VALVE_PIN_MARK, true],
  valveLapse: [VALVE_PIN_MARK, false],
  valvePull: [VALVE_PIN_MARK, true],
  valveThaw: [VALVE_PIN_MARK, false],
  valveCap: [VALVE_PIN_MARK, true],
  valveBlow: [VALVE_PIN_MARK, false],
  valveBrace: [VALVE_PIN_MARK, true],
  valveShake: [VALVE_PIN_MARK, false],
  valveDry: [VALVE_PIN_MARK, true],
  valveSmear: [VALVE_PIN_MARK, false],
  valveSeal: [VALVE_PIN_MARK, true],
  valveRough: [VALVE_PIN_MARK, false],
};

export class ValveVerdicts {
  /** Was the last touch on the wheel, and on the pin, right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const said = SAYS[e.type];
      if (said !== undefined) this.verdicts.mark(said[0], said[1]);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The wheel's mark, in the drum's frame. */
function wheelAt(l: Layout): Circle {
  const { at, r } = valveWheel(l);
  return { x: at.x, y: at.y, r };
}

/** The pin's mark, in the drum's frame: the live plate while frozen, where the pull is drawn from, else the socket. */
export function valvePinMark(l: Layout, s: ValveState, beatPhase: number): Circle {
  const i = pulled(s);
  if (valveFrozen(s) && i < VALVE_PINS) {
    const pin = valvePinCentre(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase));
    return { x: pin.x, y: pin.y, r: pin.r };
  }
  const { at, r } = valveSocket(l);
  return { x: at.x, y: at.y, r: r * 1.2 };
}

/** What each mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: ValveState, mark: number): "own" | "theirs" | null {
  const asks = (seat: 1 | 2) =>
    mark === VALVE_WHEEL_MARK ? seat === 1 && valveWheelAsks(s) : valvePinAsks(s, seat);
  const me = seatOf(l.role);
  if (l.role === "test") return asks(1) || asks(2) ? "own" : null;
  if (asks(me)) return "own";
  return asks(me === 1 ? 2 : 1) ? "theirs" : null;
}

/** The halo under the live pin, drawn before the pins: only while frozen, since that is the one time it is the pin's plate. */
export function drawValvePinHalo(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  beatPhase: number,
  time: number,
): void {
  if (!valveFrozen(s) || asked(l, s, VALVE_PIN_MARK) !== "own") return;
  const c = valvePinMark(l, s, beatPhase);
  const fade = ctx.globalAlpha;
  drawMarkHalo(ctx, c.x, c.y, c.r, time);
  ctx.globalAlpha = fade;
}

/** The halos on the drum's face, under the wheel and the socket. */
export function drawValveHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  beatPhase: number,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  if (asked(l, s, VALVE_WHEEL_MARK) === "own") {
    const c = wheelAt(l);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
  }
  if (!valveFrozen(s) && asked(l, s, VALVE_PIN_MARK) === "own") {
    const c = valvePinMark(l, s, beatPhase);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
  }
  ctx.globalAlpha = fade;
}

/** Over the marks: the partner's ring and clock on each mark that asks only them, and both verdicts. */
export function drawValveVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  beatPhase: number,
  time: number,
  v: GripVerdicts,
): void {
  const at = [wheelAt(l), valvePinMark(l, s, beatPhase)];
  at.forEach((c, mark) => {
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
}
