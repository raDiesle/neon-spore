import type { Point } from "@neon-spore/content";
import { LAB_TILE } from "./pull-lab-shapes.js";
import {
  LAPSE,
  type LabRub,
  lift,
  move,
  partnerTurn,
  press,
  RUB_AT,
  type RubAsk,
  type RubSeats,
} from "./rub-lab-rule.js";

/**
 * **AUTO's finger in THE RUB LAB**, as `press-lab-auto.ts` is THE PRESS
 * LAB's: down on the mark and scrubbing it across, quick, until it is
 * counted; then, on a fresh mark, half of the turns and the finger left still
 * on it until the count lapses. On BOTH AT ONCE the other seat rubs with it
 * the first time, and comes in late the second, so the turns made alone pass
 * under the eye too. Over and over, with no mouse.
 */

/** Seconds a stroke takes, one way: four turns a second — an easy scrub. */
export const HALF = 0.25;
/** How far the finger scrubs either side of where it took the mark. */
const SWING = LAB_TILE * 0.55;
/** Seconds the call is shown before the finger comes down. */
const TAKE = 1.9;

/** One stretch of the finger: down from `at` to `until`, scrubbing while `scrub`. */
interface Stroke {
  at: number;
  until: number;
  /** Seconds from `at` that it scrubs; still after. */
  scrub: number;
}

/** Seconds the other seat comes in late the second time, on BOTH AT ONCE: the
 * finger's first two turns are made alone. */
const LATE = 0.35;

/** The loop for `ask`: the finger's strokes, the other seat's rubbing, its length. */
export function loopOf(ask: RubAsk, seats: RubSeats = "one") {
  const n = ask.turns;
  const first: Stroke = { at: TAKE, until: TAKE + (n + 1.5) * HALF, scrub: 99 };
  const second = first.until + 1.3;
  const half = Math.max(1, Math.floor(n / 2));
  // The turns made alone are made on top of the half that counts.
  const scrub = (half + 0.6) * HALF + (seats === "both" ? 2 * HALF : 0);
  const rest: Stroke = { at: second, until: second + scrub + LAPSE + 0.4, scrub };
  const end = rest.until + 0.8;
  // The other seat: with the finger the first time, late the next.
  const partner = [
    { at: TAKE - 0.2, until: first.until },
    { at: second + LATE, until: second + scrub },
  ];
  return { take: TAKE, first, second, half, rest, end, strokes: [first, rest], partner };
}

export interface AutoFinger {
  at: Point;
  down: boolean;
  /** Where it went down, for the drop to lean after. */
  grab: Point;
  /** The other seat is rubbing now (BOTH AT ONCE only). */
  partner: boolean;
}

/** Where the finger is `t` seconds into `ask`'s loop. */
export function autoFinger(ask: RubAsk, seats: RubSeats, t: number): AutoFinger {
  const loop = loopOf(ask, seats);
  const s = ((t % loop.end) + loop.end) % loop.end;
  const grab = { x: RUB_AT.x - 3, y: RUB_AT.y + 2 };
  const stroke = loop.strokes.find((k) => s >= k.at && s < k.until);
  const partner = seats === "both" && loop.partner.some((p) => s >= p.at && s < p.until);
  if (!stroke) return { at: grab, down: false, grab, partner };
  const u = Math.min(s - stroke.at, stroke.scrub);
  // Across, a little aslant, as a thumb scrubs.
  const x = SWING * Math.sin((Math.PI * u) / HALF);
  return { at: { x: grab.x + x, y: grab.y - 0.18 * x }, down: true, grab, partner };
}

/** The other seat when no AUTO is playing it: rubbing for most of every four
 * seconds, so a hand at the mouse has to catch it. */
export const handPartner = (t: number): boolean => t % 4 < 2.6;

/** What a driver carries from one step to the next. */
export interface Driving {
  down: boolean;
  /** Seconds the other seat has rubbed since its last turn. */
  partnerClock: number;
}

export const freshDriving = (): Driving => ({ down: false, partnerClock: 0 });

/** AUTO's finger and the other seat, `t` seconds into the loop, driving the rule
 * exactly as a mouse would — the live lab and the sheet alike. */
export function stepAuto(
  h: LabRub,
  ask: RubAsk,
  seats: RubSeats,
  t: number,
  dt: number,
  d: Driving,
): void {
  const f = autoFinger(ask, seats, t);
  if (f.down && !d.down) press(h, f.at);
  if (f.down) move(h, ask, seats, f.at, f.grab);
  if (!f.down && d.down) lift(h);
  d.down = f.down;
  stepPartner(h, f.partner, dt, d);
}

/** The other seat, rubbing or not: a turn every `HALF` while it rubs. */
export function stepPartner(h: LabRub, rubbing: boolean, dt: number, d: Driving): void {
  if (!rubbing) {
    d.partnerClock = 0;
    return;
  }
  d.partnerClock += dt;
  if (d.partnerClock < HALF) return;
  d.partnerClock -= HALF;
  partnerTurn(h);
}
