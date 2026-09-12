import type { SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";

/**
 * THE CHOKE crawling along the hull to the cannon before it takes it.
 *
 * The owner, 11 September 2026: *when the choke hits the ship, it fast crawls
 * to the cannon first.* Until then the grip was a cut: the strand landed in
 * its lane and on the same frame the loops were round the cannon's swelling
 * wherever that stood, with nothing having crossed the plating between. The
 * simulation already gives the picture the room — a choke that takes hold
 * this beat is not walked anywhere until the next (`sim/choke.ts`,
 * `stepChoke`) — so the beat between is the crawl: the strand lying on the
 * skin, inching toward the cannon in fast surges with its hooks reaching, and
 * the loops going on when it gets there.
 *
 * Pure render. The world says the choke has the cannon from the beat it
 * landed, and the strip is dead from that beat (`choke-strip.ts`); what this
 * holds is only how far along the plating the picture of it has got. It is
 * keyed by the body's id, which the `chokeGrip` event carries for it.
 */

/** The shortest crawl — a choke that landed on the cannon's own column still
 * takes a moment to take hold — and what each column of the way adds, in
 * seconds. Capped under a beat (0.625 s at 96 bpm), because the cannon starts
 * walking on the next one and the loops must be on it by then. */
const CRAWL_MIN = 0.15;
const CRAWL_PER_COL = 0.045;
const CRAWL_MAX = 0.55;
/** The grab at the end: the loops flashing on. */
const GRAB = 0.22;

interface Crawl {
  id: number;
  /** The plating x it set off from — the centre of the lane it fell in. */
  fromX: number;
  /** Columns crossed, for the surge count. */
  cols: number;
  /** Seconds the crawl takes. */
  crawl: number;
  age: number;
}

export interface CrawlState {
  /** 0 setting off to 1 arrived. */
  u: number;
  /** 0..1 through the grab flash once arrived; 0 before. */
  grab: number;
  fromX: number;
  cols: number;
}

export class ChokeCrawlFx {
  private crawls: Crawl[] = [];

  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "chokeGrip") continue;
      const cols = Math.abs(e.col - e.from);
      this.crawls.push({
        id: e.id,
        fromX: tileCX(l, e.from),
        cols,
        crawl: Math.min(CRAWL_MAX, CRAWL_MIN + CRAWL_PER_COL * cols),
        age: 0,
      });
    }
  }

  update(dt: number): void {
    for (const c of this.crawls) c.age += dt;
    this.crawls = this.crawls.filter((c) => c.age < c.crawl + GRAB);
  }

  clear(): void {
    this.crawls = [];
  }

  /** Where this body's crawl has got to, or nothing once it is over — and
   * nothing for a choke that never crawled, which is drawn as it always was. */
  state(id: number): CrawlState | undefined {
    const c = this.crawls.find((k) => k.id === id);
    if (!c) return undefined;
    const u = Math.min(1, c.age / c.crawl);
    const grab = u < 1 ? 0 : Math.min(1, (c.age - c.crawl) / GRAB);
    return { u, grab, fromX: c.fromX, cols: c.cols };
  }
}
