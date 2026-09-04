import type { GuideScene } from "../scene-types.js";

/**
 * TORCH's rehearsal: the warning strip, and the fact that only one of them has
 * it.
 *
 * A torch is announced on player 1's strip and on nobody else's
 * (`content/src/comms.ts`, `docs/decisions.md` #15) and it is the fastest thing
 * in the field. The wave's sentence is *the one where the only warning is on
 * the other player's screen*, and the whole of it is a picture the two devices
 * do not share — so the film shows the same instant twice, once on each phone.
 *
 * **What differs is the column, and the captions say exactly that.** Both
 * screens carry the alarm — player 2's says a torch is inbound and to take the
 * column (`torch-alarm.ts`) — and only player 1's strip carries the blip that
 * says *which*. A caption reading "player 2 sees nothing" would have been the
 * neat version of the lesson and the wrong one, contradicted by the line
 * running across the top of the very frame it was drawn on.
 *
 * That pair of pages is the point of the film and the reason `SceneAnchor`
 * gained `radar`: an anchor that finds the blip when this screen has one and
 * the empty strip when it has not, so the absence is a thing a caption can be
 * pointed at rather than a coordinate somebody guessed.
 *
 * **The third page is the price, and it is the one shared page this film is
 * allowed.** The first torch arrives while nobody has said anything and takes
 * the hull, on player 1's own screen, where the warning had been sitting for
 * three seconds. Then a second torch is called and covered, which is what the
 * wave asks for. A film that only ever showed the right answer would never say
 * why the call has to happen before the thing exists.
 */
export const THE_TORCH: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // Beat 5 puts the first blip on the strip from the film's own first tick —
  // `radarLead` is 6 and the strip counts from the beat *before* the current
  // one, so five is the number that is already showing at beat zero, and the
  // page about the strip has something on it to be about. The second is far
  // enough behind that its warning arrives while the third page is being read.
  entries: [
    { beat: 5, col: 1, kind: "torch", color: null },
    { beat: 15, col: 5, kind: "torch", color: null },
  ],
  acts: [
    { tick: 730, control: "shield", col: 3 },
    { tick: 790, control: "shield", col: 4 },
    { tick: 850, control: "shield", col: 5 },
    { tick: 1000, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES THE COLUMN", anchor: { at: "radar" } },
    { tick: 200, seat: 2, text: "PLAYER 2 IS NOT TOLD WHERE", anchor: { at: "radar" } },
    { tick: 400, seat: 1, text: "NOBODY CALLED IT", anchor: { at: "health" } },
    {
      tick: 700,
      seat: 2,
      text: "PLAYER 2 COVERS BOTH",
      anchor: { at: "control", control: "shield" },
    },
  ],
};
