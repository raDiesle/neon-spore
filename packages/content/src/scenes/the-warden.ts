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
    { tick: 0, seat: 2, text: "A RING WITH A HOLE IN IT", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PULL IT AND KEEP PULLING",
      anchor: { at: "handle", target: "wardenTether" },
    },
    {
      tick: 610,
      seat: 2,
      text: "ONLY WHILE IT IS OPEN",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
