import { NO_GRIP } from "./grip.js";
import { occupiesCol } from "./span.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **The three acts a film aims rather than writes down**, and the one function
 * that resolves them against a world.
 *
 * Cut out of `scene.ts` when the third one arrived and that file went over its
 * limit. The seam is real rather than convenient: next door is what a
 * rehearsal *is* — the script, the loop, the rebuild — and this is the one
 * question that cannot be answered until a world exists. A grip and a lid
 * cord know a column and want an id; a strip marked `atBody` knows the body
 * and wants a column. All three are the same bargain, so they live together.
 */

export interface SceneCommand {
  /** Tick within the loop, 0..`ticks`-1. */
  tick: number;
  player: 1 | 2;
  command: Command;
  /**
   * A grip whose target is found at the moment the hand goes down: the body
   * standing in this column, lowest first.
   *
   * **A grip cannot be authored as an id.** Ids are dealt out by the
   * simulation, and a scene is written years before any world exists — so a
   * rehearsal that wanted to show a hand on a falling rock had nothing to name
   * it by. The column is the thing an author *can* know, because it is the
   * thing they wrote the arrival in. `command` still carries a real
   * `{kind:"grip"}` for the shape of it; this is what fills the id in.
   */
  gripCol?: number;
  /**
   * A drag whose target is a *cord on a body*, found the same way and for the
   * same reason: THE LID is an ordinary arrival, a wave may send three down at
   * once, and the grab has to say which one — by an id no author can know.
   * The column is what they can know. A maze's string and a warden's rope are
   * one of a kind and carry no id at all, so neither sets this.
   */
  dragCol?: number;
  /**
   * A strip press whose column is **the body's**, found at the moment the
   * thumb goes down rather than written into the film.
   *
   * Every other column in a rehearsal is an authored one: `actCol` puts a
   * `SceneAct`'s `col` through `mapCol`, which maps 0..6 onto the real field
   * and, on the eleven columns the game ships, reaches 0, 2, 3, 5, 7, 8 and 10
   * and nothing else. For a strip that is a hole rather than a rounding — a
   * shield authored into column 4 lands in 3 or 5, and a body standing in 4
   * goes past it — and it is what stopped a film being written for THE VOLLEY,
   * whose three wards land eight columns apart with a reflection at each wall:
   * of the eleven possible start columns, none puts every ward column inside
   * the seven a film can name.
   *
   * So this is the third reading of the arrangement `gripCol` and `dragCol`
   * already make. There the author knows the column and cannot know the id;
   * here they know which body the strip is answering and cannot know the
   * column it will be in. Both are resolved out of the world by `SceneRun`,
   * which is the only thing that ever sees one.
   *
   * The body is the one **arriving first**, which is the grip's rule said
   * again: a shield answers what is about to land, and so does a hand. With
   * nothing on the field the press is left as it was written, the way a grip
   * on an empty column is.
   */
  atBody?: true;
}

/**
 * The command as it is actually sent. Everything but the three aimed acts is
 * already whole; a grip is handed the column its author wrote and finds the
 * body standing in it — the lowest one, because a hand goes on the thing that
 * is arriving first — and a strip marked `atBody` is handed the body and finds
 * its column. Nothing there is a hand on nothing, which `setGrip` already
 * treats as a hand let go.
 */
export function aimed(world: World, c: SceneCommand): Command {
  if (c.dragCol !== undefined && c.command.kind === "drag") {
    // The lowest body in the column, as a grip takes: a hand goes on the thing
    // that is arriving first. A cord with no body under it is left as it was
    // written — `lidHeard` treats a target it cannot find as a hand let go,
    // which is exactly what a film that mistimed its grab should look like.
    const on = lowestIn(world, c.dragCol);
    return on === null ? c.command : { ...c.command, id: on.id };
  }
  if (c.atBody && (c.command.kind === "shieldCol" || c.command.kind === "cannonCol")) {
    // An empty field leaves the press exactly as it was written, which is the
    // grip's bargain: a film that mistimed its press should look mistimed
    // rather than be quietly corrected into a column nobody chose.
    const body = arrivingFirst(world);
    return body === null ? c.command : { ...c.command, col: body.col };
  }
  if (c.gripCol === undefined) return c.command;
  const held = lowestIn(world, c.gripCol);
  return { kind: "grip", id: held?.id ?? NO_GRIP };
}

/**
 * The body furthest down the field, or none — the one arriving first.
 *
 * Exported because the drawing needs the same answer: the ghost hand over a
 * strip marked `atBody` has to land where the press lands, and two readings of
 * "which body" would be a finger on one column and a shield in another
 * (`render/src/guide-thumb.ts`).
 */
export function arrivingFirst(world: World): Creature | null {
  return lowestOf(world, undefined);
}

/** The body furthest down this column, or none. Both gestures that are aimed
 * by column want the same one, for the same reason. */
function lowestIn(world: World, col: number): Creature | null {
  return lowestOf(world, col);
}

function lowestOf(world: World, col: number | undefined): Creature | null {
  let held: Creature | null = null;
  for (const body of world.creatures) {
    if (col !== undefined && !occupiesCol(body, col)) continue;
    if (!held || body.row > held.row) held = body;
  }
  return held;
}
