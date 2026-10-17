import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { commsCall } from "../src/comms.js";
import { husks } from "../src/comms-husk.js";
import { castHuskFlight, HuskDeflates } from "../src/husk-deflate.js";
import { showsHuskMark } from "../src/husk-look.js";
import { computeLayout } from "../src/layout.js";
import { sirenWord } from "../src/siren.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  peakWorld,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE HUSK's two pictures: the siren it lights while it is on the field, and
 * the flight it goes off in when the pair refuses it.
 *
 * What an eye has to answer — whether a balloon let go is funny — is the
 * owner's and needs a look. What is held here is the three things that can go
 * wrong silently. **The seat split is the creature**: a siren that lit the
 * wrong mouth would not look broken, it would tell the fooled seat to speak
 * about a thing its screen does not show, and nothing else would say so. **The flight has to
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

function huskField(truthP1 = false) {
  const world = huskWorld();
  if (truthP1) for (const p of husks(world)) p.truthP1 = true;
  return world;
}

describe("the siren a husk lights", () => {
  it("is on the wave, so there is something for the seats to disagree about", () => {
    const world = huskWorld();
    expect(world.pods.length).toBeGreaterThan(1);
    expect(husks(world)).toHaveLength(1);
    // And the ones beside it are not husks, which is the whole of why the call
    // is information: a siren over every pod says nothing.
    expect(world.pods.filter((p) => p.kind !== "husk").length).toBeGreaterThan(0);
  });

  it("lights player 2's mouth, and player 1 is told to ask", () => {
    const world = huskField();
    expect(commsCall(world)).toEqual({ p1: false, p2: true });
    expect(sirenWord("p2", world)).toBe("SAY THE HOLLOW ONE");
    expect(sirenWord("p1", world)).toBe("ASK BEFORE YOU TAKE");
  });

  it("changes seats on a husk authored `truthP1`", () => {
    const world = huskField(true);
    expect(commsCall(world)).toEqual({ p1: true, p2: false });
    expect(sirenWord("p1", world)).toBe("SAY THE HOLLOW ONE");
    expect(sirenWord("p2", world)).toBe("ASK BEFORE YOU TAKE");
    expect(showsHuskMark(computeLayout(VIEWPORT, CFG, "p1"), { truthP1: true })).toBe(true);
    expect(showsHuskMark(computeLayout(VIEWPORT, CFG, "p2"), { truthP1: true })).toBe(false);
  });

  it("goes quiet with no husk on the field", () => {
    const world = huskWorld();
    world.pods = world.pods.filter((p) => p.kind !== "husk");
    expect(sirenWord("p1", world)).toBeNull();
    expect(sirenWord("p2", world)).toBeNull();
  });
});

describe("the flight a refused husk goes off in", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");
  const REFUSED = { type: "huskRefused", col: 3, row: 9, id: 4 } as const;
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
