import { breachHull } from "./hull-damage.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LIMPET and THE LEECH**: two bodies that fall straight down one lane,
 * cannot be shot, are not stopped by the shield, and do not break the hull
 * when they land — they **take hold of a control and go off if it stands
 * still**. The limpet goes to the shield's plate, the leech to the cannon;
 * from the beat one is drawn standing on the ship it rides with its control,
 * and every beat the control is found in the column it was in the beat
 * before is a beat of the fuse. `limpetStillBeats` of those and it goes off:
 * a heavy hit on the hull at the control's column, and the wave is lost
 * (`wave-fail.ts`). A beat the control is found in a *different* column puts
 * the fuse back to nought and is one move of `limpetShakeMoves`; that many
 * and it lets go. A move is counted once per beat however far the control
 * went, THE CHOKE's rule for a tap: a stream of small slides inside one beat
 * is one move, so the answer is a thing the pair has to keep doing.
 *
 * **Only the seat without the control is shown the fuse.** The plate is
 * player 2's and the fuse on a limpet is drawn on player 1's screen alone;
 * the cannon is player 1's and the fuse on a leech is drawn on player 2's.
 * The seat that can move sees the body and not how long it has left, and the
 * word that crosses the voice delay is *move* — said before the count runs
 * out, by somebody who can see it running (`render/cling.ts`). That is the
 * creature: the choke made a count the tapping seat could read for itself;
 * this makes one the moving seat cannot.
 *
 * **They cannot be evaded.** The lane they fall in does not matter — each
 * goes to its control wherever the control is, THE CHOKE's arrangement — and
 * there is no column to stand in, only the standing itself to give up.
 *
 * Both fall by the ordinary fall, land by the ordinary clamp (`beat.ts`),
 * and `resolveHull` hands them here instead of to the breach, THE GUM's
 * arrangement exactly. One module and two kinds, because the difference
 * between them is which column is read, and one file saying so twice would
 * be two places for the rule to drift apart.
 */

export type ClingKind = "limpet" | "leech";

/** Whether this kind is one of the two clingers. */
export function isClingKind(kind: CreatureKind): kind is ClingKind {
  return kind === "limpet" || kind === "leech";
}

/** Whether this body has hold of its control. Absent is not stuck: one in
 * the air is a body like any other. */
export function clingIsStuck(c: Creature): boolean {
  return isClingKind(c.kind) && c.clingStuck === true;
}

/** The clinger of `kind` on its control, if there is one. */
export function stuckClinger(
  creatures: readonly Creature[],
  kind: ClingKind,
): Creature | undefined {
  return creatures.find((c) => c.kind === kind && c.clingStuck === true);
}

/** The column of the control this kind takes: the plate's or the cannon's. */
export function clingControlCol(world: World, kind: ClingKind): number {
  return kind === "limpet" ? world.shieldCol : world.cannonCol;
}

/** Beats the control has stood still under this one. Nought on landing. */
export function clingStillBeats(c: Creature): number {
  return c.clingStill ?? 0;
}

/** Moves counted against this one so far. Nought on landing. */
export function clingMovesSoFar(c: Creature): number {
  return c.clingMoves ?? 0;
}

/** The fuse's length for this kind, whole beats, at least one. */
export function clingFuse(world: World, kind: ClingKind): number {
  const n = kind === "limpet" ? world.cfg.limpetStillBeats : world.cfg.leechStillBeats;
  return Math.max(1, Math.round(n));
}

/** How many moves shake this kind off, at least one. */
export function clingShake(world: World, kind: ClingKind): number {
  const n = kind === "limpet" ? world.cfg.limpetShakeMoves : world.cfg.leechShakeMoves;
  return Math.max(1, Math.round(n));
}

/**
 * A clinger on the ship's row, every beat it is there. It takes hold on the
 * first beat it is drawn standing on the hull — `fromRow` on the ship's row,
 * the beat every other body breaks the hull on — and goes to its control:
 * `col` is the control's from here, `fromCol` stays the lane it fell, so the
 * picture slides it along the plating to the thing it is taking. A second
 * one of the same kind arriving while the first has the control waits on
 * the hull where it landed, THE CHOKE's rule.
 */
export function clingLands(world: World, c: Creature, shipRow: number): void {
  if (!isClingKind(c.kind) || c.clingStuck === true || c.fromRow < shipRow) return;
  if (stuckClinger(world.creatures, c.kind) !== undefined) return;
  c.clingStuck = true;
  const from = c.col;
  c.col = clingControlCol(world, c.kind);
  c.fromCol = from;
  c.clingLastCol = c.col;
  c.clingStill = 0;
  c.clingMoves = 0;
  world.events.push({ type: "clingGrip", id: c.id, kind: c.kind, col: c.col, row: c.row, from });
}

/**
 * Every clinger on its control, on the beat. Called from `step` where the
 * beat is counted, before the fall — so one that takes hold this beat is
 * not judged until the next, and the first beat of its fuse is a beat the
 * pair has seen it standing there.
 *
 * The control's column now against the column it was in a beat ago: the
 * same is a beat of the fuse, different is a move. A move on the beat the
 * fuse would have run out is a move: the pair that says it on the last beat
 * is in time.
 */
export function stepClingers(world: World): void {
  for (const c of [...world.creatures]) {
    if (!isClingKind(c.kind) || c.clingStuck !== true) continue;
    const kind = c.kind;
    const at = clingControlCol(world, kind);
    const moved = at !== (c.clingLastCol ?? at);
    c.clingLastCol = at;
    c.col = at;
    if (moved) {
      c.clingStill = 0;
      const moves = clingMovesSoFar(c) + 1;
      c.clingMoves = moves;
      const of = clingShake(world, kind);
      world.events.push({ type: "clingShake", kind, col: at, moves, of });
      if (moves < of) continue;
      world.creatures = world.creatures.filter((k) => k !== c);
      world.events.push({ type: "clingFreed", kind, col: at, row: c.row });
      continue;
    }
    const still = clingStillBeats(c) + 1;
    c.clingStill = still;
    if (still < clingFuse(world, kind)) continue;
    world.creatures = world.creatures.filter((k) => k !== c);
    breachHull(world, at, kind, c.row, "heavy");
    world.events.push({ type: "clingBlast", kind, col: at, row: c.row });
  }
}
