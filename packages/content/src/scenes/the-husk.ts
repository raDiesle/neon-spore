import type { GuideScene } from "../scene-types.js";

/**
 * THE HUSK's rehearsal: a mark drawn on one seat's screen and not the other's,
 * and a thumb that must not land.
 *
 * **Shot twice, read as one lesson.** Three pods hang at the start, two of
 * them hollow (`PodEntry.husk`, `sim/pod-types.ts`), and the navigator's
 * screen frames the hollow ones in white with the words on the frame
 * (`render/husk-mark.ts`) while the pilot's shows three pods alike. So the
 * first two pages are the same beat from each side: the navigator's, where
 * the framed one is named as hollow, and the pilot's, where nothing is
 * framed and the only thing to do is ask. The rehearsal draws every page on
 * the seat whose screen it is (`guide-scene.ts`), so the mark is on one page
 * and absent from the next without the film saying anything about it — the
 * absence is the picture.
 *
 * **The maw left shut is THE STARE's problem a second time**, and the answer
 * is the one THE STARE's film took: the other seat's page, and the cost last.
 * A page is a thumb landing on a named control, and half of this wave's
 * answer is a thumb that does *not* land. It is shown twice, both times
 * from the seat that owns the thumb, with something else for the hand to be
 * doing. First the real one, the fifth column: the navigator names it and
 * shoots it, the pilot opens the maw for it and it is taken, so the shot and
 * the intake are paired once the honest way. Then the framed one, the third
 * column: the navigator shoots it and says to leave it; the pilot's page
 * points at the intake control and the hand stays off it while the husk
 * comes down the beam — the maw shut, the husk deflating against it
 * (`husk-deflate.ts`), nothing lost.
 *
 * **And the cost, last.** The third pod, the first column, is hollow too,
 * and the navigator shoots it without naming it — the honest lapse the wave
 * is built to draw out — and the pilot, who saw a pod shot and opened the
 * maw for the last one that was, opens for this one. The husk is swallowed,
 * the wave with it (`huskSwallowed` → `failWave`), and the retries page says
 * what was let in. The film takes exactly the hit it points at.
 *
 * The framed one hangs first in the list so the `pod` anchor, which points at
 * the first pod on the field, points at the frame.
 */

export const THE_HUSK: GuideScene = {
  ticks: 2640,
  bpm: 120,
  seed: 1,
  pods: [
    { beat: 0, col: 3, row: 3, kind: "purge", husk: true },
    { beat: 0, col: 5, row: 4, kind: "ward" },
    { beat: 0, col: 1, row: 5, kind: "ward", husk: true },
  ],
  entries: [],
  acts: [
    { tick: 540, control: "cannon", col: 5 },
    { tick: 600, control: "fireRed" },
    { tick: 780, control: "intake" },
    { tick: 1260, control: "cannon", col: 3 },
    { tick: 1320, control: "fireRed" },
    { tick: 1980, control: "cannon", col: 1 },
    { tick: 2040, control: "fireRed" },
    { tick: 2200, control: "intake" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THE FRAMED ONE IS HOLLOW", anchor: { at: "pod" } },
    { tick: 240, seat: 1, text: "YOURS ARE ALIKE · ASK THEM", anchor: { at: "pod" } },
    {
      tick: 480,
      seat: 2,
      text: "SAY THE REAL ONE · FIVE",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 720,
      seat: 1,
      text: "OPEN FOR THE ONE THEY NAMED",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 1200,
      seat: 2,
      text: "SHOOT IT · THEN LEAVE IT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1440,
      seat: 1,
      text: "MAW SHUT · IT LETS GO",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 1920,
      seat: 2,
      text: "UNNAMED · SHOT ANYWAY",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 2160,
      seat: 1,
      text: "AND OPENED FOR IT",
      anchor: { at: "control", control: "intake" },
    },
    { tick: 2400, seat: 1, text: "A HUSK IN · THE WAVE WITH IT", anchor: { at: "hit" } },
  ],
};
