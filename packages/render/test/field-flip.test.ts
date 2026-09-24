import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { flatCenter } from "../src/creature-place.js";
import { creatureAt } from "../src/creature-under.js";
import { fieldCol, fieldX, flippedLayout } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { flipsField } from "../src/view-role.js";
import { under } from "./bodies-under.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLIP: the same field, drawn about its own middle, on one seat's phone.**
 *
 * The simulation says whose screen is turned and nothing else — there is no
 * mirrored world, no second set of columns and no body that moves. The whole
 * of the mechanic is here, in a layout with a fold on it, and what these cases
 * hold is the pair of properties it stands on: the picture turns, and the
 * controls do not (`field-flip.ts`, `sim/flip.ts`).
 */

const TPB = ticksPerBeat(CFG);
const VIEWPORT = { width: 900, height: 1600, dpr: 2 };

beforeAll(installCanvasGlobals);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function flipWorld(seat: 1 | 2 = 1): World {
  const world = createWorld(CFG, 3);
  startWave(world, 0, [slick(0), slick(3)], [], null, false, 0, [
    { kind: "flip", seat, at: 0, beats: 0 },
  ]);
  return world;
}

/** The same wave stepped until the queue has let its bodies onto the field. */
function onField(seat: 1 | 2 = 1): World {
  const world = flipWorld(seat);
  for (let t = 0; t < TPB * 2 && world.creatures.length < 2; t++) step(world, []);
  return world;
}

function layoutFor(role: ViewRole): Layout {
  return computeLayout(VIEWPORT, CFG, role);
}

describe("flipsField", () => {
  it("turns the seat the wave named, and the rig with the pilot", () => {
    expect(ROLES.map((r) => flipsField(r, 1))).toEqual([true, false, true]);
    expect(ROLES.map((r) => flipsField(r, 2))).toEqual([false, true, false]);
  });
});

describe("flippedLayout", () => {
  it("hands back the very object it was given when nothing is turned", () => {
    // Identity and not a copy: this runs once per frame and once per touch on
    // every wave in the game, and all but one of them place no flip at all.
    const l = layoutFor("p1");
    const world = createWorld(CFG, 3);
    expect(flippedLayout(l, world)).toBe(l);
  });

  it("folds the named seat's layout and leaves the other seat's alone", () => {
    const world = flipWorld(1);
    expect(flippedLayout(layoutFor("p1"), world).flip).toBe(true);
    expect(flippedLayout(layoutFor("p2"), world).flip).toBe(false);
    expect(flippedLayout(layoutFor("p2"), flipWorld(2)).flip).toBe(true);
  });

  it("never comes off a viewport on its own", () => {
    for (const role of ROLES) expect(layoutFor(role).flip).toBe(false);
  });
});

describe("fieldCol", () => {
  it("is the column itself on a screen that is not turned", () => {
    const l = layoutFor("p1");
    for (let col = 0; col < l.cols; col++) expect(fieldCol(l, col)).toBe(col);
  });

  it("swaps the walls and leaves the middle where it is", () => {
    const l = { ...layoutFor("p1"), flip: true };
    expect(fieldCol(l, 0)).toBe(l.cols - 1);
    expect(fieldCol(l, l.cols - 1)).toBe(0);
    expect(fieldCol(l, (l.cols - 1) / 2)).toBe((l.cols - 1) / 2);
  });

  it("mirrors a fraction as cleanly as a whole column, for a body mid-glide", () => {
    const l = { ...layoutFor("p1"), flip: true };
    expect(fieldCol(l, 1.5)).toBe(l.cols - 2.5);
  });

  it("puts a body's pixel the same distance from the far wall", () => {
    const flat = layoutFor("p1");
    const l = { ...flat, flip: true };
    for (const col of [0, 2, 5]) {
      // The two x's add up to the field's two edges: the fold is about the
      // grid's own middle, not about the middle of the phone.
      expect(fieldX(l, col) + fieldX(flat, col)).toBeCloseTo(2 * flat.gridLeft + flat.gridWidth, 6);
    }
  });
});

describe("a body on a turned screen", () => {
  it("is drawn where the mirror of its column is", () => {
    const world = onField();
    const [wall] = world.creatures;
    if (!wall) throw new Error("the wave placed no body");
    const flat = flatCenter(layoutFor("p2"), wall, 0);
    const turned = flatCenter(flippedLayout(layoutFor("p1"), world), wall, 0);
    expect(turned.y).toBe(flat.y);
    expect(turned.x).not.toBeCloseTo(flat.x, 1);
    expect(turned.x + flat.x).toBeCloseTo(
      2 * layoutFor("p1").gridLeft + layoutFor("p1").gridWidth,
      6,
    );
  });

  it("answers a finger that lands on the picture, not on the world's column", () => {
    // The one failure the layout is shared to prevent. A hand is grabbed by
    // `creatureAt`, which places bodies through the same `flatCenter` the
    // renderer draws them with — so a fold applied to the layout reaches both
    // at once, and a grip lands on the body the player can see.
    const world = onField();
    const body = world.creatures[0];
    if (!body) throw new Error("the wave placed no body");
    const turned = flippedLayout(layoutFor("p1"), world);
    const drawn = flatCenter(turned, body, 0);
    expect(creatureAt(turned, under(world, 0, 1), drawn.x, drawn.y)).toBe(body);
    // And the true picture's pixel, on the turned screen, is not the body.
    const honest = flatCenter(layoutFor("p1"), body, 0);
    expect(creatureAt(turned, under(world, 0, 1), honest.x, honest.y)).not.toBe(body);
  });
});

describe("the frames", () => {
  for (const role of ROLES) {
    it(`draws a turned wave on ${role} without the canvas refusing a value`, () => {
      const run = runFrames(flipWorld(1), role, TPB * 2, { viewport: VIEWPORT });
      expect(run.ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("draws the two seats differently, because one of them is a mirror", () => {
    // Same world, same tick count, same viewport: the only thing that differs
    // is which seat is looking, and on this wave that has to show.
    const play = (role: ViewRole) => {
      const run = runFrames(flipWorld(1), role, TPB, {
        viewport: VIEWPORT,
        onCanvas: (ctx) => {
          ctx.log = [];
        },
      });
      return (run.ctx.log ?? []).join("|");
    };
    expect(play("p1")).not.toBe(play("p2"));
  });
});
