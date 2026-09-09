import type { Color } from "./types.js";

/**
 * THE TELL: rock, paper, scissors against a boss that shows you its hand, and
 * each of you can only see half of what it showed.
 *
 * The design is `docs/spec/bosses.md` 11.9. What matters here is the two
 * things that make it a round rather than a coin toss, because every rule in
 * this file is one of them:
 *
 * **The ring is the game's own physics.** PLATE beats BOLT, which is what a
 * plate has done in every wave since the first; BOLT beats MAW, because a
 * mouth open when a bolt arrives swallows it; MAW beats PLATE, because a plate
 * is a charge and the maw is the cannon lobe turned inside out — `intake`
 * already empties a lance fill (`lance.ts`). A pair walks in knowing two of
 * the three arrows, so the round costs almost no teaching.
 *
 * **So it is the one round that keeps the ship's own verbs.** Every round
 * before this has its own (`command-round.ts`: a pair told to "fire" at a dial
 * would be learning that words mean whatever the screen needs). Here `guard`,
 * `intake` and `fire` mean *exactly* what they always mean — the plate goes
 * up, the mouth opens, a bolt leaves the cannon — and that is the whole point
 * of the encounter. There is no `tellThrow` command and there must never be
 * one; `tell-round.ts` reads the ship's three.
 *
 * **The tell is split across the two screens.** The boss fills one of its
 * three lobes, and only player 1 is shown which. It wears one of the two
 * colours, and only player 2 is shown which. Neither half is a decision on its
 * own: he can see what to beat and cannot throw a bolt, she can throw the bolt
 * and cannot see whether a bolt is the right throw at all.
 *
 * The state is here, the ring is `tell-rules.ts`, the clock and the presses
 * are `tell-round.ts`, and what goes into the fingerprint is `tell-hash.ts`.
 */

/**
 * The three throws, in the order they are drawn round the ring and in the
 * order the panel puts them under a thumb. The index is what goes on the wire
 * and into the fingerprint, so the order is fixed once and never sorted.
 *
 * They are named for the things they are rather than for a hand shape: a pair
 * that has spent an act saying "plate" is not going to be asked to say
 * "paper" for ninety seconds.
 */
export const TELL_THROWS = ["bolt", "plate", "maw"] as const;
export type TellThrow = (typeof TELL_THROWS)[number];

/**
 * How an exchange came out, from the pair's side. The index is what the
 * fingerprint holds and what the picture switches on.
 *
 * `standoff` is both a tie and a bolt of the wrong colour, and that is not two
 * things sharing a word — see `tellResolve`: the wrong colour turns a win into
 * a stand-off and leaves a loss exactly where it was, so neither of them ever
 * moves the ladder.
 */
export const TELL_OUTCOMES = ["none", "win", "standoff", "loss"] as const;
export type TellOutcome = (typeof TELL_OUTCOMES)[number];

/**
 * The phases of one rung, and of the round around them.
 *
 * `lead` runs once, when the round opens: four beats so the pair can read a
 * screen that has just stopped being the field, which is SNAKE's argument and
 * THE PULSE's count-in. `tell` is the window — the boss shows its hand and the
 * pair throws into it. `reveal` is the little scene. `verdict` stands at the
 * end, and `spent` draws nothing new (`wave-end.ts` reads it).
 */
export const TELL_PHASES = ["lead", "tell", "reveal", "verdict", "spent"] as const;
export type TellPhase = (typeof TELL_PHASES)[number];

/** Beats between the round opening and the first tell. THE PULSE's four. */
export const TELL_LEAD_BEATS = 4;

/** Beats a reveal holds — long enough for the scene, short enough to want the next. */
export const TELL_REVEAL_BEATS = 3;

/** Beats the result stands before the wave gives way to the next one. */
export const TELL_VERDICT_BEATS = 5;

/**
 * One rung of the ladder, as the wave authors it.
 *
 * Authored rather than generated, for THE MIRROR's reason: a fight the author
 * cannot read off the page is a fight nobody designed. What is *not* authored
 * is which throw the boss makes — that is the Rng's, and on the opening rungs
 * it is not even the Rng's (`tellPick`).
 */
export interface TellRung {
  /**
   * Beats the boss shows its tell before the reveal, before any shortening a
   * stand-off has earned. Down the ladder this gets smaller, which is the
   * thing a pair actually improves at.
   */
  beats: number;
  /**
   * The boss changes its mind on the last beat of the tell.
   *
   * A feinting boss **shivers first** — `tellShivers` says which beat — so a
   * pair that knows the tell can still be right and a pair that called early
   * is wrong for a reason it can name. Without the shiver this would be the
   * one rule in the round that punishes reading.
   */
  feint?: boolean;
  /**
   * The boss answers the pair's last throw instead of drawing one.
   *
   * The larger half of what stops the round being a coin toss: it throws
   * whatever would have beaten what the pair threw last, so a pair that
   * notices can steer it. The first rung has nothing to answer and falls back
   * to the Rng, which is why this is per rung rather than a count.
   */
  answers?: boolean;
  /**
   * How many throws the rung asks for, back to back. One when it is absent,
   * which is every rung but the last.
   *
   * **It is the one rung with no guess in it** (`docs/spec/bosses.md` 11.9):
   * three throws, every one shown outright, no feint, and the pair finding out
   * whether it can say three words in four seconds. The exchanges run
   * *consecutively* — no reveal between them, the next tell opening on the
   * beat the last window closed — which is what makes it a sentence rather
   * than three rungs in a row; the reveal at the end plays all three in turn.
   * A rung may not both take more than one throw and feint, and `installTell`
   * refuses the pair: one asks the pair to hold its call a beat longer and the
   * other to stop holding anything.
   */
  throws?: number;
}

/**
 * One exchange, kept after it has been played.
 *
 * A rung of one has a list of one and nothing about the round changes; a rung
 * of three has three, and the reveal steps through them. It is a record rather
 * than a second copy of the state: the scalars on `TellState` below are
 * whatever is *on screen* — the exchange being played, and then the exchange
 * being revealed — and `revealScene` is the one place an entry here is copied
 * into them, so render/ reads one exchange at a time and never learnt that a
 * rung can hold more than one.
 */
export interface TellExchange {
  /** What the boss threw, a `TELL_THROWS` index. */
  bossThrow: number;
  /** The colour it was wearing: 1 red, 2 cyan. */
  bossColor: number;
  /** What the ship threw, -1 for a fumble or for a window nobody answered. */
  thrown: number;
  /** The colour of that throw: 0 for a throw that is not a bolt, else 1 or 2. */
  thrownColor: number;
  /** Which seat's thumb it was, 0 for nobody. */
  thrownBy: 0 | 1 | 2;
  /** Both seats pressed inside the window, so the ship threw nothing. */
  fumbled: boolean;
  /** The tick the throw was locked on. */
  thrownTick: number;
  /** How it came out, a `TELL_OUTCOMES` index. */
  outcome: number;
}

/** Everything THE TELL remembers between ticks. A `BossState` like the rest. */
export interface TellState {
  kind: "tell";
  phase: TellPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** Beats the whole ladder is allowed. Running it out costs `damageTell`. */
  beats: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored ladder, copied in, so content is never written to. */
  rungs: TellRung[];
  /** Which rung the pair is on. A loss puts it back to nought. */
  rung: number;
  /** How many rungs have been lost. The picture's only tally, and a cost. */
  lost: number;
  /**
   * Which exchange of the rung is on screen — the one being played while the
   * phase is `tell`, and the one being revealed while it is `reveal`. Nought
   * on every rung that asks for a single throw, which is every rung but the
   * last (`TellRung.throws`).
   */
  at: number;
  /**
   * The exchanges of this rung that are already played, in order, cleared when
   * a rung opens. One entry on an ordinary rung; three on the last one, and
   * they are what the reveal steps through.
   */
  played: TellExchange[];
  /**
   * Beats knocked off this rung's window by stand-offs. It only ever grows
   * inside a rung and is cleared when a new one opens: a pair that keeps
   * mirroring the boss is answering a shorter and shorter question.
   */
  shorten: number;
  /** What the boss will actually throw, as a `TELL_THROWS` index. */
  bossThrow: number;
  /** What its tell is showing. The same as `bossThrow` unless it is feinting. */
  bossShown: number;
  /** The colour it is wearing: 1 red, 2 cyan. Only player 2 is shown it. */
  bossColor: number;
  /** What the ship threw, as a `TELL_THROWS` index, -1 for nothing yet. */
  thrown: number;
  /** The colour of that throw: 0 for a throw that is not a bolt, else 1 or 2. */
  thrownColor: number;
  /** Which seat's thumb it was, 0 before anybody has thrown. */
  thrownBy: 0 | 1 | 2;
  /**
   * Both seats pressed inside the same window, so the ship threw nothing.
   *
   * The owner's rule, and the reason the round has a sentence in it at all:
   * the ship throws once, so who is throwing has to be said out loud before
   * either of them presses. A second press cancels the first rather than
   * losing to it — there is no first-past-the-post here, because a race is
   * exactly the thing two people cannot hold a conversation about.
   */
  fumbled: boolean;
  /** The tick the throw was locked on, so both screens can light the node. */
  thrownTick: number;
  /** How the exchange came out, as a `TELL_OUTCOMES` index. */
  outcome: number;
  /**
   * The pair's throw on the rung before this one, -1 for none. What a rung
   * with `answers` reads. A fumble leaves it alone: there is nothing to answer.
   */
  lastThrow: number;
}

/**
 * How many throws a rung asks for. One unless it says otherwise, and it is a
 * function rather than a `??` at each site for the reason every other rule in
 * this round is: two readers spelling out the same default is how a rung comes
 * to run three exchanges in the simulation and draw one on a screen.
 */
export function tellThrows(rung: TellRung): number {
  return Math.max(1, rung.throws ?? 1);
}

/** The colour a `bossColor` or a `thrownColor` stands for, or null for none. */
export function tellColor(n: number): Color | null {
  return n === 1 ? "red" : n === 2 ? "cyan" : null;
}

/** And back. `null` is 0, which is what a throw that is not a bolt carries. */
export function tellColorIndex(c: Color | null): number {
  return c === "red" ? 1 : c === "cyan" ? 2 : 0;
}
