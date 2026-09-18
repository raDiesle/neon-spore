import type { GuideScene } from "../scene-types.js";

/**
 * THE WARDEN's rehearsal: he holds the door open and she has to be quick
 * enough to shoot through it.
 *
 * A ring five columns wide with a hole you can see the field through, and a
 * rope hanging out of the middle of it. The hatch behind that rope is the only
 * way to the eye, and it opens in proportion to the pull — so player 1's whole
 * job is a hand that does not let go, and player 2's is one shot of the rim's
 * own colour, in the eye's own column, while it is fully open.
 *
 * **The pull is a diagonal and it has to be.** The plates are apart at
 * `wardenTautMilli`, the rope hangs three and a half columns from the left
 * edge, and `clampPull` keeps a handle on the field — so a rope carried
 * straight sideways runs out of screen a thousandth short of taut. Down and to
 * the right it reaches with room over.
 *
 * **Two pages since the field learned to say the verbs.** Both of the ones
 * that named one are gone into the cue, and what is left is the picture on his
 * screen and the colour rule on hers.
 *
 * **The shot is aimed at where the pupil will be, not where it is.** The eye
 * drifts a column a beat and a bolt takes the better part of a second to cross
 * the field, so the film fires on the beat before the one it lands in — which
 * is the whole of what player 2 is doing while player 1 hangs on. A plate comes
 * off, the rope snaps back, and the next one is a different colour.
 */
export const THE_WARDEN: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "warden" },
  acts: [
    { tick: 330, drag: "wardenTether", by: 480, until: 820 },
    { tick: 700, control: "fireRed" },
  ],
  steps: [
    // His page now, and it was hers until 18 September 2026: the hole is what
    // his hand opens, and the page under it is the only one he has left.
    { tick: 0, seat: 1, text: "A RING WITH A HOLE IN IT", anchor: { at: "body" } },
    // PULL IT AND KEEP PULLING stood at 240 on this very handle and is gone
    // whole. The field writes `CARRY` / `PULL` there the moment his hand lands
    // and `HOLD` the moment the line goes taut, on his screen alone
    // (`decisions.md` #34, `render/boss-cue-read-f.ts`) — and while nothing is
    // holding it the rope draws its own `PULL` already (`handle-draw.ts`), so
    // the page was the third copy of one word.
    //
    // Hers said ONLY WHILE IT IS OPEN, which the cue says by appearing: `FIRE`
    // stands on the pupil for exactly the beats the eye is open. What no cue
    // may say is the colour — the rim wears the cycle's own and a bolt of the
    // other bounces off, which is the question this boss asks twice a cycle
    // and the one thing the film never said at all.
    {
      tick: 610,
      seat: 2,
      text: "THE SHOT IS THE RIM'S COLOUR",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
