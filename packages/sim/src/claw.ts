import {
  CLAW_NOTHING,
  CLAW_POD,
  CLAW_ROCK,
  clawDeal,
  clawDrift,
  clawHoldAt,
  clawOnRail,
  clawPodsLeft,
  clawStartCell,
} from "./claw-field.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CLAW: the one where nothing on either screen has a name.
 *
 * A salvage rail over a field of buried wreckage. **Player 1 works the machine
 * and is shown nothing but sockets — he moves the claw a socket a press and
 * drops it. Player 2 is shown what is in every socket and has no button at
 * all.** So the whole round is one person saying "left — left — no, one more —
 * now" and the other person doing exactly that and nothing else.
 *
 * A ninth boss for a ninth question. The Queen is about **what you know**, THE
 * MIRROR about **what you remember**, The Warden about **what your hands are
 * free to do**, THE VANE about **what you can still say when the words no
 * longer line up**, THE GAUGE about **committing to what you have been
 * saying**, THE FLEET about **giving directions**. This one is about
 * **giving them without a vocabulary**: THE FLEET's chart is lettered across
 * and numbered down, so a direction there can always collapse into a
 * coordinate and be said once. Nothing here is labelled and nothing here holds
 * still, so a direction is only ever true for as long as it takes to say.
 *
 * **The wrecks shift, and that is the round.** Every `clawDriftBeats` one of
 * them moves a socket, and only player 2 sees it happen (`claw-field.ts`,
 * `clawDrift`). A sentence begun before a shift is wrong by the time it lands,
 * which is why the pair ends up talking in corrections rather than in
 * instructions — and it is the whole of what makes this a different round from
 * THE FLEET rather than the same one with the labels rubbed off.
 *
 * **Nothing the players control travels a field**, and this one has no field
 * to travel: the rail is a hull by another name and the claw slides along it
 * with the cannon's exact verb, a socket at a time (`docs/decisions.md` #21).
 *
 * `claw-field.ts` is the wreck field; this is only what moves.
 */

/** Before any grab, far enough back that the first one is never held off. */
const NEVER_GRABBED = -1_000_000;

/**
 * The parts of the round, and they are THE GAUGE's four for THE GAUGE's
 * reasons: a lead-in so the pair can read two screens that have just stopped
 * being the field, the play, a verdict, and `spent` — the round over and only
 * being looked at, holding its own picture until the next wave replaces it.
 *
 * Choreography rather than difficulty, which is why the beat counts beside
 * them in `claw-round.ts` are constants and not `SimConfig` fields.
 */
export const CLAW_PHASES = ["lead", "play", "verdict", "spent"] as const;
export type ClawPhase = (typeof CLAW_PHASES)[number];

/**
 * Everything the round remembers between beats. A `BossState` like the other
 * eight — THE CLAW is a boss wave, so the round *is* the wave and there is no
 * gap number to carry (`boss-state.ts` has the union).
 */
export interface ClawState {
  kind: "claw";
  phase: ClawPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on — the round's own clock. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** What is buried in each socket, as indices into `CLAW_HOLDS`. */
  cells: number[];
  /** The socket the claw hangs over. Player 1's, and only player 1's. */
  cell: number;
  /** Pods raised. Raising the last one is the round. */
  pods: number;
  /**
   * Rocks raised. Each one cost the hull, and the count is what the verdict
   * reads to say what the fishing cost.
   */
  rocks: number;
  /** `world.beat` of the most recent grab, for the rest between two of them. */
  grabBeat: number;
  /** The socket it went down into, `-1` before the first. render/ only. */
  grabCell: number;
  /** And what came up out of it, as an index into `CLAW_HOLDS`. render/ only. */
  grabHold: number;
  /** `world.beat` the field last shifted on. */
  driftBeat: number;
  /**
   * The socket a wreck left and the one it arrived in, `-1` before the first
   * shift. render/ only — player 2's screen slides the thing across, and player
   * 1's has nothing to draw it with.
   */
  driftFrom: number;
  driftTo: number;
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function clawRound(world: World): ClawState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "claw" ? boss : null;
}

/** Beats left on the clock. Never below zero; the display and the round both ask. */
export function clawBeatsLeft(world: World, b: ClawState): number {
  return Math.max(0, world.cfg.clawRoundBeats - (world.beat - b.openBeat));
}

/**
 * Whether the claw is down in a socket. Derived from the beat of the last grab
 * rather than stored, so there is no second copy of the rest to disagree with
 * `grab` and nothing a restart could leave hanging open.
 */
export function clawDown(world: World, b: ClawState): boolean {
  return world.beat - b.grabBeat < world.cfg.clawGrabRestBeats;
}

export function openClaw(world: World): ClawState {
  return {
    kind: "claw",
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    cells: clawDeal(world.rng, world.cfg),
    cell: clawStartCell(world.cfg),
    pods: 0,
    rocks: 0,
    grabBeat: NEVER_GRABBED,
    grabCell: -1,
    grabHold: CLAW_NOTHING,
    driftBeat: world.beat,
    driftFrom: -1,
    driftTo: -1,
  };
}

/**
 * One beat of the round, and whether it is over: `true` cleared, `false` out
 * of time, `null` still going.
 *
 * The claw answers a press on the *tick* — a machine that only moved on the
 * beat would feel like a queue rather than a hand on something — and the field
 * shifts on the beat, deliberately: a wreck that slid every tick would be a
 * thing that drifts rather than a thing that steps, and the pair can only talk
 * about the steps.
 */
export function stepClaw(world: World, b: ClawState, onBeat: boolean): boolean | null {
  if (onBeat && world.beat - b.driftBeat >= world.cfg.clawDriftBeats) {
    b.driftBeat = world.beat;
    const moved = clawDrift(world.rng, b.cells);
    if (moved !== null) {
      b.driftFrom = moved.from;
      b.driftTo = moved.to;
    }
  }
  if (clawPodsLeft(b.cells) === 0) return true;
  if (clawBeatsLeft(world, b) === 0) return false;
  return null;
}

/**
 * One control, as the round heard it.
 *
 * **Both verbs are player 1's, and player 2 has none.** That is not an
 * oversight and it is the one thing this round does that no other does: the
 * seat holding the whole map has no way to touch the machine, so everything
 * that happens on either screen happened because somebody said it out loud and
 * somebody else believed them. The seat check is a rule of the simulation
 * rather than a coat of paint on the picture, exactly as THE GAUGE's and THE
 * FLEET's are — both devices have to agree precisely which presses counted.
 */
export function clawHeard(world: World, b: ClawState, player: 1 | 2, command: Command): void {
  if (player !== 1) return;
  if (command.kind === "clawStep") {
    // The claw never travels while it is down. A machine that could be walked
    // along the rail with its fingers in a socket is a machine nobody has to
    // wait for, and the wait is what the rest between two grabs is for.
    if (clawDown(world, b)) return;
    const cell = b.cell + Math.sign(command.dir);
    if (clawOnRail(world.cfg, cell)) b.cell = cell;
    return;
  }
  if (command.kind !== "clawGrab") return;
  grab(world, b);
}

/**
 * A grab into whichever socket the claw is standing over.
 *
 * Two grabs in a row cost the rest between them whether the first found
 * anything or not, so a thumb held on the button is slower than a pair who
 * talk — THE GAUGE's call rule and THE FLEET's salvo rule, and the reason all
 * three exist is the same one.
 *
 * **Every grab spends the socket**, including one that came up empty. A field
 * that put the wreck back would let the pair sweep the rail end to end and
 * find everything without saying a word; a socket that is spent is one more
 * thing the navigator has to describe the field around from then on.
 */
function grab(world: World, b: ClawState): void {
  if (clawDown(world, b)) return;
  const cfg = world.cfg;
  const cell = b.cell;
  const hold = clawHoldAt(b.cells, cell);
  b.grabBeat = world.beat;
  b.grabCell = cell;
  b.grabHold = hold;
  b.cells[cell] = CLAW_NOTHING;

  if (hold === CLAW_POD) {
    b.pods += 1;
    world.score += cfg.scoreClawPod;
    if (clawPodsLeft(b.cells) === 0) world.score += cfg.scoreClawClear;
    return;
  }
  if (hold !== CLAW_ROCK) return;
  b.rocks += 1;
  // A wreck brought up on the deck. The middle column, because the round has
  // no columns of its own — the same call THE GAUGE and THE FLEET make when a
  // round with no field has to cost the ship something, and the scar is what
  // makes it read: it is still there when the field comes back.
  breachHull(world, midCol(cfg), "meteorFastest", 0, cfg.damageClawRock);
}
