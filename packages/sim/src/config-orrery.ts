/**
 * **THE ORRERY's numbers**: three orbits, the beat they first come together
 * on, and what the core does with the gap once a ring is off it
 * (`orrery.ts`, `docs/spec/bosses-choreographed.md` §2).
 *
 * Its own file for `config-diastole.ts`'s reason, and every field here but
 * one is a **beat count** rather than a place — which is why `SimConfig`
 * picks it up through `config-boss-clocks.ts` beside the other four clocks.
 * The exception is the last of them, `orreryHandMilliPerOrgan`, and it is a
 * measure of a thumb rather than of the field, so it does not break the
 * seam.
 *
 * **The three orbits are not coprime, and the design page says they should
 * be.** That is a correction rather than an oversight, and it is the same
 * correction THE DIASTOLE's lane made in the other direction. Coprime is the
 * right tool for *two* cadences that must meet rarely: 3 against 5 meet every
 * 15 beats and on no beat between, which is the window. For *three* it is the
 * wrong tool, because what coprimality maximises is exactly the number this
 * fight cannot afford — 8, 6 and 5 as the page asks come together every 120
 * beats, which is a wave and a half of waiting for one shot. 8, 6 and 4 come
 * together every 24, and what a pair of them sharing a factor actually costs
 * is that two rings meet oftener than three do. That is not a leak: a seat
 * watching two gaps cross knows *nothing at all* about the third, which is
 * the only secret this boss keeps.
 */
export interface OrreryConfig {
  /**
   * Organs in the outer ring, which is also the beats it takes to come round
   * — one organ a beat, so the count is the cadence and the picture is the
   * arithmetic.
   *
   * 8, the design's own number, and the longest of the three because the
   * outer orbit is the widest: an orrery whose outer ring came round fastest
   * would be an orrery drawn by somebody who had never seen one.
   */
  orreryOuterOrgans: number;
  /** Organs in the middle ring, and the beats it takes to come round. 6, the design's. */
  orreryMiddleOrgans: number;
  /**
   * Organs in the inner ring, and the beats it takes to come round.
   *
   * 4 rather than the design's 5, which is the whole of the correction argued
   * above: 8, 6 and 4 meet every 24 beats, 8, 6 and 5 every 120.
   */
  orreryInnerOrgans: number;
  /**
   * Beats from the install to the **first** beat all three gaps stand over the
   * core's column.
   *
   * Every ring is anchored off this one number, which is what makes an
   * alignment exist at all: three residues picked independently need not ever
   * come together, and a boss that could install itself unbeatable is not a
   * boss. 12 is long enough for the pair to have said what each of them can
   * see twice over, and short enough that the first window arrives while they
   * are still counting rather than after they have given up.
   */
  orreryFirstBeats: number;
  /**
   * Beats between rocks the core spits down its own column, once the first
   * ring is off it.
   *
   * 4, which is a rock every three seconds into the one column the cannon has
   * to stand in — the fight's whole second half is holding a column that is
   * being shot at. It never spits on a beat the shaft is open while rings
   * remain (`orrery-step.ts`): the beat the pair can reach the core is the one
   * beat the core cannot reach them, and a rock in flight up that column would
   * have made the window a coin toss rather than a window.
   */
  orrerySpitBeats: number;
  /**
   * Organs that come off a broken ring and fall as ordinary rocks.
   *
   * 3 rather than the ring's whole count, which the design asks for: eight
   * rocks arriving on one beat is a wave, and this is meant to be a
   * consequence. Three is the number the shield can just about answer while
   * the cannon is pinned in the middle column — **one a beat**, which is how
   * they come off (`orrery-step.ts`): three on one beat land on one beat in
   * three columns, and the shield is one column wide.
   */
  orreryDebris: number;
  /**
   * Beats THE SLOW is opened for as an alignment comes up.
   *
   * 2 — the beat before the gaps meet and the beat they meet on, so a window
   * one beat wide is about three seconds of real time to fire into. This is
   * the concept THE SLOW was ruled in for (`docs/decisions.md` #33): a
   * one-beat alignment across a voice delay is otherwise a coin toss.
   */
  orrerySlowBeats: number;
  /**
   * Beats the core takes to go out once the lance has stood in it.
   *
   * 5, and nothing can be pressed usefully while it runs: the boss is already
   * beaten when it starts. Slowed for its whole length, because the payoff of
   * this fight is a picture — a beam standing in a shaft through three broken
   * orbits with the debris of twenty organs falling through it.
   */
  orreryOutBeats: number;
  /**
   * **Thumb travel the ring's next detent costs**, in thousandths of a turn —
   * one and a half turns, and it is the only number in this fight that is not
   * a beat count.
   *
   * The pilot can turn the outermost unbroken ring by hand, and what the ring
   * gives is whole organs (`orrery-hand.ts`). This is the gearing, and it is
   * the whole difficulty of that control: a ring drifts one organ a beat under
   * its own cadence, so **holding a gap still** would cost one and a half
   * turns *every beat* — 2.4 turns a second at 96 BPM, which no thumb has —
   * while **bringing an alignment one organ forward** costs one and a half
   * turns whenever the pilot can spare the hand. So the hand bends the
   * arithmetic and cannot break it, and the price is the pilot's attention:
   * the ring is on the field and the cannon is on the panel, and he cannot be
   * on both.
   *
   * Half a turn an organ would make it a dial and the prediction pointless;
   * three would make it furniture. 1500 is read against `TURN` in `crank.ts`,
   * which is what a thousandth of a turn means everywhere in this game.
   */
  orreryHandMilliPerOrgan: number;
  /**
   * **Organs the gap is knocked short of the bottom by when a ring cracks**,
   * and so the number of detents the pilot's thumb owes before it comes off
   * (`orrery.ts`'s `seized`).
   *
   * Two, which is three turns of the thumb at `orreryHandMilliPerOrgan` — a
   * couple of seconds of hand while the core is throwing rocks down a column
   * beside him, and short enough that the pair can say the whole of it in two
   * words. One would be a tap and the gesture would not read as a gesture;
   * four is twelve seconds of winding with nothing to decide in it, which is
   * a chore rather than a fight.
   *
   * It is counted **backwards** along the slots, so the thumb's one fixed
   * sense — clockwise always adds to the slot number (`orrery-hand.ts`) —
   * carries the gap forward to the bottom on every ring, whichever way that
   * ring drifts. One direction to say out loud, three times over.
   */
  orreryCrackOrgans: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: eight beats, six and four, first together on beat twelve
 * and every twenty-four after that; a rock down the middle every four beats
 * from the first break; three organs off each ring that goes; and a ring that
 * gives one organ for every turn and a half of the pilot's thumb.
 */
export const ORRERY_DEFAULTS: OrreryConfig = {
  orreryOuterOrgans: 8,
  orreryMiddleOrgans: 6,
  orreryInnerOrgans: 4,
  orreryFirstBeats: 12,
  orrerySpitBeats: 4,
  orreryDebris: 3,
  orrerySlowBeats: 2,
  orreryOutBeats: 5,
  orreryHandMilliPerOrgan: 1500,
  orreryCrackOrgans: 2,
};
