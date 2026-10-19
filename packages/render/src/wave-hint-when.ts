import type { HintWhen } from "@neon-spore/content";
import {
  type Creature,
  type CreatureKind,
  gripCount,
  inMawReach,
  MILLI,
  morselIsLimp,
  spanOf,
  type World,
} from "@neon-spore/sim";
import { showsHuskMark } from "./husk-look.js";
import type { Layout } from "./layout.js";
import { podInQuestion, secretShown } from "./wave-hint-seen.js";

/**
 * **The states a hint line can be true in, read** (`HintWhen`). Split from
 * `wave-hint.ts` at its length ceiling, along its one table: that file says
 * which line a screen shows, this says what each `when` means.
 */

/** What a lesson is about where it names it: a kind of body, or the pods (`HINTS_ABOUT`). */
export type HintsAbout = CreatureKind | "pod" | undefined;

/** What a state is read off: the world, its next body, and the screen if there is one. */
export interface Reading {
  world: World;
  next: Creature | null;
  l?: Layout | undefined;
}

/**
 * The body nearest the hull, or nothing on an empty field — of the kind a
 * lesson is about where it names one, so TAP's column states are about its
 * blister and never the bulb under it.
 */
export function lowest(world: World, about: HintsAbout): Creature | null {
  const kind = about === "pod" ? undefined : about;
  let low: Creature | null = null;
  for (const c of world.creatures) {
    if (kind !== undefined && c.kind !== kind) continue;
    if (!low || c.row > low.row) low = c;
  }
  return low;
}

/**
 * What has left the field on this try — of `about` where a lesson names it,
 * else any body: the script's spawned rows of it, less what of it still
 * stands. A try begun again puts both back to nought (`sim/wave-start.ts`).
 */
export function gone(world: World, about: HintsAbout): number {
  if (about === "pod") return world.podSpawned - world.pods.length;
  if (about === undefined) return world.spawned - world.creatures.length;
  let sent = 0;
  for (let i = 0; i < world.spawned; i++) if (world.queue[i]?.kind === about) sent++;
  return sent - world.creatures.filter((c) => c.kind === about).length;
}

/** Whether a column is under a body, any column of its width (`spanOf`). */
function under(col: number, c: Creature): boolean {
  const half = (spanOf(c) - 1) / 2;
  return col >= c.col - half && col <= c.col + half;
}

const handOn = (world: World) => world.creatures.some((c) => gripCount(world, c.id) > 0);

/** Whether the cannon is where the pod in question wants it: its column, or the maw's reach. */
function podOn(world: World): boolean | null {
  const pod = podInQuestion(world);
  if (pod === null) return null;
  const col = Math.round(pod.colMilli / MILLI);
  return pod.loose ? inMawReach(world, col) : world.cannonCol === col;
}

/** Whether some secret is drawn on this screen (`true`) or kept from it (`false`). */
function secret(r: Reading, shown: boolean): boolean {
  const { l, world } = r;
  if (l === undefined) return true;
  if (world.creatures.some((c) => secretShown(l, world, c) === shown)) return true;
  return world.pods.some((p) => p.kind === "husk" && showsHuskMark(l, p) === shown);
}

export const WHEN: Record<HintWhen, (r: Reading) => boolean> = {
  always: () => true,
  offColumn: ({ world, next }) => next !== null && !under(world.cannonCol, next),
  onColumn: ({ world, next }) => next !== null && under(world.cannonCol, next),
  shieldOff: ({ world, next }) => next !== null && !under(world.shieldCol, next),
  shieldOn: ({ world, next }) => next !== null && under(world.shieldCol, next),
  held: ({ world }) => handOn(world),
  free: ({ world, next }) => next !== null && !handOn(world),
  seesIt: (r) => secret(r, true),
  toldIt: (r) => secret(r, false),
  podHangs: ({ world }) => world.pods.length > 0 && !world.pods.some((p) => p.loose),
  podLoose: ({ world }) => world.pods.some((p) => p.loose),
  podOn: ({ world }) => podOn(world) === true,
  podOff: ({ world }) => podOn(world) === false,
  limp: ({ next }) => next !== null && morselIsLimp(next),
  whole: ({ next }) => next !== null && !morselIsLimp(next),
};
