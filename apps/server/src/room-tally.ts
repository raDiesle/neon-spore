import { bestOf, NOTHING_YET, runIsOver, type Tally } from "./tally.js";

/**
 * The tally's storage half, and giving up on a run nobody is playing.
 *
 * Split from `tally.ts` for the reason `room-start.ts` is split from
 * `start-gate.ts`: that file is the *rule* and this one touches a Durable
 * Object's storage. The root type check excludes `apps/server/src` because it
 * has no Cloudflare Workers types, so a test that wants the rule could not
 * reach it while the rule imported storage.
 */

/** What this pair got to, as the room last heard it. */
export async function readBest(storage: DurableObjectStorage): Promise<Tally> {
  return (await storage.get<Tally>("best")) ?? NOTHING_YET;
}

/**
 * Take a tally in, keeping the better of the two seats' figures.
 *
 * Answers what the room should now hold. Writes only when something moved: a
 * client sends these periodically, and most of them say what the last one did.
 */
export async function keepBest(
  storage: DurableObjectStorage,
  held: Tally,
  arriving: Tally,
): Promise<Tally> {
  const next = bestOf(held, arriving);
  if (next.wave === held.wave && next.score === held.score) return held;
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
