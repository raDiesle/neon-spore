import { beforeAll, describe, expect, it } from "bun:test";
import { castHuskFlight, HuskDeflates } from "../src/husk-deflate.js";
import { drawHuskMarks, husks, showsHuskMark } from "../src/husk-mark.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  installCanvasGlobals,
  peakWorld,
  type ROLES,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

/**
 * THE HUSK's two pictures: the frame one seat sees round it, and the flight it
 * goes off in when the pair refuses it.
 *
 * What an eye has to answer — whether a balloon let go is funny — is the
 * owner's and needs a look. What is held here is the three things that can go
 * wrong silently. **The seat split is the creature**: a mark that leaked onto
 * player 1's screen would not look broken, it would look like a game with no
 * secret in it, and nothing else in the frame would say so. **The flight has to
 * go somewhere and then stop**, because a transient that never expires is a
 * scrap of skin over the field for the rest of the run (`restart.test.ts` holds
 * the other half of that). And **both phones have to watch the same flight**,
 * which is rule 2 in `CLAUDE.md` spent on a picture rather than on a rule.
 */

beforeAll(installCanvasGlobals);

/**
 * The wave, stepped to the tick it carries the most on.
 *
 * This was a builder of its own until 17 September 2026, because `peakWorld`
 * opened every wave with an empty pod queue and counted creatures alone — so a
 * wave whose subject is a pod came back with an empty field and three of the
 * cases below failed on `world.pods.length`. The harness hangs the pods now
 * and counts them, and the hole it was papering over is fixed for the seven
 * waves it was silently costing.
 */
const huskWorld = () => peakWorld("theHusk");

function drawn(role: (typeof ROLES)[number]): number {
  const l = computeLayout(VIEWPORT, CFG, role);
  const world = huskWorld();
  const { ctx } = stubCanvas();
  drawHuskMarks(ctx as unknown as CanvasRenderingContext2D, l, world, 1.4);
  return ctx.calls;
}

describe("the mark round a husk", () => {
  it("is on the wave, so there is something for the seats to disagree about", () => {
    const world = huskWorld();
    expect(world.pods.length).toBeGreaterThan(1);
    expect(husks(world)).toHaveLength(1);
    // And the ones beside it are not husks, which is the whole of why the mark
    // is information: a frame round everything says nothing.
    expect(world.pods.filter((p) => !p.husk).length).toBeGreaterThan(0);
  });

  it("is drawn on player 2's screen and never on player 1's", () => {
    expect(showsHuskMark(computeLayout(VIEWPORT, CFG, "p2"))).toBe(true);
    expect(showsHuskMark(computeLayout(VIEWPORT, CFG, "p1"))).toBe(false);
    expect(drawn("p2")).toBeGreaterThan(0);
    expect(drawn("p1")).toBe(0);
  });

  it("is drawn on the rig, which is both halves of the pair at once", () => {
    expect(drawn("test")).toBeGreaterThan(0);
  });
});

describe("the flight a refused husk goes off in", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");
  const REFUSED = { type: "huskRefused", col: 3, row: 9, kind: "purge" } as const;
  const flat = (x: number, y: number) => ({ x, y });

  function cast(): HuskDeflates {
    const fx = new HuskDeflates();
    castHuskFlight(fx, REFUSED, L, flat);
    return fx;
  }

  function paints(fx: HuskDeflates): number {
    const { ctx } = stubCanvas();
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
    return ctx.calls;
  }

  it("draws nothing for a husk nobody refused", () => {
    expect(paints(new HuskDeflates())).toBe(0);
  });

  it("is drawn through the middle of its life and gone by the end of it", () => {
    const fx = cast();
    fx.update(0.5);
    expect(paints(fx)).toBeGreaterThan(0);
    // Two seconds is past any life this transient may have. Nothing is left on
    // the field, which is what a thing that ran out of air leaves.
    fx.update(2);
    expect(paints(fx)).toBe(0);
  });

  it("puts the same husk in the same place on two devices", () => {
    const a = cast();
    const b = cast();
    a.update(0.37);
    b.update(0.37);
    const left = stubCanvas();
    const right = stubCanvas();
    a.draw(left.ctx as unknown as CanvasRenderingContext2D, L);
    b.draw(right.ctx as unknown as CanvasRenderingContext2D, L);
    expect(left.ctx.calls).toBe(right.ctx.calls);
    expect(left.ctx.calls).toBeGreaterThan(0);
  });
});
