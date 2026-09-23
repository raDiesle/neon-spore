import {
  type InstarMark,
  type InstarState,
  instarActing,
  instarHeld,
  instarMarkDone,
  instarStep,
  type SimConfig,
} from "@neon-spore/sim";
import { instarTogetherLeft } from "./instar-together.js";
import { drawInstarBanner } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { nowCall, PAIR_CALL_ABOVE_HULL_TILES, type PairCall, seatCalled } from "./pair-call.js";

/**
 * **The step's own call: who goes when, and how long they have.**
 *
 * The owner, 20 September 2026: *for any in-game action which requires one
 * player to hit a specific point in time related to the other player's
 * action, it should show text and visual for when is the right point in time
 * for the other player to act… it should be clear which player first needs
 * to pull in the first sequence and which is next, and what the time frame
 * is that both need to trigger. This is a generic rule for bosses with
 * choreographed state actions.*
 *
 * He had watched two poses and read an order into them that is not there,
 * which is the strongest possible argument that the rule needed saying. So
 * this line says the rule, in the rule's own words, and it is different for
 * the two kinds of pose the script actually contains:
 *
 * - **A pose of held gestures** — the two pulls of `gape` — has *no* order
 *   and no join at all. A pull is exempt from slipping (`instarHeld`), so
 *   each seat takes its own time and the step lands when the second one
 *   arrives. The line says so: *EITHER ORDER*.
 * - **A pose of counted gestures** — `armed`'s six taps against three
 *   swipes, `moulted`'s eight against a turn — is the one with a join, and
 *   the join is on the **finish**, not the start: both work the whole window
 *   and must *land* within `instarTogetherBeats` of each other. The line
 *   names the number.
 * - **One of them landed** and the clock is running: the line stops
 *   describing and starts calling — the seat still out, by name, and the
 *   beats it has left, counting down. That is the *point in time* he asked
 *   to be shown, and it is the only moment in the fight when there is one.
 *
 * **It is the same sentence on both screens**, and that is not an oversight:
 * `docs/decisions.md` #34 keeps a seat from being told its partner's own
 * instruction, and this line tells neither seat what to *do* — it says what
 * the pair is under. The verb stays on the ring, in the seat that owns it.
 *
 * Centred low on the glass, under both marks and over the hull, because it
 * belongs to the step and not to either ring (`instar-word.ts`'s banner).
 * **The other bosses with a second seat on the first one's clock say it in
 * the same place and the same words** (`pair-call.ts`), so a pair who has
 * learned the line once reads it everywhere.
 */

function seatName(mark: InstarMark): string {
  if (mark.seat === "both") return "BOTH";
  return seatCalled(mark.seat === "p1" ? 1 : 2);
}

export type InstarCall = PairCall;

/**
 * The line for the step as it stands, or `null` where there is nothing for a
 * pair to coordinate — a morph, a landing, or a pose of one mark, which is
 * one seat's alone and has nobody to be in time with.
 */
export function instarCall(
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): InstarCall | null {
  const step = instarStep(s);
  if (step === null || !instarActing(s) || step.marks.length < 2) return null;
  const waiting = step.marks.findIndex(
    (_, i) => instarTogetherLeft(s, cfg, i, beat, beatPhase) !== null,
  );
  if (waiting !== -1) {
    const open = step.marks.findIndex((_, i) => !instarMarkDone(s, i));
    const mark = step.marks[open];
    const left = instarTogetherLeft(s, cfg, waiting, beat, beatPhase) ?? 0;
    const who = mark === undefined ? "THE OTHER" : seatName(mark);
    // In whole beats, so the number an eye reads and the ring closing into
    // the answered mark run out together.
    return nowCall(who, left * (cfg.instarTogetherBeats + 1));
  }
  if (step.marks.every((m) => instarHeld(m.gesture))) {
    return { kind: "EITHER ORDER", word: "BOTH, BEFORE IT CLOSES" };
  }
  const n = cfg.instarTogetherBeats;
  return {
    kind: "FINISH TOGETHER",
    word: `WITHIN ${n} ${n === 1 ? "BEAT" : "BEATS"}`,
  };
}

export function drawInstarCall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): void {
  const call = instarCall(s, cfg, beat, beatPhase);
  if (call === null) return;
  // Bright on both screens, always: dim is the field's word for *not yours*
  // (`instar-marks.ts`), and this line is the pair's rather than either
  // seat's.
  drawInstarBanner(
    ctx,
    l,
    call.word,
    l.hullY - l.tile * PAIR_CALL_ABOVE_HULL_TILES,
    true,
    call.kind,
  );
}
