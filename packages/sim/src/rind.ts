import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import type { Bullet, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE RIND: the first body that does not die to the shot that hits it, and the
 * first whose health is its own size.
 *
 * It is a slick or a bulb — the authored colour says which — arriving three
 * times the size of one. A shot in the matching colour takes a layer off
 * instead of killing it: three sizes, two sheds, and the third shot kills the
 * ordinary body that is left exactly the way an ordinary body dies. Nothing
 * about the aim changes at any point; what changes is that the column the pair
 * closed is not closed.
 *
 * **The mistake it exists to punish is "landed, next".** Every other aim
 * target in the game is answered by one call and one shot, so the pair learns
 * to spend a column and move on — and the whole of this creature is that the
 * cannon has to stay where it was for two more beats while player 2 loads the
 * same colour twice more. That is the sentence the wave makes somebody say:
 * *again*, and then *again*.
 *
 * **The size is the health bar, and that is why there is no health bar.** The
 * conversion argued for it on the tower-defence page (`docs/tower-defence.md`,
 * the `RIND` row, off the Bloons ceramic whose shell visibly cracks): a number
 * over a body is a thing to read, and a body that is plainly *smaller than it
 * was* is a thing to see, from either seat, at the size a phone draws it. So
 * `rindLayers` is the only state this creature carries, and render draws one
 * body's footprint per layer still on it (`livingBodyMul`).
 *
 * **The column is untouched by any of it.** A rind occupies one tile like
 * every other living body — the size is a picture of what is left and never a
 * claim on the field — so a shot lands by column, the hull is breached by
 * column, and the number player 2 says out loud means the same thing it always
 * meant. A body that grew across its neighbours' lanes would be a second, much
 * larger creature, and it is not this one.
 */

/**
 * How many layers this body still sheds before a shot kills it. Absent on
 * every other kind, and zero on a rind that has been cut down to size — which
 * is the only state in which it is an ordinary slick or bulb.
 *
 * Call this rather than reading `c.rindLayers` by hand: the count is what the
 * size, the shed and the kill all read, and a second spelling of the fallback
 * is how the picture and the shot come to disagree about whether the next one
 * finishes it.
 */
export function rindLayersLeft(c: Creature): number {
  return c.rindLayers ?? 0;
}

/** The fields a rind arrives with: every layer ahead of it. */
export function rindOnSpawn(cfg: SimConfig): { rindLayers: number } {
  return { rindLayers: cfg.rindLayers };
}

/**
 * The body a rind is drawn as — the slick or the bulb its authored colour
 * names. Reached through `wornKind` and never called at a draw site directly,
 * for the reason every other worn body has one: what a thing *is* and what it
 * *looks like* are two questions, and a second copy of the pairing is how a
 * body comes to be drawn in a colour a shot does not match.
 *
 * A slick for a rind built without a colour, the same fallback `echoBecomes`
 * reaches for and for the same reason: a body has to be drawn as some body.
 * Nothing in the game builds one — a wave authors red or cyan.
 */
export function rindBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * A shot met a rind. Returns whether the bullet goes on, the same contract
 * `resolve` has.
 *
 * **A shed stops the shot, a lance included.** What stopped it is the layer,
 * and a layer is a body's worth of material however thin it looks by the third
 * one — a lance that tore through the whole ladder in one press would take the
 * three-shot sentence out of the creature and leave a large slick behind.
 * Only the kill at the end passes a lance on, exactly as an ordinary body's
 * does.
 *
 * A wrong colour is an ordinary colour miss at every size. Both players see a
 * rind whole and both see what colour it is, so getting it wrong is the same
 * mistake it would be against a slick and is scored as one.
 *
 * It lives here rather than in `bullet-hit.ts` for `echoStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function rindStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  const left = rindLayersLeft(hit) - 1;
  if (left >= 0) {
    hit.rindLayers = left;
    world.score += world.cfg.scoreRindShed;
    world.events.push({
      type: "rindShed",
      col: hit.col,
      row: hit.row,
      color: b.color,
      left,
    });
    return false;
  }

  // Bare, and killed the way a slick is killed: the same score, the same
  // event, the same burst. Deliberately not a kill of its own — the last shot
  // at a rind is an ordinary shot at an ordinary body, and the pair has to be
  // able to feel that it is over.
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}
