/**
 * **The bodies a wave never sends**, and the only ones on the field that were
 * put there rather than queued.
 *
 * Cut out of `creature-kinds.ts` when THE CAIRN arrived and that file was
 * eleven lines under its limit, along the seam `packages/content` drew first:
 * `creatures-fixtures.ts` over there has held exactly this group since THE
 * CRAWLER, argued as a bestiary entry, and the simulation went on naming the
 * same four bodies in a list beside the arrivals. Three files now say one
 * thing — `creature-kinds-handed.ts` next door is the same move made for the
 * family two hands answer.
 *
 * What holds them together is `startWave`: none of these has an entry, a
 * column an author chose or a beat it comes down on, and `isBossBody` is the
 * rule that follows from it — a body installed where it stands is a body the
 * beat's fall loop must not carry. The tether is here because it is a boss's
 * limb and there is nowhere else it could sit that would not separate it from
 * the ring that lowers it.
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself:
 * every consumer still walks the whole roster, which is what keeps a new kind
 * a compile error (`creature-roster.ts`, `kind-code.ts`).
 */
export type FixtureKind =
  /** The Bulb Queen: huge, armoured, two marks under her middle and one of
   * them a lie. `boss.ts` walks her and `queen-mark.ts` opens her. */
  | "queen"
  /** THE WARDEN's ring: five columns wide with a hole you see the field
   * through, and it takes one of the two sliding controls at a time.
   * `warden.ts` is the clock and `warden-rope.ts` the hand. */
  | "warden"
  /** The line that ring lowers, with a handle on the end of it. It cannot be
   * shot and cannot be warded, and it never falls (`warden-rope.ts`). */
  | "tether"
  /**
   * **THE CAIRN: a boss made of the field's own rocks, and the first that is
   * taken apart rather than beaten.**
   *
   * Seven angular units stacked four, two and one, held in one outline
   * five columns wide, standing at `cairnRow` and never moving. Nothing
   * either panel does reaches it: a bolt goes past it to whatever is above
   * (`shot-reach.ts`) and the shield has nothing to say to a thing that is not
   * falling. The game has taught since its first act that a rock cannot be
   * shot, and this is that lesson worn as a body.
   *
   * What answers it is **a hand carried sideways** — the ordinary grip and the
   * ordinary carry, `handMeans` calling it `"pull"` — and a unit dragged clear
   * stops being part of the boss and falls out of the side it went as a plain
   * `meteor`, to be warded like any other. So the boss dismantles into the
   * game the pair already knows, and the whole fight is **rate**: every rock
   * you pull is a rock the navigator has to be under, and the pile does not
   * care how many are already in the air.
   *
   * **Waiting is not free and it is not safe either.** A pile that has stood
   * `cairnShedBeats` without losing a unit lets one go itself, into a column
   * the seeded rng picked — and that column is drawn on **player 1's screen
   * alone**. So the seat that can see where the next rock is coming from is
   * the seat with no shield, and the pair's other sentence is a number said
   * out loud. `Creature` carries none of this: `CairnState` is the whole of
   * it and `cairn.ts` the whole of what it means.
   */
  | "cairn"
  /**
   * **THE CURTAIN's fabric: a boss body the pair moves rather than beats.**
   *
   * A membrane seven columns wide hung at `curtainRow`, and behind it a core
   * that is no creature at all. It never falls; a bolt into it takes a soft
   * lobe off the hem or is spent on cloth (`bullet-refused.ts`); and **both
   * hands carried sideways** shove it a column, so the core behind it can be
   * shot — the ordinary carry, `handMeans` calling it `"pull"`, at boss
   * scale. It may hang partly off either wall (`curtainReach`), which no
   * other body may. `CurtainState` is the rest of it and `curtain.ts` the
   * whole of what it means.
   */
  | "curtain";
