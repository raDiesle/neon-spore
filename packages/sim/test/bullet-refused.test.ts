import { describe, expect, it } from "bun:test";
import { refusesABolt } from "../src/bullet-refused.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { firstAlong } from "../src/shot-reach.js";
import type { Bullet, Creature, CreatureKind } from "../src/types.js";
import { createWorld, MILLI, type World } from "../src/world.js";

/**
 * **A shot never goes through a body**, which is the owner's rule of 14
 * September 2026: *shots with the cannon, generally speaking, should never go
 * through enemies, but should hit with no effect if the body cannot be
 * destroyed with the cannon's colour.*
 *
 * Five kinds used to be skipped by `shot-reach.ts` outright — THE GUM, THE
 * LIMPET, THE LEECH, THE WEIGHT and THE CAIRN — each with a paragraph saying a
 * bolt went past it *to whatever was above*. That last clause is what this
 * file holds against, and it holds against it at the sweep rather than through
 * a played wave: `firstAlong` is the one place a shot's reach is decided, and
 * a body it does not return is a body a bolt flies through whatever else is
 * true of the wave it is in.
 *
 * The one body a shot still passes is THE GYRE's hub, and it is here as the
 * exception rather than as an oversight: the tile at the middle of a wheel is
 * empty, so a hub that stopped bolts would be a wall across five columns of
 * the field with nothing anywhere in it.
 */

const CFG = DEFAULT_CONFIG;
const COL = 3;

/** A world with one body of `kind` standing in column 3, four rows up. */
function standing(kind: CreatureKind): World {
  const world = createWorld({ ...CFG }, 1);
  const body: Creature = {
    id: 1,
    kind,
    col: COL,
    row: 4,
    fromCol: COL,
    fromRow: 4,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures = [body];
  return world;
}

/** A bolt climbing column 3, and the stretch of it this tick covers — a whole
 * row either side of the body, so the sweep cannot miss it by arithmetic. */
const bolt: Bullet = { col: COL, row: 5, color: "red", aimMilli: 0, id: 9 } as Bullet;
const from = 5 * MILLI;
const to = 3 * MILLI;

describe("which bodies spend a bolt", () => {
  it("is the four that are not stone, and the pile that is", () => {
    for (const kind of ["gum", "limpet", "leech", "weight", "cairn"] as const) {
      expect(refusesABolt(kind), kind).toBe(true);
    }
  });

  it("is not a body the cannon can answer, and not THE GYRE's hub", () => {
    for (const kind of ["slick", "bulb", "gyre", "meteor"] as const) {
      expect(refusesABolt(kind), kind).toBe(false);
    }
  });
});

describe("what the sweep stops at", () => {
  /**
   * The claim, and the whole of what changed: each of the five is *found* by
   * the sweep now. Before this, `firstAlong` walked past all five by name and a
   * body behind one of them was shootable through it.
   */
  for (const kind of ["gum", "limpet", "leech", "weight", "cairn"] as const) {
    it(`stops at ${kind.toUpperCase()} rather than walking past it`, () => {
      const world = standing(kind);
      expect(firstAlong(world, bolt, from, to)?.kind).toBe(kind);
    });
  }

  it("still walks past THE GYRE's hub, which is the only one left", () => {
    // The tile at the middle of a wheel is empty; what a bolt meets in those
    // columns is a mount or nothing (`gyre.ts`).
    expect(firstAlong(standing("gyre"), bolt, from, to)).toBeUndefined();
  });

  it("stops at an ordinary body, which never changed", () => {
    expect(firstAlong(standing("slick"), bolt, from, to)?.kind).toBe("slick");
  });
});
