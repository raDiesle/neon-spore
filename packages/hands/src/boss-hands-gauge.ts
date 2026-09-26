import { gaugeRound, gaugeSeated, type TimedCommand } from "@neon-spore/sim";
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
 * *missed* call costs (`sim/gauge.ts`), so the only way to a picture of it is
 * a pair who got it wrong, on purpose, once.
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
 * (`gaugeSeated`). A call wide of the band costs a rest and nothing else.
 */
export const gaugeHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  const out: Press[] = [];
  const want = g.needleMilli < g.markMilli ? 1 : -1;
  if (g.valve !== want) out.push(valve(want));
  if (gaugeSeated(w, g)) out.push({ player: 2, command: { kind: "call" } });
  return out;
};

/**
 * The one call this tool makes that is meant to be wrong: she calls while the
 * needle is wide of the band, the valve sticks, and the round is in the jam.
 *
 * The band is drawn well clear of the needle (`drawBand`), so on the first
 * tick of `play` it is already a miss and the hand is done. The turn in the
 * other branch is for the tick it is not — the band walks, and a needle it has
 * walked onto would take the call as a *mark*. Turning away from it rather
 * than waiting keeps the hand honest about which of the two happened.
 */
export const gaugeJamHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  if (!gaugeSeated(w, g)) return [{ player: 2, command: { kind: "call" } }];
  const away = g.needleMilli < g.markMilli ? -1 : 1;
  return g.valve === away ? [] : [valve(away)];
};
