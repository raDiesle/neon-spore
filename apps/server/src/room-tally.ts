import { type Difficulty, isDifficulty } from "@neon-spore/net";
import { bestOf, NOTHING_YET, runIsOver, type Tally } from "./tally.js";

/**
 * The tally's storage half, and giving up on a run nobody is playing.
 *
 * Split from `tally.ts` for the reason `room-start.ts` is split from
 * `start-gate.ts`: that file is the *rule* and this one touches a Durable
 * Object's storage, and a rule that reaches for storage cannot be held to a
 * table of cases. The typecheck used to insist on the same split for a second
 * reason — the root config took this package's tests without workerd's globals,
 * so a test could reach a `src` file only while that file imported none of them
 * — and it does not any more: `apps/server` is checked once, by itself
 * (`apps/server/tsconfig.json`, `test/seat.test.ts`). The split stands on the
 * first reason alone.
 */

/**
 * The difficulty this pair plays at, as the room last heard it, and the way it
 * is written down. Here beside the tally because it is the same kind of thing —
 * something the room keeps, hands back on a welcome, and never reads — and
 * because this is the file allowed to touch storage (`isDifficulty` is the
 * wire's own check, one package down).
 */
export async function readLevel(storage: DurableObjectStorage): Promise<Difficulty | null> {
  const held = await storage.get<string>("level");
  return isDifficulty(held) ? held : null;
}

export async function keepLevel(
  storage: DurableObjectStorage,
  level: Difficulty,
): Promise<Difficulty> {
  await storage.put("level", level);
  return level;
}

/**
 * Whether the pair have swapped seats since the room formed (`seat.ts`
 * `seatTag`). Kept here because it is the third thing the room keeps and
 * hands back, and this is the file that touches storage.
 */
export async function readSwapped(storage: DurableObjectStorage): Promise<boolean> {
  return (await storage.get<boolean>("swapped")) === true;
}

export async function keepSwapped(storage: DurableObjectStorage, swapped: boolean): Promise<void> {
  await storage.put("swapped", swapped);
}

/** What this pair got to, as the room last heard it. */
export async function readBest(storage: DurableObjectStorage): Promise<Tally> {
  return (await storage.get<Tally>("best")) ?? NOTHING_YET;
}

/**
 * Take a tally in, keeping the better of the two seats' figures.
 *
 * Answers what the room should now hold. Writes only when something moved: a
 * client sends these periodically, and most of them say what the last one did
 * — `bestOf` hands `held` itself back then, which is the tell.
 */
export async function keepBest(
  storage: DurableObjectStorage,
  held: Tally,
  arriving: Tally,
): Promise<Tally> {
  const next = bestOf(held, arriving);
  if (next === held) return held;
  await storage.put("best", next);
  return next;
}

/**
 * Whether the run in this room is over, having heard nothing for long enough,
 * and clearing beat zero when it is.
 *
 * Answers whether it ended, so the caller can put its own field back — the
 * room is what owns `startMs`. See `runIsOver` for why the window is longer
 * than the eviction one and what it costs.
 */
export async function endStaleRun(
  storage: DurableObjectStorage,
  quietMs: number,
  windowMs: number,
  seatCount: number,
  startMs: number,
): Promise<boolean> {
  if (!runIsOver(quietMs, windowMs, seatCount, startMs)) return false;
  await storage.put("startMs", 0);
  return true;
}
