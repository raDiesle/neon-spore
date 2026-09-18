import type { ScoutArena, ScoutPhase, ScoutState } from "./scout.js";
import { stepScoutArena } from "./scout-arena.js";
import { scoutHandHeard } from "./scout-hand.js";
import { scoutStand } from "./scout-open.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE SCOUT's clock: the three phases, the way in and the way out.
 *
 * Built the way SNAKE and THE GAUGE are, and everything `gauge-round.ts` says
 * about what that buys is true here word for word — a wave names
 * `boss: { kind: "scout", arenas: [...] }`, `startWave` installs it, and
 * nothing anywhere has an opinion about when a round is reached
 * (`docs/decisions.md` #20). So this header says only what is different.
 *
 * **The lead is the mother ship opening.** The scout is not thrown out on the
 * first frame: the ship opens, the little one drifts clear, and the beats that
 * takes are beats the pair spends reading two screens that have just stopped
 * being the field — one of them holding the motes and the hazards, the other
 * holding a ship and a nose. A round that started moving immediately would be
 * a round whose first repeat was nobody's fault.
 *
 * **The field is gone, and the hull is not.** `step` returns before a rule of
 * the field runs, so nothing spawns, falls or reaches the ship; `world.beat`
 * keeps going, because the metronome is the game's heartbeat. What the round
 * can still do is break the hull — a hazard's touch and the clock running out,
 * both in `scout-arena.ts` — and a hit is the wave lost, so the field holds
 * and the wave is played again (`wave-fail.ts`).
 */

/** Whether the round has the world — asked once, in `step`, and nowhere else. */
export function scoutHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "scout";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function scoutRound(world: World): ScoutState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "scout" ? boss : null;
}

/** Install it, from the wave's own `boss:` entry. */
export function installScout(world: World, arenas: readonly ScoutArena[]): ScoutState {
  const state: ScoutState = {
    kind: "scout",
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    // Copied in **to the leaf**, so content is never written to. A shallow
    // `[...a.motes]` copies the list and shares every mote in it, which is a
    // world holding the wave's own objects: `hash-coverage.test.ts` caught it
    // by changing a mote in one world and watching the same mote change in
    // the other, which is exactly the shape of the bug it would have been.
    arenas: arenas.map((a) => ({
      ...a,
      motes: a.motes.map((m) => ({ ...m })),
      hazards: a.hazards.map((h) => ({ ...h })),
    })),
    arena: 0,
    arenaBeat: world.beat,
    colMilli: 0,
    rowMilli: 0,
    vColMilli: 0,
    vRowMilli: 0,
    headingMilli: 0,
    turn: 0,
    burning: false,
    carrying: [],
    banked: [],
    mawTick: -1,
    hazards: [],
    caughtTick: -1,
    caughtBy: -1,
    reeling: false,
    primeTick: -1,
  };
  scoutStand(state, 0, world.beat);
  return state;
}

/**
 * Stand the round on a numbered arena, which is what `bun run frames` needs to
 * photograph the second one: nothing headless can win to it.
 */
export function scoutOpenRound(world: World, scout: ScoutState, index: number): void {
  scoutStand(scout, index, world.beat);
}

/**
 * One tick of the round.
 *
 * Called from `step`'s own early return rather than from `stepBoss`, because
 * the scout moves on the tick and `stepBoss` runs on the beat — THE GAUGE's
 * needle and SNAKE's body are stepped here for the same reason.
 *
 * A run that is already over stops the scout where it is. The hull can go
 * through inside this round, and a ship still flying over the end screen would
 * be a game still being played after it was lost.
 */
export function stepScoutRound(world: World): void {
  const round = scoutRound(world);
  if (round === null || world.over) return;
  const since = world.beat - round.phaseBeat;

  if (round.phase === "lead") {
    if (since < world.cfg.scoutLeadBeats) return;
    enterScoutPhase(round, "play", world.beat);
    // The arena's clock starts when the scout does, never when the picture
    // does: the beats it is judged against are the beats it could have been
    // flying, and the lead is for reading rather than for flying.
    round.arenaBeat = world.beat;
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (round.phase === "spent") return;
  if (round.phase === "verdict") {
    if (since >= world.cfg.scoutVerdictBeats) enterScoutPhase(round, "spent", world.beat);
    return;
  }

  const verdict = stepScoutArena(world, round);
  if (verdict === null) return;
  round.passed = verdict;
  enterScoutPhase(round, "verdict", world.beat);
}

/**
 * Take the round off the world outright, picture and all. `closeGauge` says
 * why that is not how a round ends: this is for a run being left.
 */
export function closeScout(world: World): void {
  if (!scoutHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it, and **whose press counts is this round's
 * rule** rather than the command union's.
 *
 * Player 1 flies: the two turns swing the nose and the burn pushes it. Player
 * 2 has the mother ship's mouth and nothing else — they can see every mote and
 * every hazard and cannot move the ship a thousandth of a tile, so the flying
 * is done on their word and the *catch* is done with their thumb. That is THE
 * CLAW's own arrangement, which is why this round is on that panel.
 *
 * Nothing reaches it outside `play`: the lead is for reading two screens and
 * the verdict for looking at one, and a press that counted during either would
 * be a press nobody meant.
 */
export function scoutRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const round = scoutRound(world);
  if (round === null || round.phase !== "play") return;
  // The two hands on the picture, one per seat and one per load past the
  // first (`scout-hand.ts`). Heard before the seat split below, because each
  // of them is already refused to the seat it does not belong to.
  scoutHandHeard(world, round, player, command);
  if (player === 2) {
    scoutMawHeard(round, world, command);
    return;
  }
  if (command.kind === "scoutTurn") {
    round.turn = command.on ? command.dir : 0;
    return;
  }
  if (command.kind === "scoutBurn") round.burning = command.on;
}

/**
 * Player 2's one press: the mother ship's mouth, open for `scoutMawTicks`.
 *
 * Its own function because whose press counts is the round's rule and the two
 * seats' rules are different — the pilot's two are held and this one is a
 * moment, so a single `if` chain would have read as though either seat could
 * send any of the three.
 */
function scoutMawHeard(round: ScoutState, world: World, command: Command): void {
  if (command.kind === "scoutMaw") round.mawTick = world.tick;
}

export function enterScoutPhase(round: ScoutState, phase: ScoutPhase, beat: number): void {
  round.phase = phase;
  round.phaseBeat = beat;
}
