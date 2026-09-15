import type { Difficulty } from "@neon-spore/net";
import {
  endStaleRun,
  keepBest,
  keepLevel,
  keepSwapped,
  readBest,
  readLevel,
  readSwapped,
} from "./room-tally.js";
import { NOTHING_YET, type Tally } from "./tally.js";

/**
 * **What a room remembers**: the six facts that must outlive hibernation, each
 * held beside the write that keeps it.
 *
 * Hibernation wakes the Durable Object holding nothing but its sockets, so
 * every one of these is read back the moment the object is built again and
 * written down the moment it changes. That pairing is the whole of this file:
 * a field set without its `storage.put` is a room that forgets the moment
 * nobody speaks to it, and six fields each with a write beside them in another
 * file is six chances to do it. Here there is one place to look.
 *
 * Split out of `room.ts` with the acts (`room-acts.ts`) when that file reached
 * its 250-line limit for the third time. The seam is the one its siblings
 * already use: `room.ts` is the object, its sockets and its routing, and this
 * is what it knows between two of them. The storage half of each write is
 * still `room-tally.ts`'s — this holds the field and calls it.
 */
export class RoomMemory {
  /** The room code this object answers to, as its first arrival gave it. */
  code = "";
  /** Beat zero as it stands, 0 for a room with no run in it. */
  startMs = 0;
  /** What this pair got to. Stored, handed back, never read. See `tally.ts`. */
  best: Tally = NOTHING_YET;
  /**
   * The tempo this pair plays at, kept the way `best` is and never read: two
   * phones at two tempi never reach the same tick, so the pair's one answer
   * lives here (`packages/sim/src/difficulty.ts`).
   */
  level: Difficulty | null = null;
  /** Whether the pair swapped seats: the one bit a tag cannot hold (`seat.ts`). */
  swapped = false;
  /** When this room last heard anything at all, for `runIsOver`. */
  heard = 0;

  constructor(private readonly storage: DurableObjectStorage) {}

  /** Everything back, in one go, for `blockConcurrencyWhile`. */
  async load(): Promise<void> {
    this.code = (await this.storage.get<string>("code")) ?? "";
    this.startMs = (await this.storage.get<number>("startMs")) ?? 0;
    this.best = await readBest(this.storage);
    this.level = await readLevel(this.storage);
    this.swapped = await readSwapped(this.storage);
    this.heard = (await this.storage.get<number>("heard")) ?? 0;
  }

  async setCode(code: string): Promise<void> {
    if (this.code === code) return;
    this.code = code;
    await this.storage.put("code", code);
  }

  async setStartMs(startMs: number): Promise<void> {
    this.startMs = startMs;
    await this.storage.put("startMs", startMs);
  }

  async setLevel(level: Difficulty): Promise<void> {
    this.level = level;
    await keepLevel(this.storage, level);
  }

  async setSwapped(swapped: boolean): Promise<void> {
    this.swapped = swapped;
    await keepSwapped(this.storage, swapped);
  }

  /** A tally in, keeping the better of the two seats' figures (`keepBest`). */
  async takeStats(arriving: Tally): Promise<void> {
    this.best = await keepBest(this.storage, this.best, arriving);
  }

  /**
   * Anything at all was heard just now — the room's own clock for `runIsOver`.
   * A socket's `lastSeen` goes with it when it is evicted, and what is measured
   * here is the silence after the last of them.
   */
  async heardNow(): Promise<void> {
    this.heard = Date.now();
    await this.storage.put("heard", this.heard);
  }

  /**
   * Whether the run is over for want of anybody playing it, beat zero put back
   * to 0 when it is. The caller clears its gate; the run is the room's
   * (`room-tally.ts` `endStaleRun`).
   */
  async endStale(windowMs: number, seatCount: number): Promise<boolean> {
    const ended = await endStaleRun(
      this.storage,
      Date.now() - this.heard,
      windowMs,
      seatCount,
      this.startMs,
    );
    if (ended) this.startMs = 0;
    return ended;
  }
}
