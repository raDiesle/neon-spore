import type { GuideScene } from "../scene-types.js";

/**
 * THE MIRROR's rehearsal: Simon Says, played on the pair's own controls.
 *
 * The boss is a copy of their ship. It performs a sequence of the moves they
 * already know and then asks for the whole of it back — so what it takes is
 * memory across a voice channel with a delay on it, and the split is that
 * neither of them can hold a long sequence alone.
 *
 * Two pages since 18 September 2026, down from three, because the fight says
 * the rest itself (`docs/decisions.md` #34). *Nothing you press counts while
 * it is still showing* was the middle page, and it came out whole: the band
 * is drawn dead for exactly those beats (`mirrorHoldsControls`, `band.ts`)
 * under a count that says WATCH — CONTROLS LOCKED (`render/src/simon-fx.ts`),
 * which is the same sentence in the fight's own voice, and the page after it
 * is the same seat, so the ghost hand still draws her press. The last page
 * lost its verb to the cue — `REPEAT` over the mirror's cannon for the whole
 * of `listen` (`render/src/boss-cue-read-e.ts`) — and keeps the half the cue
 * may never carry, which is that the order is what is being tested. The
 * verdict at the end of the film is the simulation's own `right` rather than
 * a picture of one.
 *
 * The first page is the film's one shared page, and it has to be: the mirror
 * stands over the ship and performs at *it*, so the thing being pointed at is
 * the hull. It says the split rather than the picture — a sequence longer
 * than one head is held by calling the moves out as they are shown, which is
 * the one thing neither the mirror nor the cue can say. Everything after that
 * belongs to a seat.
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
    // This page said IT PERFORMS YOUR MOVES until 18 September 2026, which is
    // the picture: the mirror is a ship performing at theirs, on every screen.
    // What it says now is how two heads hold one sequence.
    { tick: 0, seat: 1, text: "CALL EACH MOVE AS IT COMES", anchor: { at: "hull" } },
    // NOTHING COUNTS YET stood at 300 on her screen and came out: the band is
    // drawn dead while the mirror holds the controls, and the cue is silent
    // there on purpose (`decisions.md` #34). The page below is hers too, so
    // her press at 780 still has its hand.
    //
    // The press is a long way after this page opens, and deliberately: the
    // pair's turn does not begin until the sequence has stood for five beats,
    // and the waiting is half of what the page is about. It said NOW GIVE IT
    // BACK IN ORDER until 18 September 2026: the fight writes REPEAT over
    // the mirror's cannon for as long as it is listening, on both screens, so
    // the verb came out and the order stayed.
    {
      tick: 560,
      seat: 2,
      text: "THE ORDER IS THE TEST",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
