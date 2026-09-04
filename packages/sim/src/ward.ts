import { markMoment } from "./balance.js";
import { bodyCenterCol, type Creature, spanOf } from "./types.js";
import { volleyReturn } from "./volley.js";
import type { World } from "./world.js";

/**
 * **What the shield does with a body it turns**, which used to be one answer
 * and is now two.
 *
 * It was six lines inside `resolveHull` for as long as every warded body was a
 * rock: a rock answered in time scores, pushes a `deflect` and leaves the
 * field, and there was nothing else it could be. THE VOLLEY is the exception,
 * and it is `impact.ts`'s shape read from the other end — that file exists
 * because what a body *costs* the hull stopped being one question, and this
 * one exists because what a ward *does* to a body has stopped being one too.
 * The alternative was a switch over creature kinds living inside the function
 * that resolves the hull, and the third exception would have been written
 * there by pattern rather than by argument.
 *
 * So `hull.ts` asks one question — was it in column and in time — and this
 * file answers what happens next, with every exception owned by its own
 * creature's file and called from here rather than re-derived.
 */

/**
 * A body the shield answered. Returns whether it **stays on the field**.
 *
 * The guard record and the balance moment are taken here rather than at the
 * call site, because they are the same for both answers: the pair did their
 * half, and whether the thing they turned is gone or merely going the other
 * way is a fact about the creature and not about the ward.
 */
export function wardTurns(world: World, c: Creature): boolean {
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  // Paid before the split, because both answers are a deflection: the pair put
  // the shield in the column and the trigger on the beat, and a ward that
  // scored nothing because the thing came back would be the arithmetic telling
  // them their half did not work.
  world.score += world.cfg.scoreDeflect;

  // A volley is hit back up the field rather than off it — a plate of shell
  // comes off and it falls again from higher up, into a column nobody agreed
  // on (`volley.ts`).
  //
  // It gets **no `deflect` event**, and that is a decision rather than an
  // omission: `ingestDeflect` throws a tumbling rock away from the dome
  // (`render/deflect.ts`), and this body is still standing there climbing, so
  // the pair would be shown two of it. `volleyReturn` is the event, and it
  // says the one thing this moment means — that was a ward, and it is coming
  // back.
  if (c.kind === "volley") return volleyReturn(world, c);

  world.events.push({
    type: "deflect",
    col: bodyCenterCol(c, c.col),
    span: spanOf(c),
    kind: c.kind,
    fromRow: c.fromRow,
  });
  return false;
}
