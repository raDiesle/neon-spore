/**
 * **The five mechanics that are not a thing the field sends**, and the whole
 * of `reach: "run"`: a wave's own opening, the wind-up on a shot, and the three
 * things a held thumb does.
 *
 * Lifted out of `mechanics-table.ts` when THE CRAWLER took that file past its
 * 250-line limit — the second such cut, after `mechanics-rocks.ts`, and along a
 * seam the `reach` field already names. Every other row in that table is a
 * body or a boss the pair is *shown*; these five are things the pair can
 * always do, in every wave, and the bestiary reads better without them in the
 * middle of it.
 *
 * `as const` rather than a type annotation, for `ROCK_MECHANICS`' reason:
 * `MECHANICS` next door is `as const satisfies` and `WaveKind` is read back out
 * of it, so a spread that widened a literal would quietly change that union.
 * Nothing here sets `waveNames` — none of the five is a body a wave can place —
 * but the rule is the same one and is worth keeping in one shape.
 */
export const RUN_MECHANICS = {
  briefing: {
    what: "A wave opens on its number, its name and its sentence, then on a split guide if it carries one — and that guide ends on two circles the pair hold until both say READY.",
    reach: "run",
    switch: { field: "briefings", off: false },
  },
  windup: {
    what: "A press does not fire; the shot leaves on the next point of a grid measured in beats, where player 1 can watch it happen.",
    reach: "run",
    switch: { field: "shotChargeBeats", off: 0 },
  },
  lance: {
    what: "Player 2 holds a colour instead of tapping it and the cannon lobe fills, for as long as player 1 keeps the cannon still. At the top of the fill the beam burns the column: every body of that colour standing in it goes at once, and the beam stays where it reached for a beat. Nothing travels. A lift before the top is the ordinary shot, and what was in the lobe is lost.",
    reach: "run",
  },
  grip: {
    what: "A finger held on a rock drags at it, and it falls slower for as long as the finger stays. Either seat, and two hands compound. Only a rock: a hand on anything the cannon can answer is an aim instead.",
    reach: "run",
  },
  lock: {
    what: "A finger held by player 1 on a body that can be shot: every shot the cannon puts out steers into it and lands, from whatever column it left the muzzle in. It says nothing at all about the colour, and it is the whole of what a hand does to a living body — nothing is slowed and nothing moves a lane.",
    reach: "run",
  },
} as const;
