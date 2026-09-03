import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GHOST: a body only one screen draws, and the first creature whose secret
 * is **where it is**.
 *
 * THE LURE hides what a body *is* from the navigator, and THE VEIL hides what
 * is *inside* one from the same seat. Both leave the column alone, because in
 * both of them the column was the one thing the pair never had to say — it was
 * on both screens, and what had to be spoken was a colour or a warning about
 * it. This one takes the column away.
 *
 * **Player 1 is the seat that cannot see it, and player 1 holds the cannon.**
 * That is the whole design. The navigator sees the body whole; the pilot is
 * shown a band across the row it is standing in — how long there is, and
 * nothing about which lane (`render/ghost-row.ts`). So the pilot knows exactly
 * when and has no idea where, the navigator knows exactly where and cannot
 * slide the cannon, and the sentence between them is a number said out loud.
 * Nothing else in this game asks for a bare number, which is why this creature
 * is worth a silhouette one of the two players will never see on the field.
 *
 * **It goes upward when it dies.** The owner asked for a balloon let go of,
 * and the picture is the argument: a body player 1 has never seen has to be
 * shown to them at the moment it dies, or the pilot spends a whole wave firing
 * at a rumour. So a kill emits `ghostRelease` beside the ordinary `destroy`,
 * exactly as a veil emits `veilTorn` beside one, and `render/ghost-release.ts`
 * draws the body — on *both* screens — escaping out of the top of the field.
 *
 * ## The two paths
 *
 * A ghost either falls like every other body or **crosses**, and the wave
 * says which (`SpawnEntry.path`). That is one creature and not two because
 * what the pair has to do about it is identical in both: one of them says a
 * column and the other stands in it. What changes is how long that sentence
 * stays true — a falling ghost holds its lane, so the number is said once; a
 * crossing one is a number that expires every beat.
 *
 * A crossing ghost drifts down to `ghostCrossRow` first and then prowls
 * sideways along it, a column a beat. **Each wall it reaches is a crossing**,
 * and it stands there for one beat before turning back — a hesitation, and
 * the beat in which it visibly gets angrier (`ghostRage`). After
 * `ghostChargeLaps` of them it stops prowling, drops its camouflage on both
 * screens and comes straight down the column it is standing in, fast, head
 * first into the hull. That is the only creature in the game that is
 * *counted* rather than watched: three turns, and the pair either took it or
 * did not.
 */

/** Which way along the row a crossing ghost is going. `1` is to the right. */
export type GhostDir = -1 | 1;

/**
 * How a ghost travels, as a wave authors it. Absent on an entry means
 * `"down"`, so every ghost written before crossing existed is byte-for-byte
 * the same arrival — the same arrangement `SpawnEntry.span` has with width.
 */
export type GhostPath = "down" | "across";

/**
 * Whether this body prowls rather than falls. Call it rather than testing
 * `ghostDir` by hand: the presence of that field *is* the path, and a second
 * spelling of that is how a body comes to be stepped twice in one beat.
 */
export function ghostCrosses(c: Creature): boolean {
  return c.ghostDir !== undefined;
}

/** Walls it has already turned at. */
export function ghostLaps(c: Creature): number {
  return c.ghostLaps ?? 0;
}

/**
 * Whether it has given up on prowling and is coming down at the ship.
 *
 * A rule and not a flag, for `throbIsOpen`'s reason: the lap count is already
 * the state, and a second field saying the same thing is a second field that
 * can disagree with it — here, between the picture that drops the camouflage
 * and the step that decides which way the body moves.
 */
export function ghostIsCharging(cfg: SimConfig, c: Creature): boolean {
  return ghostCrosses(c) && ghostLaps(c) >= cfg.ghostChargeLaps;
}

/**
 * How far through its temper this one is, 0..1. render/ reads it for
 * everything that gets worse as the turns go by, so the picture and the count
 * are one number rather than two.
 */
export function ghostRage(cfg: SimConfig, c: Creature): number {
  if (cfg.ghostChargeLaps <= 0) return 1;
  return Math.min(1, ghostLaps(c) / cfg.ghostChargeLaps);
}

/**
 * The fields a crossing ghost arrives with, or nothing at all for one that
 * falls. It sets off **away from the nearer wall**, so the first crossing is
 * the long one — a ghost authored in the second column that turned after one
 * beat would have spent a third of its temper before anybody had said a word.
 *
 * Deterministic, from the column and the field width alone. Nothing here is
 * rolled: which way it is going is on player 2's screen from the first frame,
 * and the whole of what the pair does not share is *which column*.
 */
export function ghostOnSpawn(cols: number, col: number): { ghostDir: GhostDir; ghostLaps: number } {
  return { ghostDir: col * 2 < cols - 1 ? 1 : -1, ghostLaps: 0 };
}

/**
 * One beat of a crossing ghost, in place of the fall every other body takes.
 * Three phases and they are read in order: coming in, prowling, and the dive.
 */
export function stepGhostAcross(world: World, c: Creature): void {
  const cfg = world.cfg;
  if (ghostIsCharging(cfg, c)) {
    // Head first, straight down the column it turned in. Deliberately not
    // through `grippedFallTiles`: a crossing ghost refuses a hand the whole
    // way (`setGrip`), so there is no hold here for a brake to scale.
    c.row += cfg.ghostDiveTiles;
    return;
  }
  if (c.row < cfg.ghostCrossRow) {
    // Still coming in. It drifts down to the row it prowls along at the
    // ordinary one tile a beat, so the arrival reads as the same fall every
    // other body makes and the turn sideways is the surprise.
    c.row += 1;
    return;
  }

  const dir = c.ghostDir ?? 1;
  const wall = dir > 0 ? cfg.cols - 1 : 0;
  const next = c.col + dir * cfg.ghostCrossCols;
  if (next >= 0 && next <= cfg.cols - 1) {
    c.col = next;
    return;
  }
  if (c.col !== wall) {
    // A stride that would overshoot lands *on* the wall instead of turning
    // short of it. Without this a field whose width is not a whole number of
    // strides would have the body turn a column early, which reads as a wall
    // nobody can see — and the two players are talking about columns.
    c.col = wall;
    return;
  }

  // Standing on the wall with nowhere to go. It spends this beat turning,
  // which is the beat the pair has to notice: `ghostTurn` is what the ear gets
  // and `ghostLaps` is what the picture reads.
  c.ghostDir = dir === 1 ? -1 : 1;
  c.ghostLaps = ghostLaps(c) + 1;
  world.events.push({ type: "ghostTurn", col: c.col, row: c.row, laps: c.ghostLaps });
  if (ghostIsCharging(cfg, c)) {
    // It stops hiding here, on both screens (`showsGhostBody`), because a hull
    // hit nobody could see coming is a hull hit the pair cannot learn from.
    world.events.push({ type: "ghostCharge", col: c.col, row: c.row });
  }
}

/**
 * What this body costs the hull when it reaches it. A charging ghost is the
 * one arrival in the game that *aimed* at the ship, so it costs more than a
 * slick that merely arrived — and every other body, ghost or not, costs
 * exactly what it always did.
 */
export function ghostImpactDamage(cfg: SimConfig, c: Creature): number {
  return ghostIsCharging(cfg, c) ? cfg.damageGhostDive : cfg.damageCreature;
}

/**
 * A shot met a ghost. Returns whether the bullet goes on, the same contract
 * `resolve` has — a lance that killed it carries on up the column, because
 * what stopped it was the body and the body is gone.
 *
 * It lives here rather than in `bullet-hit.ts` for `veilStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function ghostStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color !== b.color) {
    // An ordinary colour miss, deliberately. The ammunition is not this
    // creature's question — player 2 can see the body and therefore its colour
    // the whole way down — so a wrong one here is the same mistake it would be
    // against a slick, and it is scored as one.
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  world.score += world.cfg.scoreGhostKill;
  // Two events on one tick, and two pictures: the body letting go and climbing
  // out of the top of the field (`ghost-release.ts`), and the ordinary destroy
  // burst throwing its colour away from the tile it left. The kill is a kill —
  // same burst, same sound, same balance — and this is the escape that comes
  // off the top of it.
  world.events.push({ type: "ghostRelease", col: hit.col, row: hit.row, color: b.color });
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  removeCreature(world, hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}
