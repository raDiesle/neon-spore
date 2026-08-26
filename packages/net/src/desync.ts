export type HashVerdict = "match" | "mismatch" | "pending";

/** Entries kept per side. A desync that is not caught within this many checks is not caught. */
const DEPTH = 64;

/**
 * `hashWorld` was written as a desync detector and never had one to serve.
 * This is it: each device reports its fingerprint at agreed ticks, and the
 * first tick where the two differ is the tick the two worlds parted.
 *
 * It reports and does not repair. There is no resynchronisation in a delayed
 * lockstep model — a mismatch means a rule read the wall clock or a field
 * escaped the hash, and the honest thing is to say so loudly rather than to
 * paper over a bug that will be back in a minute.
 */
export class HashLedger {
  private readonly own = new Map<number, number>();
  private readonly peer = new Map<number, number>();
  private matched = 0;
  private firstMismatch: number | null = null;

  /** This device's fingerprint at `tick`. */
  record(tick: number, hash: number): HashVerdict {
    this.own.set(tick, hash);
    trim(this.own);
    return this.settle(tick);
  }

  /** The peer's fingerprint at `tick`, as it reported it. */
  observe(tick: number, hash: number): HashVerdict {
    this.peer.set(tick, hash);
    trim(this.peer);
    return this.settle(tick);
  }

  private settle(tick: number): HashVerdict {
    const mine = this.own.get(tick);
    const theirs = this.peer.get(tick);
    if (mine === undefined || theirs === undefined) return "pending";
    if (mine === theirs) {
      this.matched++;
      return "match";
    }
    if (this.firstMismatch === null || tick < this.firstMismatch) this.firstMismatch = tick;
    return "mismatch";
  }

  /** The tick the two worlds parted, or null while they still agree. */
  get desyncTick(): number | null {
    return this.firstMismatch;
  }

  get agreements(): number {
    return this.matched;
  }
}

function trim(map: Map<number, number>): void {
  while (map.size > DEPTH) {
    const oldest = map.keys().next();
    if (oldest.done) return;
    map.delete(oldest.value);
  }
}
