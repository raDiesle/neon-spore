import {
  BEARING_TURN,
  type DragTarget,
  NO_BEARING,
  orreryTurnPerTickMilli,
  type SceneCommand,
  type SimConfig,
  windPerTickMilli,
} from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";

/**
 * **A hand that turns rather than carries**, and there are two of them: THE
 * CLAW's crank on the panel, and THE ORRERY's ring on the field.
 *
 * Cut off `scene-drag.ts` when the ring's own stream would have taken that file
 * over its 250-line limit, along the seam its heading already drew: next door
 * is a hand *carried* somewhere, which is a displacement and a distance it
 * stops at, and everything here is a hand going round a circle, which is a
 * **bearing** and has no destination at all (`sim/bearing.ts`).
 *
 * A film has no finger, so the rehearsal turns on the ghost hand's behalf: the
 * grab, a bearing every few ticks, and the hand coming off. **The rate is asked
 * for in every case and chosen in none** — `windPerTickMilli` for the crank,
 * which is the speed the arm used to come home under its own power, and
 * `orreryTurnPerTickMilli` for the ring, which is one organ a beat and is the
 * ring's own drift. The desk keyboard and `bun run frames` ask the same two
 * functions (`packages/sim/test/copies-table.ts` carries the row), so all three
 * rigs turn a thing at the rate the picture is already going at.
 */

/**
 * How often a film reports where the hand has got to, in ticks.
 *
 * Few enough that one sample is nowhere near the half turn either ratchet reads
 * as a hand jumping backwards (`sim/bearing.ts`), and enough of them that what
 * is turning comes round smoothly rather than in steps a pair can count.
 */
const SAMPLE_TICKS = 6;

/**
 * The stream itself, and the only thing either caller below adds to it is
 * *which* circle and how fast.
 *
 * The bearings start from nought, exactly as the keyboard's and the frame
 * tool's do, because the grab reports `NO_BEARING` and the reference is the
 * last bearing *this* hand gave: a hand that pretended to start at the top of
 * the circle would turn by up to half a lap that no finger ever travelled.
 */
function turning(
  target: DragTarget,
  player: 1 | 2,
  from: number,
  until: number,
  perTickMilli: number,
  way: -1 | 1,
): SceneCommand[] {
  const grab = { kind: "drag", target, on: true, fromMilli: NO_BEARING } as const;
  const out: SceneCommand[] = [{ tick: from, player, command: grab }];
  const step = perTickMilli * SAMPLE_TICKS;
  let at = 0;
  for (let tick = from; tick <= until; tick += SAMPLE_TICKS) {
    out.push({ tick, player, command: { kind: "drag", target, on: true, fromMilli: at } });
    // Positive and inside one turn either way round: a bearing is where on the
    // circle the hand *is*, so a hand going the other way counts down through
    // the modulus rather than into negative numbers.
    at = (at + way * step + BEARING_TURN) % BEARING_TURN;
  }
  out.push({
    tick: until,
    player,
    command: { kind: "drag", target, on: false, fromMilli: NO_BEARING },
  });
  return out;
}

/**
 * THE CLAW's crank, wound for as long as the act lasts.
 *
 * It is authored as an ordinary press on the crank (`{ tick, control: "crank",
 * until }`) rather than as a `drag`, and that is deliberate: the ghost hand is
 * placed from `act.control` (`render/guide-thumb.ts`), so a film that authored
 * this as a handle would wind the arm home with no hand anywhere on the
 * screen — a page about a gesture, showing nobody making it.
 *
 * One way round only. Paying rope out is a thing the pair does and not a thing
 * a page about winding the arm home would show.
 */
export function crankCommands(act: SceneAct, player: 1 | 2, cfg: SimConfig): SceneCommand[] {
  const until = act.until ?? act.tick + SAMPLE_TICKS;
  return turning("crank", player, act.tick, until, windPerTickMilli(cfg), 1);
}

/**
 * THE ORRERY's ring, turned for as long as the act lasts.
 *
 * **Authored as the handle it is** — `{ tick, drag: "orreryRing", until }` —
 * which is the opposite of the crank's arrangement one function up, and for the
 * same reason: this hand belongs on the *field*, on the ring itself, and
 * `handleCircle` is what knows where round it the hand has got to
 * (`render/orrery-grab.ts`). A film that authored it as a control would have
 * nowhere to put the thumb.
 *
 * `act.dir` is which way round, the one field it borrows from a carry, because
 * on this control a direction is the whole of what a hand chooses: clockwise
 * always adds to the slot number, so on the outer ring a turn hurries the gap
 * along and on the middle one — which drifts the other way (`sim/orrery.ts`) —
 * the same turn fights the drift. Which of those a film is showing is the film's
 * to say. **Never a distance**: how far it goes is the act's own span times the
 * ring's rate, and a `toMilli` beside it would be a thousandth of a *tile* at a
 * control that reads thousandths of a turn.
 *
 * The seat is not authored, for `dragSeat`'s reason: the ring is the pilot's
 * every beat of the fight, and the simulation refuses any other seat's bearings
 * outright (`orreryRingHeard`).
 */
export function ringCommands(act: SceneAct, cfg: SimConfig): SceneCommand[] {
  const until = act.until ?? act.tick + SAMPLE_TICKS;
  return turning("orreryRing", 1, act.tick, until, orreryTurnPerTickMilli(cfg), act.dir ?? 1);
}

/**
 * Whether this handle is **turned** rather than carried, which is the question
 * `scene-drag.ts` asks before it reaches for a distance.
 *
 * One target today. It is a predicate rather than a comparison at the call site
 * so the answer is written down once: a second handle that turns would
 * otherwise be a film sending y-displacements at a control reading angles,
 * which is exactly the defect this file was written to end (`docs/queue.md`,
 * 17 September 2026).
 */
export function turnsRound(target: DragTarget): boolean {
  return target === "orreryRing";
}
