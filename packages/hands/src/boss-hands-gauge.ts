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
 * **THE GAUGE's hand**, in a file of its own — `boss-hands-rounds.ts` was at
 * its limit. It plays the round straight, as every other hand in this tool
 * does. A second hand once pulled the wrong tooth on purpose, to reach the
 * jam; the jam went on 2 October 2026, when a mistake began to lose the round
 * instead (`sim/gauge-tooth.ts`), and the hand went with it.
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
