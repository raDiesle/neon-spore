import { hullRow } from "./config.js";
import type { Pod } from "./pod-types.js";
import type { Color, Creature } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE GLUTTON: it eats your pods if you are slow.
 *
 * The owner's SUCK page of 16 October 2026 (`docs/spec/suck-ideas.md`), built
 * at his word "build all". A slow body in one colour that comes down toward
 * the nearest hanging pod, a column a beat sideways and a row every
 * `gluttonFallBeats`. If it reaches one first it eats it: the pod is gone and
 * so is the wave's debt for it, and the body is one size bigger — one more
 * matching shot to kill. So the navigator's choice is which to shoot first,
 * the pod or the glutton, and the pilot's is whether to stand under the pod or
 * under the bigger shot.
 *
 * **Only a hanging real pod is food.** One already falling is on its way to
 * the maw and out of reach, and a husk is a lie the glutton is not told. A
 * meal is not a lost pod: no `podLost`, no failed wave — the debt simply goes,
 * which is what makes letting it eat a trade rather than a mistake.
 */

/** How many pods it has eaten, never negative and nought on any other kind. */
export function gluttonFed(c: Creature): number {
  return c.gluttonFed ?? 0;
}

/** The hanging pod it is going for: the nearest one at or below its row, by
 * rows and then columns, and the first spawned on a tie. */
function food(world: World, c: Creature): Pod | undefined {
  let best: Pod | undefined;
  let bestCost = Number.POSITIVE_INFINITY;
  for (const p of world.pods) {
    if (p.loose || p.kind !== "pod") continue;
    const row = Math.round(p.rowMilli / MILLI);
    if (row < c.row) continue;
    const cost = (row - c.row) * 1000 + Math.abs(Math.round(p.colMilli / MILLI) - c.col);
    if (cost < bestCost) [best, bestCost] = [p, cost];
  }
  return best;
}

/**
 * Its whole beat, in place of the ordinary fall (`slow-fall.ts`): a column
 * toward its food, a row on the beats it falls, and then a meal if it is
 * standing on one. Always `true`: the caller must not drop it again.
 */
export function gluttonStep(world: World, c: Creature): boolean {
  const target = food(world, c);
  if (target) {
    const col = Math.round(target.colMilli / MILLI);
    if (col !== c.col) c.col += col < c.col ? -1 : 1;
  }
  if (world.beat % Math.max(1, world.cfg.gluttonFallBeats) === 0) {
    c.row = Math.min(c.row + 1, hullRow(world.cfg));
  }
  eat(world, c);
  return true;
}

function eat(world: World, c: Creature): void {
  const meal = world.pods.find(
    (p) =>
      !p.loose &&
      p.kind === "pod" &&
      Math.round(p.colMilli / MILLI) === c.col &&
      Math.round(p.rowMilli / MILLI) === c.row,
  );
  if (!meal) return;
  world.pods = world.pods.filter((p) => p !== meal);
  c.gluttonFed = gluttonFed(c) + 1;
  world.events.push({ type: "gluttonFeeds", col: c.col, row: c.row });
}

/**
 * A matching shot met one. A fed glutton gives a meal back and stays — `true`,
 * the shot is spent — and a hungry one is left to the ordinary kill.
 */
export function gluttonShrinks(world: World, c: Creature, color: Color): boolean {
  const fed = gluttonFed(c);
  if (fed === 0) return false;
  c.gluttonFed = fed - 1;
  world.events.push({ type: "gluttonShrinks", col: c.col, row: c.row, color });
  return true;
}
