import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TAILS, tailReach } from "../src/tails/index.js";

/**
 * The sixth axis on SHAPES: what a falling body leaves behind it.
 *
 * The case this file exists for that the glow and hit tests do not have is the
 * **shipped** marker. Two values on this axis are what the renderer already
 * draws, and they are on the page as controls — CLAUDE.md's *a look is offered,
 * never replaced* only means something if the thing being offered against is
 * on the same row. A refactor that quietly dropped that marking would leave
 * six proposals and no baseline, and nothing would error.
 */

const DIR = join(import.meta.dir, "..", "src", "tails");
const FILES = readdirSync(DIR).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts",
);
const SOURCE = new Map(FILES.map((f) => [f, readFileSync(join(DIR, f), "utf8")]));

/** The file with its comments taken out — see `glows.test.ts` for why. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("the tail registry", () => {
  it("has a file for every tail and a tail for every file", () => {
    expect(FILES.length).toBe(TAILS.length);
    for (const t of TAILS) expect(SOURCE.has(`${t.id}.ts`), t.id).toBe(true);
  });

  it("gives every tail its own id and its own label", () => {
    expect(new Set(TAILS.map((t) => t.id)).size).toBe(TAILS.length);
    expect(new Set(TAILS.map((t) => t.label)).size).toBe(TAILS.length);
  });

  it("keeps both shipped looks on the axis", () => {
    // HALOES is what a slick and a bulb wear, WEDGE is what a torch wears.
    // They are the controls. An axis of six proposals and no baseline is an
    // axis that proposes replacing something nobody has looked at.
    const shipped = TAILS.filter((t) => t.shipped);
    expect(shipped.map((t) => t.id).sort()).toEqual(["haloes", "wedge"]);
    // And each names where, because "shipped" with no address is a claim
    // nobody can check against the renderer.
    for (const t of shipped) expect(t.shipped, t.id).toContain(".ts");
  });

  it("gives every tail somewhere to reach", () => {
    // Unlike a glow, a tail with no reach is not a subtle tail, it is a tail
    // drawn entirely inside the body it trails from.
    for (const t of TAILS) expect(t.reachUp, t.id).toBeGreaterThan(0);
  });
});

describe("the room a tail stack asks for", () => {
  it("takes the longest of the stack, not the total", () => {
    const far = Math.max(...TAILS.map((t) => t.reachUp));
    expect(tailReach(TAILS.map((t) => t.id))).toBeCloseTo(far, 10);
  });

  it("asks for nothing when nothing is ticked", () => {
    // The frame has to be exactly what it was before this axis existed, or
    // every card on the page silently changed size the day it landed.
    expect(tailReach([])).toBe(0);
  });
});

describe("what a tail file may not contain", () => {
  it("never reaches for Math.random", () => {
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("Math.random");
  });

  it("never imports the renderer", () => {
    // Worth stating for this axis in particular: two of these values are
    // *transcribed* from `packages/render`, and the temptation to import the
    // real thing rather than redraw it is real. It would make the tool depend
    // on the renderer it exists to propose changes to.
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("@neon-spore/render");
  });

  it("never writes the contour's own path data", () => {
    // Same rule as GLOW. A tail is behind the body, never the body.
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain('setAttribute("d"');
  });

  it("keys every defs id on the figure's uid", () => {
    for (const [file, src] of SOURCE) {
      const ids = src.match(/setAttribute\("id", `[^`]*`\)/g) ?? [];
      for (const id of ids) expect(id, file).toContain("${ctx.uid}");
    }
  });
});
