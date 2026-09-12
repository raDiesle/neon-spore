import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A `Path2D` drawn per frame is built from numbers, not from text.
 *
 * `content` has three functions that write a Catmull-Rom spline out as an SVG
 * `d` string — `openSmoothPath`, `blobPath`, `catmullRomToBezierPath` — and
 * for a long time every contour in this package reached the canvas through
 * one of them and `new Path2D(text)`, which parsed the numbers back out of the
 * string they had just been formatted into. On 12 September 2026 a CPU profile
 * put that at two fifths of a drawn frame (`docs/performance.md`, "Two fifths
 * of a drawn frame was text"), and every caller moved to `spline.ts`, which
 * walks the same segments straight into `moveTo`/`bezierCurveTo`.
 *
 * This keeps them there. A file in `src/` that names one of the three is
 * listed below with the reason it may, and a new caller is a red check rather
 * than the next profile. The text forms are still right for what really takes
 * text — a shape sheet, a `<path>` in the menu's markup — and none of that is
 * in this package.
 */

const SRC = join(import.meta.dir, "..", "src");
const TEXT_FORMS = /\b(openSmoothPath|blobPath|catmullRomToBezierPath)\s*\(/;

/** The files allowed a text form, and why. */
const ALLOWED: Record<string, string> = {
  // A per-lane outline mixed from `crystalPath`, `livingPath` and `blobPath`
  // strings and baked once into a cache: built once per lane, never per frame.
  "pulse-shape.ts": "one string per lane, baked once",
};

describe("a spline reaches the canvas as numbers", () => {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".ts"));

  it("names no text form outside the files allowed one", () => {
    const offenders: string[] = [];
    for (const f of files) {
      if (f in ALLOWED) continue;
      const text = readFileSync(join(SRC, f), "utf8");
      // Comments may still say the names — a comment about what was is fine.
      const code = text
        .split("\n")
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
        .join("\n");
      if (TEXT_FORMS.test(code)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the allow list to files that still need it", () => {
    for (const f of Object.keys(ALLOWED)) {
      const text = readFileSync(join(SRC, f), "utf8");
      expect(TEXT_FORMS.test(text), `${f} is allowed a text form it no longer uses`).toBe(true);
    }
  });
});
