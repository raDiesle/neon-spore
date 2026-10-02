import {
  type GaugeState,
  gaugeRound,
  gaugeSeated,
  gaugeTongueAsks,
  gaugeToothAsks,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **THE GAUGE's hands**, in a file of their own — `boss-hands-rounds.ts` was
 * at its limit and this round now wants two hands rather than one.
 *
 * The second is the reason the split is worth having and not only the line
 * count. Every other hand in this tool **plays its round straight**: the
 * string pulled until the way in clicks, the shot up the lit column, the
 * valve turned toward the mark and the call when the needle sits between the
 * two. THE GAUGE's jam cannot be reached that way at all — it is what a
 * *wrong tooth* costs (`sim/gauge-tooth.ts`), so the only way to a picture of
 * it is a pair who got it wrong, on purpose, once.
 *
 * That is a fair thing for the sheet to show. The jam is not a failure state
 * the pair fell into; it is the round handing the pilot the needle itself
 * because his valve has just died, and the picture the reader is looking up is
 * the ring on the needle's tip. The bind next door needs no second hand: it
 * arrives from playing *well*, every `gaugeBindMarks` marks.
 */

type Press = Omit<TimedCommand, "tick">;

const valve = (dir: -1 | 1): Press => ({ player: 1, command: { kind: "valve", on: true, dir } });

/**
 * THE GAUGE: the pilot turns the valve toward the mark he cannot see, and
 * the navigator calls whenever the needle is seated between her marks
 * (`gaugeSeated`), in the wound's colour (`sim/gauge-call.ts`). Between the
 * first two levels she pulls each loose tooth in turn, once half the rest has
 * gone — the time it takes him to count the first out — so the loose tooth
 * stands long enough to be posed (`sim/gauge-tooth.ts`). After the next, the two of them
 * wring the tongue opposite ways on the same half-rest (`sim/gauge-tongue.ts`).
 */
export const gaugeHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  const out: Press[] = [];
  const want = g.needleMilli < g.markMilli ? 1 : -1;
  if (g.valve !== want) out.push(valve(want));
  if (gaugeSeated(w, g)) out.push({ player: 2, command: { kind: "call", color: g.woundColor } });
  if (pullsNow(w, g)) out.push(pull(g.looseTooth));
  if (twistsNow(w, g)) out.push(twist(1, 2000), twist(2, -2000));
  return out;
};

/** Whether the tooth is loose and half its rest has run. */
function pullsNow(w: World, g: GaugeState): boolean {
  return gaugeToothAsks(g) && (g.levelBeat - w.beat) * 2 <= w.cfg.gaugeToothBeats;
}

/** Whether the tongue is out and half its rest has run. */
function twistsNow(w: World, g: GaugeState): boolean {
  return gaugeTongueAsks(g) && (g.levelBeat - w.beat) * 2 <= w.cfg.gaugeTongueBeats;
}

/** One seat's hand on the tongue, dragged well past the twist one way. */
const twist = (player: 1 | 2, fromMilli: number): Press => ({
  player,
  command: { kind: "drag", target: "gaugeTongue", on: true, id: 0, fromMilli, fromYMilli: 0 },
});

/** Her hand on tooth `k`, dragged well past the pull in one press. */
const pull = (k: number): Press => ({
  player: 2,
  command: { kind: "drag", target: "gaugeTooth", on: true, id: k, fromMilli: 0, fromYMilli: 2000 },
});

/**
 * The one pull this tool makes that is meant to be wrong: the round played
 * straight to the loose tooth, and then she pulls its neighbour — the valve
 * sticks, and the round is in the jam.
 *
 * A wrong *call* was the way in until 2 October 2026; a miss opens the mouth
 * now and leaves the valve answering (`sim/gauge-gape.ts`), so a wrong tooth
 * is the nearest a hand can get to the jam (`sim/gauge-tooth.ts`).
 */
export const gaugeJamHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  if (!gaugeToothAsks(g)) return gaugeHand(w);
  return [pull(g.looseTooth === 1 ? 2 : g.looseTooth - 1)];
};
