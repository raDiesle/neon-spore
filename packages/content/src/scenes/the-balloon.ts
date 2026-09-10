import type { GuideScene } from "../scene-types.js";

/**
 * THE BALLOON's rehearsal: two hands on one body, held there, or nothing at
 * all.
 *
 * Nothing either seat can fire touches one. What opens it is a handle on its
 * left and a handle on its right, carried outward at the same instant — the
 * pilot's on the left, the navigator's on the right, and the simulation refuses
 * a side that is not the seat that sent it (`sim/balloon-pull.ts`) — and then
 * **held** at full stretch for `balloonHoldBeats` before the skin gives
 * (`sim/balloon-rub.ts`). So this is the only film in the game with a hand on
 * both phones at once, and the two carries overlap on purpose: a page showing
 * one hand and then the other would be a page showing the mistake.
 *
 * The two middle pages are one each, pointed at the handle that seat holds, so
 * each of them sees their own hand take a grip before they are asked to time it
 * against somebody else's. The fourth page is the instant itself and the hold
 * after it, which is why its two acts let go a whole beat after the carry ends:
 * a hand that lifted on reaching taut would be the picture of the pair almost
 * doing it.
 *
 * **One balloon, the first split, and where the halves go.** The skin gives
 * twice — the first pull halves it and the second pops what is left for
 * nothing — and the film shows the first, because what a pair has never done
 * before is get two thumbs onto one beat and keep them there. What it then
 * shows is the two halves parting, one on up and one **down**, and the last
 * page is the shared one every film may spend: the sinking half reaching the
 * ship and the hull paying for it, so the pair reads that a split is not the
 * end and that both ends of the field punish a half left alone.
 *
 * The body enters a beat in, at the seventh authored column, heading left. The
 * timing is the whole of the authoring: a step is `balloonClimbBeats` long
 * and the runner finds a handle's body by the column it stands in, so the
 * carry has to start and finish inside one step — the grab is on the beat
 * after a step and the carry is done before the next — and the split has to
 * land low enough that the sinking half reaches the ship inside the loop while
 * the climbing half is still on the field at the end of it.
 */
export const THE_BALLOON: GuideScene = {
  ticks: 1680,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 4, kind: "balloon", color: null }],
  acts: [
    { tick: 630, drag: "balloonLeft", col: 2, by: 690, until: 800 },
    { tick: 630, drag: "balloonRight", col: 2, by: 690, until: 800 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "NOTHING YOU FIRE TOUCHES IT", anchor: { at: "body" } },
    {
      tick: 180,
      seat: 1,
      text: "THE LEFT HANDLE IS YOURS",
      anchor: { at: "handle", target: "balloonLeft" },
    },
    {
      tick: 360,
      seat: 2,
      text: "THE RIGHT HANDLE IS YOURS",
      anchor: { at: "handle", target: "balloonRight" },
    },
    { tick: 540, seat: 2, text: "BOTH, AND HOLD TILL IT GIVES", anchor: { at: "body" } },
    { tick: 900, seat: 1, text: "ONE CLIMBS ON, ONE SINKS", anchor: { at: "body" } },
    { tick: 1380, seat: 1, text: "A HALF LEFT ALONE HITS YOU", anchor: { at: "health" } },
  ],
};
