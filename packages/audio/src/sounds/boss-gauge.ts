/**
 * THE GAUGE's four, in a file of their own for `boss-pulse-hand.ts`'s reason:
 * the round had no sounds of its own until 19 September 2026, because nothing
 * about it happened that was not a state already drawn on one screen or the
 * other (`docs/queue.md`, *THE GAUGE is the only boss with no events and no
 * sound*). A mark and a miss are the call's two answers, told apart by shape
 * rather than pitch — one settling, one falling away. A jam and a bind are
 * what a miss and a mark can cost, and each is a fact about the *other*
 * seat's half of the machine: the pilot's valve seizing, the navigator's band
 * winding tight.
 */

import { after, air, glint, metal, noise, soft, sub } from "../grain.js";
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
    use: "THE GAUGE: a call that missed — free the first time, and the valve sticks beside it.",
    level: 0.32,
    layers: [
      { source: "triangle", freq: 190, toFreq: 68, gain: 0.26, attack: 0.01, release: 0.24 },
      after(0.03, soft(0.45, air(5200, 3400, 0.3, 0.07, 1.3))),
    ],
  },
  {
    id: "boss.gaugeJam",
    family: "boss",
    blurb: "A valve seizing: one dull catch, and a thin metal scrape over the top of it.",
    status: "bound",
    use: "THE GAUGE: the miss beside this one stuck the valve — the needle is his hand now.",
    level: 0.36,
    layers: [
      metal(70, 0.28, 0.34, 200),
      after(0.02, noise(3600, { type: "highpass", freq: 3600, q: 0.8 }, 0.002, 0.05, 0.16)),
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
];
