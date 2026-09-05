import { hullRow } from "./config.js";
import { breachHull } from "./hull.js";
import { enterPhase, type MirrorState, type MirrorVerdictReason } from "./simon.js";
import { MILLI, type World } from "./world.js";

/**
 * How a Simon round ends, and what it costs whoever lost it.
 *
 * Split from `mirror.ts` because that file is the choreography — what the
 * mirror does on a beat — and this is the consequence. They share only the
 * phase helper in `simon.ts`, so nothing here points back at the beat and the
 * beat does not have to know how damage works.
 */

/**
 * The echo strike. The mirror throws the mistake back as a rock out of its own
 * body, into whichever column the cannon is standing in — so the punishment
 * lands where the pair was looking, and it is the ordinary hull breach every
 * missed rock already is: a crater, a crack, and damage that stays.
 */
export function wrong(world: World, m: MirrorState, reason: MirrorVerdictReason): void {
  const col = world.cannonCol;
  m.verdict = -1;
  m.verdictCol = col;
  enterPhase(m, "verdict", world.beat, world.cannonCol);
  breachHull(world, col, "meteorFastest", world.cfg.mirrorRow, world.cfg.damageEcho);
  world.events.push({ type: "mirrorVerdict", right: false, col, reason });
}

/**
 * The same damage model, turned around. A round answered in full breaks the
 * mirror in the column the cannon was standing in when it landed, and takes
 * its share of the mirror's hull — one share per authored round, so the last
 * round is the one that brings it down however many rounds there are.
 */
export function right(world: World, m: MirrorState): void {
  const col = world.cannonCol;
  m.verdict = 1;
  m.verdictCol = col;
  enterPhase(m, "verdict", world.beat, world.cannonCol);

  const done = m.round + 1;
  const total = Math.max(1, m.rounds.length);
  m.hullMilli = Math.max(0, 100 * MILLI - Math.round((done * 100 * MILLI) / total));
  m.scars.push({ col, beat: world.beat, kind: "meteorFastest" });
  if (m.scars.length > world.cfg.maxScars) m.scars.shift();
  world.score += world.cfg.scoreMirrorRound;
  world.events.push({ type: "mirrorVerdict", right: true, col, reason: "step" });
}

/**
 * The verdict is over. A round answered moves on to the next one; a round
 * missed is asked again exactly as it was — the same sequence at the same
 * cadence, because the pair failed to remember it, not to keep up with it.
 */
export function settle(world: World, m: MirrorState): void {
  if (m.verdict === 1) {
    if (m.hullMilli <= 0) {
      world.score += world.cfg.scoreMirrorDown;
      world.boss = null;
      world.events.push({ type: "mirrorDown", col: m.verdictCol });
      return;
    }
    mirrorOpenRound(world, m, m.round + 1);
    return;
  }
  enterPhase(m, "lead", world.beat, world.cannonCol);
}

/**
 * Open a numbered round of the sequence, from the top.
 *
 * The one way in, so the fight's own settle and a caller jumping to a round
 * cannot disagree: `enterPhase`'s `lead` branch is what puts the ship back
 * where the ghost performs from and clears what was answered.
 */
export function mirrorOpenRound(world: World, m: MirrorState, round: number): void {
  m.round = Math.max(0, Math.min(m.rounds.length - 1, round));
  enterPhase(m, "lead", world.beat, world.cannonCol);
}

/** How far above the hull the bait hangs, in tiles. */
const BAIT_TILES_ABOVE_HULL = 4;

/**
 * The bait: a pod hung out where the pair can see it the whole time they are
 * answering, and nowhere near anything they need to look at — hard right, low
 * down, clear of the row of slots and of the mirror itself.
 *
 * It appears with their turn and not before. A pod that had been hanging there
 * since the wave opened was scenery by the time it mattered, and the whole
 * point of it is that it turns up exactly when they have something better to
 * be doing.
 */
export function releaseBait(world: World): void {
  if (world.pods.length > 0) return;
  world.pods.push({
    id: world.nextId++,
    colMilli: (world.cfg.cols - 1) * MILLI,
    rowMilli: (hullRow(world.cfg) - BAIT_TILES_ABOVE_HULL) * MILLI,
    driftMilli: 0,
    loose: false,
    kind: "mend",
  });
}

/**
 * The pair touched the bait. Called by `pods.ts` for both ways of touching it —
 * a shot that frees it and a maw that swallows it — because both are the same
 * mistake: they stopped repeating the sequence to go and get something.
 *
 * Nothing forces them to. That is the trap: it is a free hull repair sitting
 * in plain sight, and the only cost is the round.
 */
export function mirrorBaitTaken(world: World): void {
  const m = world.boss;
  if (m === null || m.kind !== "mirror" || m.phase !== "listen") return;
  wrong(world, m, "bait");
}
