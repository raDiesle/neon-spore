import type { GuideScene } from "../scene-types.js";

/**
 * THE RATCHET's rehearsal: a press that is clean only while the other hand
 * holds.
 *
 * The rack hangs still for `ratchetStillBeats`, then the first pawl lights
 * (`sim/ratchet-step.ts`). The navigator carries the catch down past
 * `ratchetGripMilli` and keeps it there; the pilot presses on her word and
 * the rack climbs a clean tooth. The click spends her catch, so she lifts —
 * and **he presses the next tooth with nothing set**, which burns it: a
 * tooth gone for good with the rack no nearer the top, the one mistake the
 * fight can afford twice. Then she sets it again, and the film ends on the
 * catch held and the pawl waiting, which is the rhythm of every tooth after.
 *
 * It stops before the second clean tooth on purpose: that one shakes the
 * bolt loose (`ratchet-shot.ts`), which is an ordinary shot for the pair to
 * meet in the wave. Every act's distance is the handle's own — the catch's
 * whole reach and a press that reads none (`scene-drag.ts`) — and
 * `test/scene-ratchet.test.ts` holds the click and the burn to their beats.
 */
export const THE_RATCHET: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "ratchet" },
  acts: [
    { tick: 150, drag: "ratchetCatch", by: 210, until: 420 },
    { tick: 360, drag: "ratchetPawl", until: 390 },
    { tick: 600, drag: "ratchetPawl", until: 630 },
    { tick: 780, drag: "ratchetCatch", by: 840, until: 960 },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "HOLD THE CATCH · SAY SET",
      anchor: { at: "handle", target: "ratchetCatch" },
    },
    {
      tick: 270,
      seat: 1,
      text: "PRESS ONLY ON SET",
      anchor: { at: "handle", target: "ratchetPawl" },
    },
    {
      tick: 480,
      seat: 1,
      text: "NOT SET · THE TOOTH IS LOST",
      anchor: { at: "handle", target: "ratchetPawl" },
    },
    {
      tick: 690,
      seat: 2,
      text: "LIFT, THEN SET EVERY TOOTH",
      anchor: { at: "handle", target: "ratchetCatch" },
    },
  ],
};
