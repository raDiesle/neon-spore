import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, NO_SHELL, type SimEvent, type World } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawRecoilCage } from "../src/recoil.js";
import { RecoilVentFx } from "../src/recoil-vent.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * THE RECOIL's two pictures, and the things about them a reader of
 * `recoil.ts` and `recoil-vent.ts` cannot check by eye.
 *
 * **The cage is the count.** How many bounces are left is drawn and shown
 * nowhere else — no bar, no number — so a frame that drew the same cage at
 * three bounces and at one would be a creature with no readout at all, and
 * nothing in a type check can tell those two frames apart.
 *
 * **The jet stops, and it stops before the next beat.** It is keyed by
 * creature id and `world.nextId` restarts at 0 with a new world
 * (`restart.test.ts`), so a vent that outlived its own life or a `clear()`
 * would be picked up by the next run as its own body's.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
/** Longer than `LIFE` in `recoil-vent.ts`, in one step. */
const PAST_IT = 1;

beforeAll(installCanvasGlobals);

function recoil(bounces: number, id = 1): Creature {
  return {
    id,
    kind: "recoil",
    col: 3,
    row: 5,
    fromRow: 5,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
    recoilBounces: bounces,
  } as Creature;
}

function fieldOf(...creatures: Creature[]): World {
  return { creatures, cfg: CFG } as unknown as World;
}

/** The bounce this file ever draws: struck in column 3, landed one to the
 * right and two rows up, and cyan from here on. */
const bounce: SimEvent = {
  type: "recoilBounce",
  id: 1,
  col: 3,
  row: 5,
  toCol: 4,
  toRow: 3,
  color: "cyan",
  left: 2,
};

/** One frame of the cage, and everything the canvas was asked to do for it. */
function cage(c: Creature): { calls: number; log: string[] } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawRecoilCage(ctx as unknown as CanvasRenderingContext2D, L, CFG, c, 100, 200, 0, 0.5);
  return { calls: ctx.calls, log: ctx.log ?? [] };
}

/** One frame of the jet. */
function vent(fx: RecoilVentFx, world: World): number {
  const { ctx } = stubCanvas();
  ctx.log = [];
  fx.draw(ctx as unknown as CanvasRenderingContext2D, L, world, 0);
  return ctx.calls;
}

describe("the cage", () => {
  it("draws, and draws a colour a real canvas accepts", () => {
    const { calls, log } = cage(recoil(3));
    expect(calls).toBeGreaterThan(0);
    // The harness's canvas refuses a colour that is not one — the class of
    // mistake a type check cannot catch, since every one of them is a
    // perfectly good `string` (`frame.test.ts`).
    expect(log.length).toBeGreaterThan(0);
  });

  /**
   * The readout. A cage with every bounce still in it and a cage with one left
   * cannot draw the same picture, because that difference is the only thing
   * either player is told about how close the body is to dying.
   */
  it("says how many bounces are left, and says it differently each time", () => {
    const frames = [3, 2, 1, 0].map((left) => cage(recoil(left)).log.join("\n"));
    expect(new Set(frames).size).toBe(frames.length);
  });

  /** A body outside the cage's own state still gets a frame rather than an
   * exception: absent and zero are one state in the simulation too. */
  it("draws a spent cage for a body carrying no count at all", () => {
    const bare = { ...recoil(0) };
    delete (bare as { recoilBounces?: number }).recoilBounces;
    expect(cage(bare).calls).toBeGreaterThan(0);
  });
});

describe("the jet a bounce vents", () => {
  it("draws while the body it came off is still on the field", () => {
    const fx = new RecoilVentFx();
    fx.ingest([bounce], L, CFG);
    expect(vent(fx, fieldOf(recoil(2)))).toBeGreaterThan(0);
  });

  /**
   * The plume belongs to the tile, not to the body — it is the exhaust the
   * shot left behind — so a bounce that killed nothing and a bounce whose body
   * is somehow gone both still burn out where they happened.
   */
  it("still burns where it happened once the body is gone", () => {
    const fx = new RecoilVentFx();
    fx.ingest([bounce], L, CFG);
    expect(vent(fx, fieldOf())).toBeGreaterThan(0);
  });

  it("is over inside half a second", () => {
    const fx = new RecoilVentFx();
    fx.ingest([bounce], L, CFG);
    fx.update(PAST_IT);
    expect(vent(fx, fieldOf(recoil(2)))).toBe(0);
  });

  it("is dropped by a restart", () => {
    const fx = new RecoilVentFx();
    fx.ingest([bounce], L, CFG);
    fx.clear();
    expect(vent(fx, fieldOf(recoil(2)))).toBe(0);
    expect(fx).toEqual(new RecoilVentFx());
  });
});
