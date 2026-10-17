import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, DEFAULT_CONFIG, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawCommsSiren, sirenCentre, sirenHit } from "../src/siren.js";
import { BAR_HALF_W } from "../src/siren-lightbar.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The siren's three states and the player's own fourth (`siren-lightbar.ts`):
 * at rest it is drawn and says nothing, a call adds the two chips, and a
 * player who tapped it away gets the outline alone — and the tap that put it
 * away lands where the bar is drawn.
 */

const CFG = DEFAULT_CONFIG;
const PHONE = { width: 390, height: 844, dpr: 1 };
const SEAT: ViewRole = "p1";

beforeAll(installCanvasGlobals);

function after(queue: SpawnEntry[]) {
  const world = createWorld(CFG, 1, queue);
  for (let t = 0; t < ticksPerBeat(CFG) * 6; t++) step(world, []);
  return world;
}

function drawn(queue: SpawnEntry[], off = false): { fills: number; strokes: number; text: number } {
  const { ctx } = stubCanvas();
  const l = computeLayout(PHONE, CFG, SEAT);
  drawCommsSiren(ctx as unknown as CanvasRenderingContext2D, l, after(queue), 1, undefined, off);
  return {
    fills: ctx.tally.get("fill") ?? 0,
    strokes: ctx.tally.get("stroke") ?? 0,
    text: ctx.tally.get("fillText") ?? 0,
  };
}

const VEIL: SpawnEntry[] = [{ beat: 0, col: 3, kind: "veil", color: null }];

describe("the siren's states", () => {
  it("stands at rest on a field with nothing to talk about, and writes nothing", () => {
    const rest = drawn([]);
    expect(rest.fills, "the idle bar was not drawn").toBeGreaterThan(0);
    expect(rest.text, "no chip names a seat at rest").toBe(0);
  });

  it("names both seats once a call is on", () => {
    expect(drawn(VEIL).text).toBeGreaterThanOrEqual(2);
  });

  it("is an outline and nothing else once the player has tapped it away, call or none", () => {
    for (const queue of [[], VEIL]) {
      const off = drawn(queue, true);
      expect(off.fills).toBe(0);
      expect(off.text).toBe(0);
      expect(off.strokes).toBe(1);
    }
  });
});

describe("the tap that hides it", () => {
  const l = computeLayout(PHONE, CFG, SEAT);
  const world = after([]);
  const { x, y } = sirenCentre(l);

  it("lands on the bar and a fingertip round it", () => {
    expect(sirenHit(l, world, x, y)).toBe(true);
    expect(sirenHit(l, world, x + BAR_HALF_W + 6, y + 6)).toBe(true);
  });

  it("misses the field under it and the chips beside it", () => {
    expect(sirenHit(l, world, x, y + 60)).toBe(false);
    expect(sirenHit(l, world, x + BAR_HALF_W + 40, y)).toBe(false);
  });
});
