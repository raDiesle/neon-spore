import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GLOWS, glowSpread } from "../src/glows/index.js";

/**
 * The fourth axis on SHAPES, held to the four things that can go wrong with it
 * without anything erroring.
 *
 * **This runner carries no DOM** — no jsdom, no happy-dom — so nothing here
 * builds a figure. That is a real limit and it is worth naming rather than
 * working around: whether AURA's ring reads as charged, or whether BLOOM is
 * distinguishable from HALO at 92 px, is a question for an eye and is what the
 * `Check:` trailer on this landing asks. What *is* checkable without a
 * document is everything structural, and each of the cases below is a mistake
 * that would otherwise reach the page silently.
 */

const DIR = join(import.meta.dir, "..", "src", "glows");
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

describe("the glow registry", () => {
  it("has a file for every glow and a glow for every file", () => {
    // `index.ts` is the only place that knows which glows exist, which is only
    // true while the directory and the array agree. A file written and never
    // added to `GLOWS` is invisible with no error anywhere — the switcher
    // simply has one fewer button than the author thinks it has.
    expect(FILES.length).toBe(GLOWS.length);
    for (const g of GLOWS) expect(SOURCE.has(`${g.id}.ts`), g.id).toBe(true);
  });

  it("gives every glow its own id and its own label", () => {
    expect(new Set(GLOWS.map((g) => g.id)).size).toBe(GLOWS.length);
    expect(new Set(GLOWS.map((g) => g.label)).size).toBe(GLOWS.length);
  });

  it("gives every glow a hint the switcher can put in a tooltip", () => {
    // The description line on COMPOSE names the stack; the hint is the only
    // place a reader learns what one value actually does before ticking it.
    for (const g of GLOWS) expect(g.hint.length, g.id).toBeGreaterThan(20);
  });

  it("declares a spread that is never negative", () => {
    for (const g of GLOWS) expect(g.spread, g.id).toBeGreaterThanOrEqual(0);
  });
});

describe("the padding a stack asks the frame for", () => {
  /**
   * The largest and never the sum. Two glows that each reach a third of the
   * way out overlap; they do not queue up. Padding for the sum would shrink
   * every card to leave room nothing is using, and the whole axis would read
   * as making bodies smaller.
   */
  it("takes the widest of the stack, not the total", () => {
    const widest = Math.max(...GLOWS.map((g) => g.spread));
    expect(glowSpread(GLOWS.map((g) => g.id))).toBeCloseTo(widest, 10);
  });

  it("asks for nothing when nothing is ticked", () => {
    // NONE has to leave the card exactly as it was before the axis existed,
    // or every body on the page quietly changed size the day this landed.
    expect(glowSpread([])).toBe(0);
  });

  it("grows or holds as a glow is added, never shrinks", () => {
    const ids = GLOWS.map((g) => g.id);
    let last = glowSpread([]);
    for (let i = 1; i <= ids.length; i++) {
      const now = glowSpread(ids.slice(0, i));
      expect(now).toBeGreaterThanOrEqual(last);
      last = now;
    }
  });
});

describe("what a glow file may not contain", () => {
  /**
   * The same idea as `packages/sim/test/purity.test.ts`, for the same reason:
   * a rule enforced by a scan stops getting past review twice. Every one of
   * these is a rule in `docs/glow.md`, and every one of them fails silently —
   * a wrong picture, or a right picture that is different on the reload the
   * vote is held over.
   */
  it("never reaches for Math.random", () => {
    // Rule (b). A card must look the same on every reload, or the screenshot
    // somebody votes over is not the card anybody saw.
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("Math.random");
  });

  it("never imports the renderer", () => {
    // Rule (a), and the doctrine the whole directory rests on: a glow that
    // reached into `packages/render` would make "try a look" and "change the
    // game" the same action, and then nobody would try one.
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain("@neon-spore/render");
  });

  it("never writes the contour's own path data", () => {
    /**
     * The one thing a glow may never do. A glow adds light *around* a shape
     * and never moves a point of it — that is what keeps this axis orthogonal
     * to SKINS and MOTIONS, and the premise of a compose page is that its axes
     * are independent.
     *
     * Checked as a scan rather than by diffing two rendered figures because
     * there is no document here to render one into, and because the scan
     * catches the mistake at the only place it can be made: `d` is written by
     * `shape-figure.ts`'s loop onto every path `ctx.contourPath()` handed out,
     * so a glow that set it itself would be fighting the loop for one frame in
     * two. The other axis, HITS, is allowed to move the outline — SQUASH is
     * the whole reason it is a separate axis — and when it lands it is
     * excluded here deliberately rather than by this test not noticing.
     */
    for (const [file, src] of SOURCE) expect(code(src), file).not.toContain('setAttribute("d"');
  });

  it("keys every defs id on the figure's uid", () => {
    // Rule (c). An unkeyed id does not error; it silently gives two shapes one
    // gradient, and the backlog page draws the same shape twice on purpose.
    for (const [file, src] of SOURCE) {
      const ids = src.match(/setAttribute\("id", `[^`]*`\)/g) ?? [];
      for (const id of ids) expect(id, file).toContain("${ctx.uid}");
    }
  });
});
