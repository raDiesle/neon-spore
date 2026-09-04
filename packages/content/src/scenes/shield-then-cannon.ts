import type { GuideScene } from "../scene-types.js";

/**
 * SHIELD, THEN CANNON's rehearsal: the other way to reach everything.
 *
 * Every control on the ordinary panel has a second way in — the ship itself.
 * The cannon is slid along the hull by taking hold of it; a lift that carried
 * it nowhere opens the maw; the plate is dragged the same way and pressed by
 * the *other* seat to fire it; and on player 2's screen the muzzle carried left
 * or right sends a colour. All five are `render/src/touch-ship.ts`, and all
 * five have been in the game since the panel was.
 *
 * **This is the wave for it because by now they own all of it.** The pair has
 * met the cannon, both colours, the rock, the plate and the trigger, and this
 * is the wave that asks them to swap between two of those mid-run — so every
 * gesture in the film is a second route to something they already use, and
 * none of it is a control being introduced.
 *
 * **Nothing here replaces the band.** Both strips and every lobe stay exactly
 * where they are and every wave is still playable with nothing but them; what
 * the film teaches is that a thumb already up on the field does not have to
 * come down. So the pages are the gestures, one each, and the wave's own prose
 * is what says the panel is still there.
 *
 * Five pages rather than the usual three or four, and it is the one film that
 * earns them: there are five gestures, they are on two screens, and a page
 * carrying two of them would be a page about a hand rather than about a way in.
 */
export const SHIELD_THEN_CANNON: GuideScene = {
  ticks: 1380,
  bpm: 120,
  seed: 1,
  // A rock and then a body, both away from where the two controls rest, so
  // every drag in the film has somewhere to go. It is the wave's own pairing:
  // the plate answers the first and the cannon answers the second.
  entries: [
    { beat: 0, col: 5, kind: "meteor", color: null },
    { beat: 6, col: 5, color: "red" },
  ],
  acts: [
    { tick: 90, control: "cannon", col: 4, onField: true },
    { tick: 130, control: "cannon", col: 5, onField: true },
    { tick: 170, control: "cannon", col: 5, onField: true },
    { tick: 370, control: "intake", onField: true },
    { tick: 610, control: "shield", col: 3, onField: true },
    { tick: 650, control: "shield", col: 4, onField: true },
    { tick: 690, control: "shield", col: 5, onField: true },
    { tick: 850, control: "guard", onField: true },
    { tick: 1130, control: "fireRed", onField: true },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "SLIDE THE CANNON ITSELF",
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 280,
      seat: 1,
      text: "A TAP ON IT IS THE MAW",
      anchor: { at: "ship", control: "intake" },
    },
    {
      tick: 520,
      seat: 2,
      text: "DRAG THE PLATE ITSELF",
      anchor: { at: "ship", control: "shield" },
    },
    // The trigger waits for the rock, exactly as it does on THE ROCK's own
    // film: the gesture is new and the timing is not.
    { tick: 800, seat: 1, text: "PRESS IT TO FIRE IT", anchor: { at: "ship", control: "guard" } },
    {
      tick: 1040,
      seat: 2,
      text: "SWIPE THE MUZZLE FOR RED",
      anchor: { at: "ship", control: "fireRed" },
    },
  ],
};
