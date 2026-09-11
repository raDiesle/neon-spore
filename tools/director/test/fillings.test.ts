import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { CATALOGUE } from "@neon-spore/shape-sheet";
import { buildFilling, FILLINGS } from "../src/fillings/index.js";
import { skinStill } from "../src/skin-still.js";

/**
 * The seventh axis on SHAPES: what a body has **in** it.
 *
 * Two things here that the glow and hit tests do not have, and both are the
 * reason this axis was added rather than eight more skins.
 *
 * The **shipped** marker, as on the tail axis. Three values are what a bulb, a
 * slick and the gyre's organelle wear on the field, and they are on the page as controls — CLAUDE.md's
 * *a look is offered, never replaced* only means something if the thing being
 * offered against is on the same row. A refactor that quietly dropped the
 * marking would leave ten proposals and no baseline, and nothing would error.
 *
 * And **every value actually draws something**. Each one places marks on a
 * turning surface, and a projection that lands every mark behind the body at
 * `t = 0` is a value that is on the page and invisible — which is exactly the
 * failure mode a switcher cannot show you, because an empty cell and a value
 * you have not picked look identical.
 */

const DIR = join(import.meta.dir, "..", "src", "fillings");
const FILES = readdirSync(DIR).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts" && f !== "parts.ts",
);

/** A round body, which is what four of these were written for and what the
 * other four have to survive being put on. */
const BULB = CATALOGUE.find((e) => e.subject.name === "BULB");

describe("the filling registry", () => {
  it("has a file for every filling and a filling for every file", () => {
    expect(FILES.length).toBe(FILLINGS.length);
    for (const f of FILLINGS) expect(FILES.includes(`${f.id}.ts`), f.id).toBe(true);
  });

  it("gives every filling its own id and its own label", () => {
    expect(new Set(FILLINGS.map((f) => f.id)).size).toBe(FILLINGS.length);
    expect(new Set(FILLINGS.map((f) => f.label)).size).toBe(FILLINGS.length);
  });

  it("keeps every shipped look on the axis", () => {
    const shipped = FILLINGS.filter((f) => f.shipped);
    expect(shipped.map((f) => f.id).sort()).toEqual(["bloom", "orbit", "spores"]);
    // And each names where, because "shipped" with no address is a claim
    // nobody can check against the renderer.
    for (const f of shipped) expect(f.shipped, f.id).toContain(".ts");
  });
});

describe("what a filling draws", () => {
  it("has a body to be drawn on", () => {
    expect(BULB, "BULB left the catalogue").toBeDefined();
  });

  for (const f of FILLINGS) {
    it(`${f.id} puts marks inside the body at rest`, () => {
      if (!BULB) return;
      const svg = skinStill(BULB, { skin: "membrane", filling: f.id, box: 320 });
      // A filling opens its own clip, so the group is proof it ran at all.
      expect(svg, f.id).toContain(`fill-${f.id}`);
      // And something is visible on the near side. Every value here hides its
      // far half, so a value whose whole layout sat behind the body would
      // serialise a clip with nothing showing through it.
      const shown = svg.split("\n").filter((l) => !l.includes('display="none"'));
      const marks = shown.filter((l) => /<(circle|line|path|ellipse)\b/.test(l));
      expect(marks.length, `${f.id} drew nothing visible`).toBeGreaterThan(1);
    });
  }

  it("draws nothing at all when nobody picked one", () => {
    // `undefined` is a real value on this axis and the default — NONE is the
    // picture every value here has to beat, so it has to be genuinely empty.
    let built = 0;
    buildFilling(undefined, {
      body: null,
      onFrame: () => {
        built += 1;
      },
    } as never);
    expect(built).toBe(0);
  });
});
