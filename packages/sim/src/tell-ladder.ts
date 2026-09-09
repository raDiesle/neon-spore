import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import { type TellExchange, type TellState, tellThrows } from "./tell.js";
import { tellCurrent, tellPick, tellPickColor, tellResolve } from "./tell-rules.js";
import type { World } from "./world.js";

/**
 * WHAT AN EXCHANGE DOES TO THE LADDER — the rung, the throws inside it, and
 * the two ways the hull pays.
 *
 * Cut out of `tell-round.ts` when the last rung became three throws and took
 * that file over its 250-line limit. The seam was already there and is the one
 * the round is really made of: next door is the *clock* — which phase it is,
 * how long a phase lasts, whose press counts — and everything here is what
 * happens at the moment a window closes.
 *
 * **A rung is a list of exchanges, and usually a list of one.** `TellRung.throws`
 * says how many, and the four rungs before the last one leave it absent. What
 * is different about a rung of three is only that the window closing opens the
 * next tell instead of the reveal; every rule about winning, tying and losing
 * is the same rule read once per exchange and folded at the end.
 */

/** The exchanges of the rung, folded into the one outcome the ladder moves on.
 *
 * The worst of them, and it falls straight out of the order `TELL_OUTCOMES` is
 * written in — none, win, stand-off, loss — so this is `Math.max` rather than
 * a table nobody would keep in step with that list. Three throws are one
 * sentence: a pair that says two of the three words is not two thirds up a
 * rung, it has said the sentence wrong. */
export function tellRungOutcome(played: readonly TellExchange[]): number {
  let worst = 0;
  for (const e of played) worst = Math.max(worst, e.outcome);
  return worst;
}

/** The exchange on screen, copied out of the record into the fields render/
 * reads. The one place that copy happens, so a scene the pair is looking at
 * and the scene the round thinks it is showing cannot come apart. */
export function tellShowExchange(state: TellState, at: number): void {
  const e = state.played[at];
  if (e === undefined) return;
  state.at = at;
  state.bossThrow = e.bossThrow;
  state.bossShown = e.bossThrow;
  state.bossColor = e.bossColor;
  state.thrown = e.thrown;
  state.thrownColor = e.thrownColor;
  state.thrownBy = e.thrownBy;
  state.fumbled = e.fumbled;
  state.thrownTick = e.thrownTick;
  state.outcome = e.outcome;
}

/**
 * The window ran out: the boss shows its hand, the ship shows what it threw,
 * and either the next tell opens or the ladder moves.
 *
 * Both nodes light on the same beat, which is the owner's rule about the
 * reveal being simultaneous. What the picture makes of the outcome is
 * `render/tell-scene.ts`; nothing about the scene is decided here.
 */
export function tellReveal(world: World, state: TellState): void {
  const thrown = state.fumbled ? -1 : state.thrown;
  const outcome = tellResolve(thrown, state.thrownColor, state.bossThrow, state.bossColor);
  state.bossShown = state.bossThrow;
  state.outcome = outcome;
  state.played.push({
    bossThrow: state.bossThrow,
    bossColor: state.bossColor,
    thrown: state.thrown,
    thrownColor: state.thrownColor,
    thrownBy: state.thrownBy,
    fumbled: state.fumbled,
    thrownTick: state.thrownTick,
    outcome,
  });
  // More of the sentence to say. The next tell opens on this beat rather than
  // after a scene, which is the whole of what "three throws on three
  // consecutive beats" asks for.
  if (state.played.length < tellThrows(tellCurrent(state))) {
    state.at = state.played.length;
    tellOpenExchange(world, state);
    return;
  }
  moveLadder(world, state, tellRungOutcome(state.played));
  tellShowExchange(state, 0);
  enterPhase(state, "reveal", world.beat);
}

function moveLadder(world: World, state: TellState, outcome: number): void {
  // What the pair threw last is what an answering rung has to beat, and on a
  // rung of three that is the last of the three: it is the most recent thing
  // the boss saw. A fumble leaves it alone — there is nothing to answer.
  const last = state.played.at(-1);
  const thrown = last === undefined || last.fumbled ? -1 : last.thrown;
  if (outcome === 1) {
    // Won. The rung is behind them, and what they threw is what the next
    // answering rung will have to beat. The shortening a stand-off earned goes
    // with the rung that earned it: a pair does not carry a punishment up a
    // rung they got right.
    state.lastThrow = thrown;
    state.shorten = 0;
    state.rung += 1;
    if (state.rung >= state.rungs.length) {
      state.passed = true;
      enterPhase(state, "verdict", world.beat);
      return;
    }
  } else if (outcome === 2) {
    // A stand-off. The rung stands and the next window is one beat shorter,
    // so mirroring the boss is survivable twice and not three times.
    state.lastThrow = thrown;
    state.shorten += 1;
  } else {
    // Lost. Back to the foot of the ladder, and the hull pays for it — but the
    // ladder itself is not re-drawn, so the rungs they already know are the
    // fifteen seconds they take to come back (`docs/spec/bosses.md` 11.9).
    state.lost += 1;
    state.rung = 0;
    state.shorten = 0;
    state.lastThrow = -1;
    breachHull(world, midCol(world.cfg), "meteorFastest", 0, world.cfg.damageTellRepeat);
  }
}

/**
 * Open a numbered rung: the record is cleared, the boss picks, the ship's
 * throw is cleared, the window starts.
 *
 * The one way in, so the round's own progress and a caller jumping to a rung
 * cannot disagree about what a rung is — `setBossRound`'s whole point
 * (`boss-round.ts`).
 */
export function tellOpenRung(world: World, state: TellState, rung: number): void {
  // The ladder's own clock, checked here and nowhere else: the round ends
  // *between* rungs, so a scene is never cut off half-drawn.
  if (world.beat - state.openBeat >= state.beats) {
    state.passed = false;
    breachHull(world, midCol(world.cfg), "meteorFastest", 0, world.cfg.damageTell);
    enterPhase(state, "verdict", world.beat);
    return;
  }
  state.rung = Math.max(0, Math.min(state.rungs.length - 1, rung));
  state.at = 0;
  state.played = [];
  tellOpenExchange(world, state);
}

/** One exchange of the rung being played: the boss draws, the ship's throw is
 * cleared, the window starts. Called for the first and for every one after it,
 * so a rung of three cannot open its second throw by a different route than
 * its first. */
export function tellOpenExchange(world: World, state: TellState): void {
  const picked = tellPick(world.rng, tellCurrent(state), state.lastThrow);
  state.bossThrow = picked.real;
  state.bossShown = picked.shown;
  state.bossColor = tellPickColor(world.rng);
  state.thrown = -1;
  state.thrownColor = 0;
  state.thrownBy = 0;
  state.fumbled = false;
  state.thrownTick = -1;
  state.outcome = 0;
  enterPhase(state, "tell", world.beat);
}

export function enterPhase(state: TellState, phase: TellState["phase"], beat: number): void {
  state.phase = phase;
  state.phaseBeat = beat;
}
