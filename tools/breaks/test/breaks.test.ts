import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cpuTimeout } from "../../test/cpu-time.js";
import { sheet } from "../src/sheet.js";
import { piecesOf, SUBJECTS } from "../src/subjects.js";

// A quarter of a second for all four, and a cap that rises with the machine
// (`tools/test/cpu-time.ts`): cutting every subject is arithmetic and nothing
// else, so under a full check it is slow for the machine's reasons and not its
// own. It was on bun's flat five seconds and died at 5875 ms in one. The number
// below buys eight seconds even when the load average has not caught up with
// the shards yet, and more when it has.
setDefaultTimeout(cpuTimeout(1_000));

const OUT = resolve(import.meta.dir, "../../../docs/reference/breaks.svg");

/**
 * What the bench has to be true about.
 *
 * It is a tool and not a look, so nothing here judges a picture — that is the
 * session's job with `bun run png`. These are the things that would let the
 * sheet quietly stop being evidence: a committed file that no longer matches
 * the code, a row whose cut produced nothing, and a coordinate a renderer would
 * refuse.
 */
describe("the break sheet", () => {
  it("matches the committed file", () => {
    // The same guard `docs/reference/style-guide.svg` has: a sheet regenerated
    // by a change and never committed is a picture of a game that has moved on.
    expect(sheet()).toBe(readFileSync(OUT, "utf8"));
  });

  it("has a real fracture on every row", () => {
    for (const s of SUBJECTS) {
      const pieces = piecesOf(s);
      expect(pieces.length, s.name).toBeGreaterThanOrEqual(s.cut.wedges);
      for (const p of pieces) expect(p.points.length, s.name).toBeGreaterThan(2);
    }
  });

  it("writes no coordinate a renderer would refuse", () => {
    expect(sheet()).not.toContain("NaN");
    expect(sheet()).not.toContain("Infinity");
    expect(sheet()).not.toContain("undefined");
  });

  it("names every subject once", () => {
    const names = SUBJECTS.map((s) => s.name);
    expect(names.length).toBe(new Set(names).size);
    for (const n of names) expect(sheet()).toContain(n);
  });
});
