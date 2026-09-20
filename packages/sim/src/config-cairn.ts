/**
 * **THE CAIRN's two clocks** — how long the pile stands before it lets a rock
 * go by itself, and how long a thumb on it may stop that from happening
 * (`cairn.ts`, `cairn-hold.ts`, `docs/spec/bosses.md` §11.11).
 *
 * Its own file for the reason `config-boss-clocks.ts` gives: that file is
 * where a boss's *place* lives — the queen's row, the Warden's row, the
 * pile's — and a place can be read off the screen, while a count has to be
 * counted. These two are counted, out loud, by the pair. `cairnRow` and
 * `cairnUnits` stay next door because one is where the body stands and the
 * other is its silhouette.
 *
 * **The two numbers are one sentence.** Eight beats of patience and four a
 * hand can buy back make twelve, and twelve is exactly how long a rock takes
 * to fall from the pile to the hull. So a pile held all the way to its limit
 * lets the next one go on the beat the last one lands, and a pair who have
 * learnt that have learnt the whole clock without being told a number.
 */
export interface CairnConfig {
  /**
   * Beats the pile will stand whole before it lets a rock go by itself.
   *
   * **This is the answer to the one question the design page left open** — what
   * stops a pair pulling nothing and waiting. Nothing stops them, and it costs
   * them the lane: a pile that sheds on its own drops into a column the rng
   * drew, announced on player 1's screen the whole time it is counting, rather
   * than into one of the two edges a hand would have chosen.
   *
   * Eight beats, which is five seconds at 96 BPM. Long enough that the column
   * is said out loud, heard and answered — the four-second floor every spoken
   * exchange in this game is held to (`.claude/skills/new-creature`, step 4) —
   * and short enough that standing still is never the plan. Two thirds of the
   * twelve beats a rock takes to fall, so a pair who only ever wait have the
   * next rock on them before the last one has landed.
   */
  cairnShedBeats: number;
  /**
   * Beats a hand resting on the pile may keep it from letting one go, counted
   * from the last unit that left it either way.
   *
   * **The gesture is one short sentence: hold the pile and it cannot let one
   * go.** It is the grip the pair already has — the same thumb that pulls a
   * rock out when it travels — so there is nothing new to press and nothing
   * new to learn, and it is found by doing what they already do and watching
   * the settle mark stop (`cairn-settle.ts`). THE LEAD says the same thing
   * about its stalk in the same words (`leadHoldBeats`): a thumb buys beats
   * and then the body goes anyway.
   *
   * Four, which is half the patience above and makes twelve with it — the
   * fall. It is worth asking for, because four beats is a whole sentence said
   * across the voice delay and a dome carried two columns. It is never the
   * plan, because the hand that is holding the pile is the hand that is not
   * pulling from it, and a fight won by waiting is a fight nobody finishes:
   * the pile has seven rocks and the wave ends when they are all warded.
   */
  cairnHoldBeats: number;
}

export const CAIRN_DEFAULTS: CairnConfig = {
  cairnShedBeats: 8,
  cairnHoldBeats: 4,
};
