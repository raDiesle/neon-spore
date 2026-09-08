import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import {
  TELL_LEAD_BEATS,
  TELL_REVEAL_BEATS,
  TELL_VERDICT_BEATS,
  type TellPhase,
  type TellRung,
  type TellState,
} from "./tell.js";
import {
  tellCurrent,
  tellIndex,
  tellPick,
  tellPickColor,
  tellResolve,
  tellShivers,
  tellWindow,
} from "./tell-rules.js";
import type { Color, Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TELL's clock: the lead-in, the ladder, and the two ways the hull pays.
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
    if (since >= TELL_LEAD_BEATS) openRung(world, state, 0);
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (state.phase === "spent") return;
  if (state.phase === "verdict") {
    if (since >= TELL_VERDICT_BEATS) enterPhase(state, "spent", world.beat);
    return;
  }
  if (state.phase === "reveal") {
    if (since >= TELL_REVEAL_BEATS) openRung(world, state, state.rung);
    return;
  }
  // The window. A feinting boss changes its mind on its last beat, and it has
  // shivered by now — so the pair that read the shiver has one beat to answer
  // and the pair that called on the first beat is already committed.
  const windowBeats = tellWindow(tellCurrent(state), state.shorten);
  if (since === tellShivers(windowBeats)) state.bossShown = state.bossThrow;
  if (since >= windowBeats) reveal(world, state);
}

/**
 * The window ran out: the boss shows its hand, the ship shows what it threw,
 * and the ladder moves.
 *
 * Both nodes light on the same beat, which is the owner's rule about the
 * reveal being simultaneous. What the picture makes of the outcome is
 * `render/tell-scene.ts`; nothing about the scene is decided here.
 */
function reveal(world: World, state: TellState): void {
  const thrown = state.fumbled ? -1 : state.thrown;
  state.outcome = tellResolve(thrown, state.thrownColor, state.bossThrow, state.bossColor);
  state.bossShown = state.bossThrow;
  if (state.outcome === 1) {
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
  } else if (state.outcome === 2) {
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
  enterPhase(state, "reveal", world.beat);
}

/**
 * Open a numbered rung: the boss picks, the ship's throw is cleared, the
 * window starts.
 *
 * The one way in, so the round's own progress and a caller jumping to a rung
 * cannot disagree about what a rung is — `setBossRound`'s whole point
 * (`boss-round.ts`).
 */
export function tellOpenRung(world: World, state: TellState, rung: number): void {
  openRung(world, state, rung);
}

function openRung(world: World, state: TellState, rung: number): void {
  // The ladder's own clock, checked here and nowhere else: the round ends
  // *between* rungs, so a scene is never cut off half-drawn.
  if (world.beat - state.openBeat >= state.beats) {
    state.passed = false;
    breachHull(world, midCol(world.cfg), "meteorFastest", 0, world.cfg.damageTell);
    enterPhase(state, "verdict", world.beat);
    return;
  }
  state.rung = Math.max(0, Math.min(state.rungs.length - 1, rung));
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

/** Which throw this seat's press is, or null for a press that is not one. */
function throwOf(player: 1 | 2, command: Command): { at: number; color: number } | null {
  if (player === 1 && command.kind === "guard") return { at: tellIndex("plate"), color: 0 };
  if (player === 1 && command.kind === "intake") return { at: tellIndex("maw"), color: 0 };
  if (player === 2 && command.kind === "fire") {
    const color: Color = command.color;
    return { at: tellIndex("bolt"), color: color === "red" ? 1 : 2 };
  }
  return null;
}

export function enterPhase(state: TellState, phase: TellPhase, beat: number): void {
  state.phase = phase;
  state.phaseBeat = beat;
}
