import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { flueBoss } from "@neon-spore/sim";
import { flueCardLines, flueCardRect, flueCardSlow } from "../src/flue-card.js";
import { flueScaleTicks } from "../src/flue-scale.js";
import { flueCentre } from "../src/flue-shape.js";
import { computeLayout } from "../src/layout.js";
import { BEAM, BOLT, frame, posed, stood, words } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What says which level is lit (`flue-scale.ts`, `flue-card.ts`): the scale
 * under the slot ticking the ember's beats to the sight, with no numbers, laid from the
 * level's own speed, and the card naming the weapon and THE SLOW — both on
 * every screen, and neither standing on a word the cue draws.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");
const authored = () => flueBoss(stood())?.levels ?? [];

describe("THE FLUE's scale", () => {
  it("ticks every half beat of the ember's run, out to the slot's end", () => {
    const ticks = flueScaleTicks(CFG, BOLT);
    expect(ticks.map((t) => t.milli)).toEqual([1000, 2000, 3000, 4000]);
    expect(ticks.map((t) => t.halves)).toEqual([1, 2, 3, 4]);
  });

  it("ticks at least one whole beat on every level the wave authors", () => {
    expect(authored().length).toBeGreaterThan(0);
    for (const level of authored()) {
      expect(flueScaleTicks(CFG, level).some((t) => t.halves % 2 === 0)).toBe(true);
    }
  });

  it("lays a faster ember's whole beats further out", () => {
    const first = (speedMilli: number) =>
      flueScaleTicks(CFG, { ...BOLT, speedMilli }).find((t) => t.halves === 2)?.milli ?? 0;
    expect(first(3000)).toBeGreaterThan(first(1000));
  });
});

describe("THE FLUE's card", () => {
  it("names the shot and its colour as the player says it, and THE SLOW only when it holds", () => {
    expect(flueCardLines(BOLT).say).toBe(`SHOOT ${BOLT.color.toUpperCase()}`);
    expect(flueCardLines(BEAM).say).toBe(`BEAM ${BEAM.color.toUpperCase()}`);
    expect(flueCardLines(BOLT).when).toBe("WHEN THE SPORE IS IN THE MIDDLE");
    expect(flueCardLines(BOLT).more).toBeNull();
    expect(flueCardLines(BEAM).more).toBe("SLOW ½");
    expect(flueCardLines({ ...BOLT, needs: 2 }).more).toBe("2 TIMES");
    expect(flueCardLines({ ...BOLT, needs: 2 }, 1).more).toBe("ONCE MORE");
    expect(flueCardSlow(BOLT)).toBeNull();
    expect(flueCardSlow(BEAM)).toBe("SLOW ½");
    expect(flueCardSlow({ ...BEAM, slowMilli: 250 })).toBe("SLOW ¼");
  });

  it("stands under the flue, clear of its scale, inside the field", () => {
    const c = flueCentre(L, CFG);
    const card = flueCardRect(L, c.y);
    expect(card.x).toBeGreaterThanOrEqual(L.gridLeft);
    expect(card.y).toBeGreaterThan(c.y + L.tile * 1.1);
    expect(card.y + card.h).toBeLessThan(L.hullY);
  });
});

describe("THE FLUE's level, drawn", () => {
  it.each(ROLES)("writes the card, and no number on the scale, on the %s screen", (role) => {
    const drawn = words(role, (w) => {
      posed(w, BEAM);
    }).map((t) => t.text);
    expect(drawn).toContain(flueCardLines(BEAM).say);
    expect(drawn).toContain("SLOW ½");
    expect(drawn).not.toContain("1");
    expect(drawn).not.toContain("2");
  });

  // The boxes are the canvas's own pixels, and the only words a posed frame
  // draws are the flue's: the card.
  it.each(ROLES)("lays no word on another round the flue, every level, on %s", (role) => {
    for (const level of authored()) {
      const near = words(role, (w) => {
        posed(w, level);
      });
      expect(near.length).toBeGreaterThan(1);
      for (const [i, a] of near.entries()) {
        for (const b of near.slice(i + 1)) {
          const apart =
            a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
          expect(apart, `${a.text} on ${b.text}, ${level.weapon} at ${level.speedMilli}`).toBe(
            true,
          );
        }
      }
    }
  });
});
