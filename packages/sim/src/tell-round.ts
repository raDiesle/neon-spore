import {
  TELL_LEAD_BEATS,
  TELL_REVEAL_BEATS,
  TELL_VERDICT_BEATS,
  type TellRung,
  type TellState,
  tellThrows,
} from "./tell.js";
import { enterPhase, tellOpenRung, tellReveal, tellShowExchange } from "./tell-ladder.js";
import { tellCurrent, tellIndex, tellShivers, tellWindow } from "./tell-rules.js";
import type { Color, Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TELL's clock: the lead-in, the phases, and whose press counts.
 *
 * What an exchange *does* — the ring folded into an outcome, the rung moved,
 * the hull charged — is `tell-ladder.ts`, cut out of here when the last rung
 * became three throws and took this file over its 250-line limit.
 *
 * The fifth round, built the way the first four are — a round that is not the
 * field is a **boss wave**, so a wave names `boss: { kind: "tell", … }`,
 * `startWave` installs it and nothing anywhere has an opinion about when a
 * round is reached (`docs/decisions.md` #20). What is different is worth
 * saying twice:
 *
 * **It is stepped on the beat and read on the tick.** The exchange happens on
 * a beat boundary — the boss reveals when the window runs out, and a window is
 * counted in beats — so unlike the four rounds before it there is nothing here
 * that wants a tick's resolution. It still takes its presses on the tick,
 * because a thumb that landed on the last tick of the window locked inside it
 * and a press held until the next beat would be a press the pair did not make.
 *
 * **It keeps the ship's verbs.** `guard`, `intake` and `fire` mean exactly
 * what they mean on the field, which is the whole encounter (`tell.ts`).
 */

/** Whether the round has the world — asked once, in `step`, and nowhere else. */
export function tellHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "tell";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function tellRound(world: World): TellState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "tell" ? boss : null;
}

/** Install it, from the wave's own `boss:` entry. */
export function installTell(world: World, rungs: readonly TellRung[], beats: number): TellState {
  // A wave that carries this boss and authors nothing is a ladder with no
  // rungs — SNAKE's objection, and it is worth the same throw.
  if (rungs.length === 0) throw new Error("a tell wave with no rungs is not a round");
  // A rung may ask the pair to hold its call one beat longer, or it may ask
  // them to stop holding anything and say three words in a row. It may not ask
  // both, and a wave that authors both is a rung nobody designed
  // (`TellRung.throws`, `docs/spec/bosses.md` 11.9).
  for (const rung of rungs) {
    if (rung.feint === true && tellThrows(rung) > 1) {
      throw new Error("a tell rung cannot both feint and take more than one throw");
    }
  }
  const state: TellState = {
    kind: "tell",
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    beats,
    passed: false,
    rungs: rungs.map((r) => ({ ...r })),
    rung: 0,
    lost: 0,
    at: 0,
    played: [],
    shorten: 0,
    bossThrow: 0,
    bossShown: 0,
    bossColor: 1,
    thrown: -1,
    thrownColor: 0,
    thrownBy: 0,
    fumbled: false,
    thrownTick: -1,
    outcome: 0,
    lastThrow: -1,
  };
  return state;
}

/** One tick of the round. Called from `step`'s own early return. */
export function stepTellRound(world: World): void {
  const state = tellRound(world);
  if (state === null || world.over) return;
  const since = world.beat - state.phaseBeat;

  if (state.phase === "lead") {
    if (since >= TELL_LEAD_BEATS) tellOpenRung(world, state, 0);
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (state.phase === "spent") return;
  if (state.phase === "verdict") {
    if (since >= TELL_VERDICT_BEATS) enterPhase(state, "spent", world.beat);
    return;
  }
  if (state.phase === "reveal") {
    if (since < TELL_REVEAL_BEATS) return;
    // A rung of three has three scenes, and they play in turn — the ring
    // lights one node at a time and this is what walks it along
    // (`tell-ladder.ts`). A rung of one has one, and this is the same line it
    // has always run.
    if (state.at + 1 < state.played.length) {
      tellShowExchange(state, state.at + 1);
      enterPhase(state, "reveal", world.beat);
      return;
    }
    tellOpenRung(world, state, state.rung);
    return;
  }
  // The window. A feinting boss changes its mind on its last beat, and it has
  // shivered by now — so the pair that read the shiver has one beat to answer
  // and the pair that called on the first beat is already committed.
  const windowBeats = tellWindow(tellCurrent(state), state.shorten);
  if (since === tellShivers(windowBeats)) state.bossShown = state.bossThrow;
  if (since >= windowBeats) tellReveal(world, state);
}

/**
 * Take the round off the world outright, picture and all. `closeGauge` says
 * why that is not how a round ends: this is for a run being left.
 */
export function closeTell(world: World): void {
  if (!tellHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it.
 *
 * **The seat split is the standard panel's, untouched.** Player 1 holds SHIELD
 * and SUCK, so he throws PLATE and MAW and can never throw BOLT; player 2
 * holds the two colours, so she throws BOLT and nothing else. Which seat may
 * send which is checked here rather than in the command type, the way SNAKE's
 * and THE FLEET's are: a command is what was pressed, and whose press counts
 * is the round's rule.
 *
 * **A second seat's press is a fumble, not a race.** The ship throws once, so
 * who is throwing has to be said out loud before either of them presses. A
 * first-past-the-post rule would make the round a thing two thumbs do instead
 * of a thing two people say, which is the owner's decision on 8 September
 * 2026. The same seat pressing twice is a stutter and changes nothing: the
 * press is committed.
 */
export function tellRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const state = tellRound(world);
  if (state === null || state.phase !== "tell") return;
  const thrown = throwOf(player, command);
  if (thrown === null) return;
  if (state.fumbled) return;
  if (state.thrown === -1) {
    state.thrown = thrown.at;
    state.thrownColor = thrown.color;
    state.thrownBy = player;
    state.thrownTick = world.tick;
    return;
  }
  if (state.thrownBy === player) return;
  state.fumbled = true;
  state.thrownTick = world.tick;
}

/**
 * Which throw this seat's press is, or null for a press that is not one.
 *
 * **The bolt is the lift.** A thumb on RED or CYAN sends `prime` — down to
 * start the fill, up to shoot — and the lift is the ordinary shot everywhere
 * else in the game (`commands.ts`), so it is the bolt here. Until 10 September
 * 2026 only a bare `fire` counted, which nothing on the round's own panel
 * sends: the swipe across the ship and the desk keyboard send one, the lobes
 * never do, and on a phone the navigator could not throw at all. The press
 * itself says nothing, as it says nothing on the field; a hold long enough to
 * be a lance has no column to fire into here, so the lift owes a bolt whatever
 * was in the lobe. `fire` stays, for the swipe and for a caller with no thumbs.
 */
function throwOf(player: 1 | 2, command: Command): { at: number; color: number } | null {
  if (player === 1 && command.kind === "guard") return { at: tellIndex("plate"), color: 0 };
  if (player === 1 && command.kind === "intake") return { at: tellIndex("maw"), color: 0 };
  if (player !== 2) return null;
  if (command.kind === "fire" || (command.kind === "prime" && !command.on)) {
    const color: Color = command.color;
    return { at: tellIndex("bolt"), color: color === "red" ? 1 : 2 };
  }
  return null;
}
