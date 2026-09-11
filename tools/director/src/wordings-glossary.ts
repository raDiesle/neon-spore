/**
 * The words on the WORDINGS page that have no one place on the picture —
 * the list under the two labelled screens. Its own file so `wordings.ts`,
 * which is the labels, stays under the length limit.
 */

/** Words a prompt uses that have no one place on the picture. */
export const GLOSSARY: ReadonlyArray<readonly [string, string]> = [
  ["pilot / navigator", "Player 1 and player 2. Each is a seat; a phone shows one seat."],
  ["tick", "One step of the simulation. Time in the code is counted in ticks, never in seconds."],
  ["wave", "One list of arrivals with a name and a one-sentence rule. The game is a run of waves."],
  [
    "round",
    "A wave with its own rules and its own picture — a boss fight. The no-travel rule does not reach it.",
  ],
  [
    "body / creature",
    "Anything that falls down the field. A slick, a bulb, a rock, a torch — all bodies.",
  ],
  [
    "rock / meteor",
    "A grey body with no colour. A shot cannot break it; only the shield stops it.",
  ],
  [
    "lobe",
    "Two things, on purpose: a bump the hull grows (the cannon, the shield) and a round button on the band. Both are the ship swelling.",
  ],
  [
    "ward",
    "The shield made live: the navigator has it in the column and the pilot is holding the guard lobe.",
  ],
  ["guard window", "How long one hold of the guard lobe keeps the ward up."],
  [
    "lance",
    "A colour held down instead of tapped: the cannon lobe fills, and at the top of the fill a beam burns the whole column.",
  ],
  ["pod", "A small thing that falls and is taken in through the maw rather than shot."],
  [
    "arm / claw",
    "The pilot's reach on the waves that have it: an arm sent up the cannon's column that closes on the first thing it meets.",
  ],
  ["socket", "The wet dip in the band's tissue that a lobe stands in."],
  ["gloss", "The film of light over a lobe."],
  ["slime", "What hangs off the seam into the band."],
  ["tissue", "What the band is made of: the veined, wet ground the controls stand in."],
  ["membrane", "The skin of the hull as a surface — it breathes, and the lobes lift it."],
  ["glow / halo", "The soft light around a bright thing. Every lit thing on the field has one."],
  ["key light", "The one light everything round is lit by, so a dome has a top."],
  ["backdrop", "The space behind the field: the stars and the slow light."],
  ["crater", "A pit in a rock. A rock full of them is no closer to breaking."],
  ["breach", "A body reaching the hull. It leaves a scar and costs hull."],
  ["duty word", "The one word the siren writes under itself, saying what your seat is to do."],
];
