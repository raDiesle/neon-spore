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
 * shows is the two halves parting, and **both of them going on up**: the owner
 * ruled on 14 September 2026 that a balloon never goes downwards, so a split is
 * two bodies to answer rather than one to answer and one to survive.
 *
 * **The last page used to point at the retries and it cannot any more.** It
 * showed the sinking half reaching the ship and the hull paying for it; nothing
 * a balloon does costs the hull now. The top of the field is where the price
 * moved to, and it is not a price at all — a body that gets there turns into a
 * torch and falls (`sim/balloon.ts` `topOut`), which is a thing the pair has to
 * answer rather than a bill they read afterwards. So the page says that, and
 * points at the body it is about.
 *
 * The body comes in at a wall a beat in and glides to the middle
 * (`sim/balloon-entry.ts`). The timing is the whole of the authoring: a step is
 * `balloonClimbBeats` long and the runner finds a handle's body by the column
 * it stands in, so the carry has to start and finish inside one step — the grab
 * is on the beat after a step and the carry is done before the next.
 */
export const THE_BALLOON: GuideScene = {
  ticks: 1620,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 6, col: 4, kind: "balloon", color: null }],
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
    // Three beats, and it holds with the climbing half on row six — the last
    // beat it is still in the middle of the screen — and the other on row ten.
    { tick: 840, seat: 1, text: "TWO NOW, AND BOTH GO UP", anchor: { at: "body" } },
    { tick: 1020, seat: 1, text: "AT THE TOP IT DROPS BACK", anchor: { at: "radar" } },
  ],
};
