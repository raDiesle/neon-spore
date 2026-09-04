import type { GuideScene } from "../scene-types.js";

/**
 * THE PURGE's rehearsal: the field is cleared by swallowing, not by shooting.
 *
 * The same pod as SALVAGE with different cargo, and the whole wave is *when*
 * rather than *what*. Taking one in sweeps everything that is falling — so a
 * pair that grabs it the moment it is loose has spent it on an easy beat, and
 * a pair that waits until the field is a mess has been paid for waiting.
 *
 * So the film fills the field first and empties it last. Four bodies come down
 * across the first four beats and none of them is shot at; the only shot in
 * the whole film is the one that knocks the pod loose, which is the other half
 * of the wave — *freeing it is still a shot, and a shot spent here is a
 * creature still coming*. What the last page shows is one `podTaken` and four
 * bodies leaving the field at once, all of it the simulation's own.
 */
export const THE_PURGE: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 0, color: "cyan" },
    { beat: 1, col: 6, color: "red" },
    { beat: 2, col: 2, kind: "meteor", color: null },
    { beat: 3, col: 4, color: "cyan" },
  ],
  pods: [{ beat: 0, col: 3, row: 2, kind: "purge" }],
  acts: [
    { tick: 370, control: "fireRed" },
    { tick: 540, control: "cannon", col: 4 },
    { tick: 600, control: "intake" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PURGE POD · IT CLEARS ALL", anchor: { at: "pod" } },
    {
      tick: 280,
      seat: 2,
      text: "FREEING IT COSTS A SHOT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 1,
      text: "TAKE IT WHEN IT IS WORST",
      anchor: { at: "control", control: "intake" },
    },
  ],
};
