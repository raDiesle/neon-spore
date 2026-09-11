/**
 * **The six bodies that are more than one thing**: a thread of beads, a worm
 * of links, a wire the width of the field, an arch with two poles, a chain
 * of domes, and two bodies joined at a waist.
 *
 * Cut out of `creature-kinds.ts` on purpose rather than under pressure — that
 * file was five lines under its 250-line limit and grows by a paragraph for
 * every creature added, so the next lane would have been the one choosing
 * where the cut went (`docs/queue.md`, 6 September 2026).
 *
 * What holds them together is how a shot reaches them: each is answered a
 * *member or a column at a time* rather than as one arrival, so each needs a
 * rule saying which part was met before it can say what met it. Everything
 * left next door is a body a bolt either kills or does not.
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself:
 * every consumer still walks the whole roster, which is what keeps a new kind
 * a compile error (`creature-roster.ts`, `kind-code.ts`).
 */
export type ManyKind =
  /**
   * One bead of a thread of two to five, alternating red and cyan and eaten
   * from its ends inward at an end rolled again after every shot: player 2 is
   * shown which is lit and no colour, player 1 the colours and no mark.
   */
  | "strand"
  /**
   * One link of a maggot that walks the ship's surface instead of falling onto
   * it, and the first body **both controls answer, one link at a time**. Its
   * two ends are armour nothing takes off; the segments between them cycle
   * red, cyan, armour, so every third one turns the two seats round.
   * `crawler.ts`, `crawler-round.ts` and `crawler-beat.ts` are the whole of it.
   */
  | "crawler"
  /**
   * A live line the width of the field with gaps burnt through it, coming
   * down twice as fast as anything else. It is not a body standing in a
   * column — it *is* every column — so nothing about it is aimed at and the
   * trigger has nothing to say to it: the only question is whether the
   * shield's dome is standing in one of the gaps when the line reaches it.
   * Player 1 is shown where the gaps are and player 2, who is the only one
   * who can move the shield, is shown an unbroken wall. `fence.ts` holds the
   * whole of it and `Creature.fenceGaps` is the whole of its state.
   */
  | "fence"
  /**
   * A horseshoe standing on its two poles, one red and one cyan, with an
   * armoured plate slung under it on a staff. The plate is the creature: a
   * shot climbing its column arrives square underneath and is reflected, so
   * the only bolt that reaches a pole is one arriving *sideways* — which means
   * player 1 has to stand the cannon off the column and hold the body, and the
   * shot climbs, turns level with it and comes in across (`lock.ts`). Which
   * side it comes from is which pole it meets, and which pole it meets is
   * which trigger kills it.
   * `magnet.ts` holds the whole of it, and it carries no state of its own —
   * the two pole colours are `color` and its opposite, left and right.
   */
  | "magnet"
  /**
   * A rock inside a dome of its own, coming in at the **right wall** and
   * crossing the field to the left rather than falling — and the first body
   * whose answer takes every other one of its kind with it. Nothing touches it
   * while the dome is on; the ward reaching up its column takes the dome off,
   * exactly as it opens a clasp, and what is left is a `torch` dropping at
   * thirteen rows a beat. But the charge the dome was holding does not go out
   * with it: it jumps to another coil still standing, and `coilJumpBeats` later
   * that one opens too and throws it on again, until the field is bare. Only
   * player 1 is shown the bolt in flight, and only player 2 can move the dome.
   * `coil.ts` holds the whole of it; `Creature.coilDir` and `Creature.coilLit`
   * are the whole of its state.
   */
  | "coil"
  /**
   * A slick and a bulb joined at a thin middle tile and armoured all the way
   * round — an hourglass on its side, three tiles wide — crossing the field
   * on THE CAROM's diagonal and turning at the walls. Only the middle can be
   * broken, only in the colour the wave gave it, and **only while the ship's
   * shield stands armed in that same lane**: then the shell comes off and
   * the two ends fall as an ordinary red slick and an ordinary cyan bulb.
   * Any other shot bounces off and drives the whole thing a row toward the
   * ship. `crystal.ts` holds the whole of it and `Creature.crystalDir` is the
   * whole of its state.
   */
  | "crystal";
