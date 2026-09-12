import { beforeAll, describe, expect, it } from "bun:test";
import { ChokeCrawlFx } from "../src/choke-crawl.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { CFG, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

/**
 * The owner's ask: *when the choke hits the ship, it fast crawls to the
 * cannon first.* Three claims, none of them about pixels: the crawl sets off
 * from the lane it fell in, it is over before the cannon starts walking on
 * the next beat, and a choke that landed on the cannon's own column still
 * takes a moment rather than none. The picture itself is `choke-strand.ts`
 * and needs an eye; what is asserted here is where the picture is told to be.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const BEAT = 0.625;

function grip(id: number, from: number, col: number): ChokeCrawlFx {
  const fx = new ChokeCrawlFx();
  fx.ingest([{ type: "chokeGrip", id, col, row: 11, from }], L);
  return fx;
}

describe("THE CHOKE crawling to the cannon", () => {
  it("sets off from the lane it fell in and knows how far it has to go", () => {
    const fx = grip(4, 2, 8);
    const s = fx.state(4);
    expect(s?.u).toBe(0);
    expect(s?.grab).toBe(0);
    expect(s?.fromX).toBe(tileCX(L, 2));
    expect(s?.cols).toBe(6);
    // Another choke is not this one's crawl.
    expect(fx.state(5)).toBeUndefined();
  });

  it("arrives before the beat is out, however far it had to go", () => {
    const fx = grip(1, 0, CFG.cols - 1);
    let t = 0;
    while ((fx.state(1)?.u ?? 1) < 1) {
      fx.update(1 / 120);
      t += 1 / 120;
    }
    expect(t).toBeLessThan(BEAT);
    // And it took most of the beat: a crawl across the whole ship is a crawl,
    // not a cut.
    expect(t).toBeGreaterThan(BEAT * 0.6);
  });

  it("still takes a moment when it landed under the cannon, then grabs, then is gone", () => {
    const fx = grip(2, 5, 5);
    fx.update(1 / 60);
    expect(fx.state(2)?.u).toBeLessThan(1);
    for (let i = 0; i < 12; i++) fx.update(1 / 60);
    const grabbed = fx.state(2);
    expect(grabbed?.u).toBe(1);
    expect(grabbed?.grab).toBeGreaterThan(0);
    expect(grabbed?.grab).toBeLessThan(1);
    for (let i = 0; i < 20; i++) fx.update(1 / 60);
    expect(fx.state(2)).toBeUndefined();
  });

  it("clears to new", () => {
    const fx = grip(3, 1, 4);
    fx.clear();
    expect(fx).toEqual(new ChokeCrawlFx());
  });
});
