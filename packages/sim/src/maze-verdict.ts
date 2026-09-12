import { breachHull } from "./hull.js";
import { mazeBottomCol } from "./maze.js";
import { enterMazePhase, type MazeState, mazeHeartColor } from "./maze-round.js";
import { type CreatureKind, livingKindForColor } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * How an attempt on THE MAZE ends, and what it costs.
 *
 * Its own file because `maze-round.ts` was past the ceiling `CLAUDE.md` sets,
 * and along the seam already there: next door is the round's *clock* — four
 * phases and a shot walking — and this is the three ways out of it. Nothing
 * here reads a wheel; everything here writes a hull.
 */

/**
 * Why an attempt was lost: a dead end, the wrong colour at the heart, or
 * nothing fired at all. All three cost the hull the same; what they are for is
 * the picture — a dead end shakes the drum apart, a silence brings it down,
 * the wrong colour is a gout of the heart's blood — and the sentence the pair
 * says before the wave is played again, which is different in each case.
 *
 * The list is ordered rather than a bare union because `mazeHashParts` sends
 * the *index* over the wire, the way `MAZE_PHASES` is sent.
 */
export const MAZE_REASONS = ["mouth", "color", "silence"] as const;
export type MazeVerdictReason = (typeof MAZE_REASONS)[number];

/**
 * The kind the drum's own wreckage is filed under, and it is deliberately not
 * a rock.
 *
 * `breachHull` hands render/ a `kind`, and the only question render/ ever asks
 * it is whether to wait for a falling rock before bursting and cracking
 * (`effects-breach.ts`, `scars.ts`). A rock replayed on top of this one would
 * be **two arrivals for one failure**: the maze is already the thing falling,
 * drawn coming down the field by `render/maze-fall.ts`, and a meteor dropping
 * through it is exactly the picture the owner asked to be rid of. So the
 * breach is filed under the broken wheel it is — a `gyre` is the hub of a
 * turning wheel, which is the nearest thing on the roster to a drum in pieces
 * — and render/ bursts and cracks the hull on the beat this is called.
 */
const MAZE_WRECK: CreatureKind = "gyre";

/**
 * A dead end, the wrong colour, or nothing at all. Three failures, and each
 * one now reaches the hull as the thing that actually did it.
 *
 * **A dead end sends the shot back**, out of the column it went up, as the
 * rock this game has always answered a wrong step with.
 *
 * **The wrong colour is thrown back by the heart**, so what breaks the ship is
 * the heart's own blood and it is filed as the living body of that colour: no
 * meteor, and the burst at the hull carries the colour of the thing that made
 * it rather than a generic damage red. What the pair sees is a gout of it
 * across the maze and down the ship (`render/maze-spill.ts`) — the owner asked
 * for exactly that in place of the rock that used to fall here.
 *
 * **The clock running out is not paid for here at all**: the drum comes down
 * on the ship for that one, and a fall is paid for when it lands rather than
 * when it lets go (`mazeSettle` below, and *a body is resolved when it is seen
 * to touch*). The column it lands in is the one the drum *stands over* rather
 * than wherever the cannon happened to be parked, because that is where the
 * mass is.
 */
export function mazeWrong(world: World, m: MazeState, reason: MazeVerdictReason): void {
  const aimed = m.lockedCol < 0 ? world.cannonCol : m.lockedCol;
  const col = reason === "silence" ? mazeBottomCol(world.cfg) : aimed;
  m.verdict = -1;
  m.verdictCol = col;
  m.lost = reason;
  enterMazePhase(m, "verdict", world.beat);
  if (reason === "mouth") {
    breachHull(world, col, "meteorFastest", world.cfg.mazeRow, "heavy");
  }
  if (reason === "color") {
    const blood = mazeHeartColor(m.round);
    const kind = livingKindForColor(blood);
    breachHull(world, col, kind, world.cfg.mazeRow, "heavy", blood);
  }
  world.events.push({ type: "mazeVerdict", right: false, col, reason });
}

/** The shot reached the middle. It takes its share of the maze's hull — one per
 * authored wheel, so the last one brings it down however many there are. */
export function mazeRight(world: World, m: MazeState): void {
  const col = m.lockedCol;
  m.verdict = 1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);

  m.lost = null;

  const done = m.round + 1;
  const total = Math.max(1, m.rounds.length);
  m.hullMilli = Math.max(0, 100 * MILLI - Math.round((done * 100 * MILLI) / total));
  m.scars.push({ col, beat: world.beat, kind: "meteorFastest" });
  if (m.scars.length > world.cfg.maxScars) m.scars.shift();
  world.events.push({ type: "mazeVerdict", right: true, col, reason: "mouth" });
}

/**
 * The verdict is over, and there are two ways on from it.
 *
 * **The middle moves the fight to the next wheel.** That is the only way
 * forward there is.
 *
 * **A lost stage is the round's verdict and nothing after it.** A dead end
 * and the wrong colour hit the hull the beat they are judged (`mazeWrong`),
 * and a hit is the wave lost (`wave-fail.ts`): the field holds from that
 * tick, so this is never reached for either of them, and the whole wave is
 * played again from the top — which is where the *same stage over again*
 * that a dead end used to build for itself now comes from. The clock running
 * out is paid for here rather than three beats earlier: the drum comes down
 * on the ship across the verdict (`render/maze-fall.ts`) and the hull is
 * broken on the beat the pieces land, which is the rule every other arrival
 * on this field already follows — and then the drum is gone, because a drum
 * that landed on the ship is not standing anywhere. Taking it off the world
 * is also what a held hull sees (`hullInvulnerable`, the director's poses and
 * the game's own testing box): the round is over, lost, and the empty field
 * ends the wave the way a round's clock running out already did.
 */
export function mazeSettle(world: World, m: MazeState): void {
  if (m.verdict !== 1) {
    if (m.lost === "silence") {
      breachHull(world, m.verdictCol, MAZE_WRECK, world.cfg.mazeRow, "heavy");
    }
    world.boss = null;
    return;
  }
  if (m.hullMilli <= 0) {
    world.boss = null;
    world.events.push({ type: "mazeDown", col: m.verdictCol });
    return;
  }
  mazeOpenRound(world, m, m.round + 1);
}

/**
 * Stand the wheel up on a numbered round, from the top.
 *
 * The one way in to a round of this fight, so the fight's own settle and a
 * caller jumping to a sheet cannot disagree about what a round *is*: the angle
 * comes off the new wheel's `startMilli` and the lock, the way and the step go
 * (`enterMazePhase`'s `lead` branch). Writing `round` and leaving the rest is
 * how the drum comes up at the last round's angle with its lock still on.
 */
export function mazeOpenRound(world: World, m: MazeState, round: number): void {
  m.round = Math.max(0, Math.min(m.rounds.length - 1, round));
  enterMazePhase(m, "lead", world.beat);
}
