import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HITS, hitSpread } from "../src/hits/index.js";

/**
 * The fifth axis on SHAPES, held to what a runner with no DOM can actually
 * check.
 *
 * Whether a flash lands on the beat, or whether SQUASH reads as impact rather
 * than as a body breathing, is a question for an eye and is what this
 * landing's `Check:` trailer asks. What is checkable here is the registry, the
 * padding arithmetic, the clock, and the two rules a hit file can break
 * silently.
 */

const DIR = join(import.meta.dir, "..", "src", "hits");
const FILES = readdirSync(DIR).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts",
);
const SOURCE = new Map(FILES.map((f) => [f, readFileSync(join(DIR, f), "utf8")]));

/**
 * The file with its comments taken out.
 *
 * The scans below look for a forbidden *call*, and a doc comment that names
 * the thing it is forbidding is not one. `shake.ts` says in prose that the
 * alternative to a seeded stream is `Math.random`, which is exactly the
 * sentence an author should write — and the first version of this test failed
 * on it, which would have taught the next author to stop explaining rather
 * than to stop calling.
 */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("the hit registry", () => {
  it("has a file for every hit and a hit for every file", () => {
    expect(FILES.length).toBe(HITS.length);
    for (const h of HITS) expect(SOURCE.has(`${h.id}.ts`), h.id).toBe(true);
  });

  it("gives every hit its own id and its own label", () => {
    expect(new Set(HITS.map((h) => h.id)).size).toBe(HITS.length);
    expect(new Set(HITS.map((h) => h.label)).size).toBe(HITS.length);
  });

  it("covers all three phases of the event", () => {
    // The axis is one event in three parts, and a switcher that had grown to
    // seven impacts and no wind-up would have quietly stopped being that.
    const phases = new Set(HITS.map((h) => h.phase));
    expect(phases).toContain("before");
    expect(phases).toContain("impact");
    expect(phases).toContain("after");
  });

  it("keeps DIM, because it is the control", () => {
    // LINE is the control for skins and NONE for glows. If this one ever goes,
    // the axis has lost the only thing every other value is measured against.
    const dim = HITS.find((h) => h.id === "dim");
    expect(dim).toBeDefined();
    expect(dim?.spread).toBe(0);
  });
});

describe("the padding a hit stack asks the frame for", () => {
  it("takes the widest of the stack, not the total", () => {
    const widest = Math.max(...HITS.map((h) => h.spread));
    expect(hitSpread(HITS.map((h) => h.id))).toBeCloseTo(widest, 10);
  });

  it("asks for nothing when nothing is ticked", () => {
    expect(hitSpread([])).toBe(0);
  });

  it("asks for nothing for the two that never leave the body", () => {
    // FLASH and DIM are fills. If either ever starts padding the frame, every
    // card on the page shrinks for room nothing uses.
    expect(hitSpread(["flash", "dim"])).toBe(0);
  });
});

describe("what a hit file may not contain", () => {
  it("never reaches for Math.random", () => {
    // Rule (b), and this axis is where it is most tempting: a shake is the
    // exact effect somebody reaches for a random number with, and a card that
    // shakes differently on each reload is not the card a decision was made on.
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("Math.random");
  });

  it("never imports the renderer", () => {
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("@neon-spore/render");
  });

  it("keys every defs id on the figure's uid", () => {
    for (const [file, src] of SOURCE) {
      const ids = src.match(/setAttribute\("id", `[^`]*`\)/g) ?? [];
      // biome-ignore lint/suspicious/noTemplateCurlyInString: this reads source text, and the placeholder is the thing being looked for.
      for (const id of ids) expect(id, file).toContain("${ctx.uid}");
    }
  });
});
