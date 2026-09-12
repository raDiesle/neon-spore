import { clampCol } from "./config-derived.js";
import { spillPrime } from "./lance.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CHOKE**: a tall boneless body that falls straight down one lane,
 * cannot be shot, is not stopped by the shield, and does not break the hull —
 * it **takes the cannon by the throat**. From the beat it is drawn standing
 * on the ship, the cannon strip answers nobody and the cannon walks a column
 * a beat toward one wall, turns there, and walks back, for as long as the
 * choke has it. Player 2 goes on firing the whole time, from wherever the
 * cannon happens to be standing.
 *
 * **What answers it is player 1's thumb, many times.** The strip is dead to
 * a slide, so a press on it is sent as a grab on the choke (`DragTarget`
 * `"choke"`, `render/touch.ts`), and every *fresh* press — a lift between —
 * loosens the grip by one. `chokeTaps` of them and it lets go. A thumb held
 * down is one tap and not a stream, which is what keeps the answer a thing
 * the pair has to keep doing rather than a thing they do once.
 *
 * **It cannot be evaded**, and that is the creature. THE GUM shuts a lane and
 * leaves the cannon; THE JAM keeps the cannon and takes the trigger; this
 * takes the *steering*, and the lane it fell in does not matter — it goes to
 * the cannon wherever the cannon is. So the sentence it makes the pair say
 * is a count and a column: how many taps are left, and where the cannon will
 * be on the beat player 2 wants to fire.
 *
 * It has no fall of its own: it falls by the ordinary fall, lands by the
 * ordinary clamp (`beat.ts`), and `resolveHull` hands it to `chokeLands`
 * instead of to the breach, THE GUM's arrangement exactly. A body nothing
 * can be done to in the air is ungrippable for the reason the gum is
 * (`grippable.ts`).
 */

/** Whether this body is a choke that has the cannon. Absent is not stuck: a
 * choke in the air is a body like any other. */
export function chokeIsStuck(c: Creature): boolean {
  return c.kind === "choke" && c.chokeStuck === true;
}

/** The choke on the cannon, if there is one — the body that swallows the
 * strip (`applyCommand`) and walks the cannon on the beat. */
export function stuckChoke(creatures: readonly Creature[]): Creature | undefined {
  return creatures.find(chokeIsStuck);
}

/** How many fresh taps have landed on this one. Nought before the first. */
export function chokeTapsSoFar(c: Creature): number {
  return c.chokeTaps ?? 0;
}

/** Whether a thumb is down on the strip for this one now. */
export function chokeIsHeld(c: Creature): boolean {
  return c.chokeHeld === true;
}

/** Whether the cannon strip answers a slide. It does not while a choke has
 * the cannon: the press is a tap then, and `chokeHeard` counts it. */
export function chokeSwallows(world: World, c: Command): boolean {
  return c.kind === "cannonCol" && stuckChoke(world.creatures) !== undefined;
}

/**
 * A choke on the ship's row, every beat it is there. It takes hold on the
 * first beat it is drawn standing on the hull — `fromRow` on the ship's row,
 * the beat every other body breaks the hull on — and goes to the cannon:
 * `col` is the cannon's from here, `fromCol` stays the lane it fell, so the
 * picture slides it along the plating to the thing it is taking. A second
 * choke arriving while one has the cannon is not a second grip: the first
 * keeps it, and the second waits on the hull where it landed.
 */
export function chokeLands(world: World, c: Creature, shipRow: number): void {
  if (c.chokeStuck === true || c.fromRow < shipRow) return;
  if (stuckChoke(world.creatures) !== undefined) return;
  c.chokeStuck = true;
  const from = c.col;
  c.col = world.cannonCol;
  c.fromCol = from;
  // Away from the nearer wall first, so the first thing the pair sees is the
  // cannon leaving — a step toward a wall it is standing against would be a
  // turn on the spot, and read as nothing having happened.
  c.chokeDir = world.cannonCol * 2 < world.cfg.cols - 1 ? 1 : -1;
  world.events.push({ type: "chokeGrip", id: c.id, col: c.col, row: c.row, from });
}

/**
 * Which way the cannon goes on its next step: the way it has been going,
 * unless that is into a wall, in which case it turns. Render reads this too,
 * for the light that says where the cannon will be on the beat player 2 has
 * to fire on — so the rule is here once and never worked out again.
 */
export function chokeHeading(cols: number, cannonCol: number, c: Creature): -1 | 1 {
  const dir: -1 | 1 = c.chokeDir ?? 1;
  if (cannonCol + dir < 0 || cannonCol + dir > cols - 1) return dir === 1 ? -1 : 1;
  return dir;
}

/**
 * The choke walking the cannon, on the beat. Called from `step` where the
 * beat is counted, before the fall, so a choke that takes hold this beat is
 * drawn arriving at the cannon for a whole beat before it drags it anywhere.
 *
 * A column a step, turning at each wall; a fill the cannon was holding
 * spills the way it does for a slide (`spillPrime`), because the mark is on
 * a column and the cannon has left it.
 */
export function stepChoke(world: World): void {
  const c = stuckChoke(world.creatures);
  if (c === undefined) return;
  const every = Math.max(1, Math.round(world.cfg.chokeSweepBeats));
  if (world.waveBeat % every !== 0) return;
  const dir = chokeHeading(world.cfg.cols, world.cannonCol, c);
  c.chokeDir = dir;
  const from = world.cannonCol;
  world.cannonCol = clampCol(world.cfg, from + dir);
  c.col = world.cannonCol;
  if (spillPrime(world)) world.events.push({ type: "lanceSpilled", col: from });
}

/**
 * Player 1's thumb on the dead strip, off the wire.
 *
 * The seat is checked here rather than at the hit test, for `gumHeard`'s
 * reason: a device that decided for itself whose gesture a message was would
 * be a device the other one cannot check. A press counts once, on the first
 * message with the thumb down; every message after it from the same hand is
 * the same press until one says the thumb is up. `fromMilli` is not read at
 * all — a tap has no distance.
 */
export function chokeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "choke" || player !== 1) return;
  const c = stuckChoke(world.creatures);
  if (c === undefined) return;
  if (!command.on) {
    c.chokeHeld = undefined;
    return;
  }
  if (c.chokeHeld === true) return;
  c.chokeHeld = true;
  const taps = chokeTapsSoFar(c) + 1;
  c.chokeTaps = taps;
  const of = Math.max(1, Math.round(world.cfg.chokeTaps));
  world.events.push({ type: "chokeTap", col: world.cannonCol, taps, of });
  if (taps < of) return;
  world.creatures = world.creatures.filter((k) => k !== c);
  world.events.push({ type: "chokeFreed", col: world.cannonCol, row: c.row });
}
