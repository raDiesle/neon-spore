import type { GuideScene } from "../scene-types.js";

/**
 * THE MIRROR's rehearsal: Simon Says, played on the pair's own controls.
 *
 * The boss is a copy of their ship. It performs a sequence of the moves they
 * already know and then asks for the whole of it back — so what it takes is
 * memory across a voice channel with a delay on it, and the split is that
 * neither of them can hold a long sequence alone.
 *
 * Three pages, and the middle one is the wave. *Nothing you press counts while
 * it is still showing* is the instruction every pair breaks first, so the page
 * that says it points at the button they are about to press, during the beats
 * where pressing it does nothing. Then the sequence goes back in order, and the
 * verdict at the end of the film is the simulation's own `right` rather than a
 * picture of one.
 *
 * The first page is the film's one shared page, and it has to be: the mirror
 * stands over the ship and performs at *it*, so the thing being pointed at is
 * the hull. Everything after that belongs to a seat.
 */
export const THE_MIRROR: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [],
  // Only the first round is reached inside one loop — a lead, a demonstration,
  // five beats of it standing there, and then sixteen beats to answer in. The
  // other two are the wave's own and are left where the wave has them, because
  // a film is a picture of the rules rather than a playthrough.
  boss: {
    kind: "mirror",
    rounds: [
      ["fireRed", "guard"],
      ["cannonLeft", "cannonRight", "cannonRight"],
      ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
    ],
  },
  acts: [
    { tick: 780, control: "fireRed" },
    { tick: 850, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "IT PERFORMS YOUR MOVES", anchor: { at: "hull" } },
    {
      tick: 300,
      seat: 2,
      text: "NOTHING COUNTS YET",
      anchor: { at: "control", control: "fireRed" },
    },
    // The press is a long way after this page opens, and deliberately: the
    // pair's turn does not begin until the sequence has stood for five beats,
    // and the waiting is half of what the page is about.
    {
      tick: 560,
      seat: 2,
      text: "NOW GIVE IT BACK IN ORDER",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
