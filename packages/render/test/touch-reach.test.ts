import { describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "../src/creature-place.js";
import { type BodiesUnder, creatureAt } from "../src/creature-under.js";
import { computeLayout } from "../src/layout.js";

/**
 * `creatureAt` is handed the field and answers by the field's own numbers.
 * The reach used to be sized at `DEFAULT_CONFIG` whatever the field ran, so a
 * config drawing near bodies bigger — the director's, a test's — drew a body
 * whose edge the thumb could not reach.
 *
 * It also places each body by `glidePhase`, as every placement in render/
 * does. That changes nothing today, because the one kind with a glide of its
 * own refuses a hand and is held by its handles (`balloon-handles.ts`). The
 * last case pins that, so a balloon that ever takes a hand is found where it
 * is drawn and not where the beat alone would put it.
 */

const CFG = { ...DEFAULT_CONFIG, depthNearScale: 3 };
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const ROW = hullRow(CFG) - 1;

const slick = {
  id: 1,
  kind: "slick",
  col: 3,
  row: ROW,
  fromRow: ROW,
  color: "red",
} as unknown as Creature;

const balloon = {
  id: 2,
  kind: "balloon",
  col: 3,
  row: 5,
  fromRow: 6,
  color: null,
  balloonBeat: 0,
} as unknown as Creature;

function field(creatures: Creature[], beat = 0, beatPhase = 0): BodiesUnder {
  return { creatures, beatPhase, beat, cfg: CFG, seat: 1, skinY: null };
}

describe("a finger on a body, answered at the field's config", () => {
  const drawn = flatCenter(L, slick, 0);
  const radius = flatRadius(L, CFG, slick, 0);
  const edge = { x: drawn.x + radius, y: drawn.y };

  it("draws a near body bigger than the default reach", () => {
    expect(radius).toBeGreaterThan(flatRadius(L, DEFAULT_CONFIG, slick, 0) * 1.6);
  });

  it("finds it by its edge as drawn", () => {
    expect(creatureAt(L, field([slick]), edge.x, edge.y)).toBe(slick);
  });

  it("never answers a balloon, at any beat of its step", () => {
    for (const beat of [0, 2, 3]) {
      for (const phase of [0, 0.5]) {
        const at = flatCenter(L, balloon, phase);
        expect(creatureAt(L, field([balloon], beat, phase), at.x, at.y)).toBeNull();
      }
    }
  });
});
