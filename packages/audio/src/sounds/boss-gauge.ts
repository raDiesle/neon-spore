/**
 * THE GAUGE's five, in a file of their own for `boss-pulse-hand.ts`'s reason:
 * the round had no sounds of its own until 19 September 2026, because nothing
 * about it happened that was not a state already drawn on one screen or the
 * other (`docs/queue.md`, *THE GAUGE is the only boss with no events and no
 * sound*). A mark and a miss are the call's two answers, told apart by shape
 * rather than pitch — one settling, one falling away. A bind is what a
 * mark can cost, and a fact about the *other* seat's half of the machine: the
 * navigator's band winding tight. A jam once stood beside it, for the pilot's
 * valve seizing; it went on 2 October 2026, when a miss began to lose the
 * round. The pull, added 30 September 2026, is the loose tooth
 * between two levels coming out: a wet pop, and a low knock behind it.
 */

import { after, air, glint, metal, soft, sub } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GAUGE_SOUNDS: SoundDef[] = [
  {
    id: "boss.gaugeMark",
    family: "boss",
    blurb: "A call landing on the mark: one bright pip, and a low settle under it.",
    status: "bound",
    use: "THE GAUGE: a call that lands between the two marks.",
    level: 0.34,
    layers: [glint(6000, 0.05, 0.4), after(0.02, sub(92, 0.22, 0.34))],
  },
  {
    id: "boss.gaugeMiss",
    family: "boss",
    blurb: "A call landing wrong: a low tone falling away, and a thin fizzle over it.",
    status: "bound",
    use: "THE GAUGE: a call that missed, or a tooth pulled wrong — and the round is lost.",
    level: 0.32,
    layers: [
      { source: "triangle", freq: 190, toFreq: 68, gain: 0.26, attack: 0.01, release: 0.24 },
      after(0.03, soft(0.45, air(5200, 3400, 0.3, 0.07, 1.3))),
    ],
  },
  {
    id: "boss.gaugeBind",
    family: "boss",
    blurb: "A band winding tight: tension climbing to a stop, iron under it.",
    status: "bound",
    use: "THE GAUGE: the mark beside this one wound the band — she cannot call while it is down.",
    level: 0.34,
    layers: [
      { source: "triangle", freq: 58, toFreq: 130, gain: 0.22, attack: 0.03, release: 0.28 },
      after(0.18, metal(78, 0.26, 0.28, 210)),
    ],
  },
  {
    id: "boss.gaugePull",
    family: "boss",
    blurb: "A tooth pulled: a wet pop out of its socket, and a low knock behind it.",
    status: "bound",
    use: "THE GAUGE: the loose tooth pulled between two levels — the right one.",
    level: 0.34,
    layers: [
      { source: "sine", freq: 420, toFreq: 160, gain: 0.24, attack: 0.004, release: 0.12 },
      after(0.01, soft(0.4, air(2600, 1400, 0.2, 0.05, 0.9))),
      after(0.05, sub(74, 0.18, 0.3)),
    ],
  },
  {
    id: "boss.gaugeTwist",
    family: "boss",
    blurb: "A tongue wrung: a wet creak winding up, and a slap as it lets go.",
    status: "bound",
    use: "THE GAUGE: the tongue twisted by both hands at once, after the second level.",
    level: 0.34,
    layers: [
      { source: "triangle", freq: 90, toFreq: 240, gain: 0.2, attack: 0.02, release: 0.22 },
      after(0.16, soft(0.5, air(1800, 900, 0.16, 0.04, 0.8))),
      after(0.2, sub(66, 0.16, 0.3)),
    ],
  },
];
