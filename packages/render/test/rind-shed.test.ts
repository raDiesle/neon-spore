import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, NO_SHELL, type SimEvent, type World } from "@neon-spore/sim";
import { creatureRadius, livingBodyMul, rindPrevBodyMul } from "../src/creature-place.js";
import { computeLayout } from "../src/layout.js";
import { RindShedFx } from "../src/rind-shed.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * A layer coming off THE RIND, and the two things about the picture that a
 * reader of `rind-shed.ts` cannot check by eye.
 *
 * **It is the size the body *was*.** The husk is the skin the creature has
 * just stopped wearing, so it has to leave from the footprint of one layer ago
 * — not from the one the body stepped down to. Drawn at the new size it would
 * read as a shockwave coming out of a small body rather than as a skin coming
 * off a large one, and nothing in a type check can tell those apart.
 *
 * **It stops.** It is keyed by creature id and `world.nextId` restarts at 0
 * with a new world (`restart.test.ts`), so a husk that outlived its own life,
 * its body's death or a `clear()` would be picked up by the next run as its
 * own body's skin.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
/** Longer than `LIFE` in `rind-shed.ts`, in one step. */
const PAST_IT = 1;

beforeAll(installCanvasGlobals);

function rind(layers: number, id = 1): Creature {
  return {
    id,
    kind: "rind",
    col: 3,
    row: 5,
    fromRow: 5,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
    rindLayers: layers,
  } as Creature;
}

function fieldOf(...creatures: Creature[]): World {
  return { creatures, cfg: CFG } as unknown as World;
}

/** The one layer this file ever sheds: a three-size body down to two. */
const shed: SimEvent = { type: "rindShed", col: 3, row: 5, color: "red", left: 1, id: 1 };

/** One frame, and the radius of every arc it drew — the plates riding the husk. */
function frame(fx: RindShedFx, world: World): { calls: number; radii: number[] } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  fx.draw(ctx as unknown as CanvasRenderingContext2D, L, world, 0);
  const radii = (ctx.log ?? [])
    .filter((line) => line.startsWith("arc("))
    .map((line) => Number(line.slice(4, -1).split(", ")[2]));
  return { calls: ctx.calls, radii };
}

describe("a layer coming off a rind", () => {
  it("throws the skin from the footprint the body had one layer ago", () => {
    // Two layers left: the body is drawn at three sizes and was at four.
    const body = rind(1);
    const fx = new RindShedFx();
    fx.ingest([shed], 0);

    const { calls, radii } = frame(fx, fieldOf(body));
    expect(calls).toBeGreaterThan(0);
    expect(radii.length).toBeGreaterThan(0);

    const now = creatureRadius(L, body, 0, CFG);
    const was = (now * rindPrevBodyMul(body)) / livingBodyMul(body);
    // On the first frame the husk has not travelled, so every plate sits on
    // the old footprint, give or take the sliver of drift they break off with
    // — and nowhere near the new one, which is what the lower bound is for.
    for (const r of radii) {
      expect(r).toBeGreaterThan(now * 1.1);
      expect(r).toBeGreaterThan(was * 0.95);
      expect(r).toBeLessThan(was * 1.1);
    }
  });

  it("is over inside half a second", () => {
    const fx = new RindShedFx();
    fx.ingest([shed], 0);
    fx.update(PAST_IT);
    expect(frame(fx, fieldOf(rind(1))).calls).toBe(0);
  });

  it("draws nothing once the body it came off is gone", () => {
    const fx = new RindShedFx();
    fx.ingest([shed], 0);
    // The last layer taken and the body killed inside the same half-second:
    // there is no skin without something to have been the skin of.
    expect(frame(fx, fieldOf()).calls).toBe(0);
  });

  it("is dropped by a restart", () => {
    const fx = new RindShedFx();
    fx.ingest([shed], 0);
    fx.clear();
    expect(frame(fx, fieldOf(rind(1))).calls).toBe(0);
    expect(fx).toEqual(new RindShedFx());
  });
});
