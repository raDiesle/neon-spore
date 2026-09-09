import { describe, expect, it } from "bun:test";
import { isRefusal, type Rewrite, rewriteRecord } from "../record-edit.js";

/**
 * `adopt` writes into a shipped record, which is the one thing in this tool
 * that can lose somebody's work. So the tests that matter are the refusals: a
 * record that has moved since the candidate was written, a field that is not
 * where it looks like it is, and a function, which cannot be written back at
 * all. A wrong write is silent for as long as nobody looks at a phone.
 */

const SRC = `import type { Look } from "./look.js";

/** The shipped look. */
export const TORCH_LOOK: Look = {
  rim: "#FFAE3D",
  // The inner glow has a rim of its own, at a depth this must not reach.
  glow: { rim: "#101020", lift: 2 },
  stops: [0.1, 0.4, 0.9],
  lift: 3,
};
`;

function text(r: Rewrite): string {
  if (isRefusal(r)) throw new Error(`refused: ${r.why}`);
  return r.text;
}

describe("writing a field into a record", () => {
  it("writes the top-level field and leaves a nested one of the same name alone", () => {
    const out = text(rewriteRecord(SRC, "TORCH_LOOK", { rim: "#22FF88" }, { rim: "#FFAE3D" }));
    expect(out).toContain(`rim: "#22FF88",`);
    expect(out).toContain(`glow: { rim: "#101020", lift: 2 },`);
  });

  it("writes a tuple over a tuple", () => {
    const out = text(
      rewriteRecord(SRC, "TORCH_LOOK", { stops: [0, 0.5, 1] }, { stops: [0.1, 0.4, 0.9] }),
    );
    expect(out).toContain("stops: [0, 0.5, 1],");
  });

  /**
   * The one that caught a real corruption. Fields are written late-in-the-file
   * first so an edit cannot move the offsets of one not yet made, and that has
   * to be by *position*: these two are in the opposite order alphabetically to
   * the order they appear in, and the first version sorted by name. It changed
   * a record's `gravityTiles: 11` into `gravityTile 1411`, and passed a test
   * whose two new values happened to be the same length as the old ones.
   */
  it("writes several fields of different lengths without disturbing each other", () => {
    const out = text(
      rewriteRecord(
        SRC,
        "TORCH_LOOK",
        { rim: "#0F0", lift: 14, stops: [0, 1] },
        { rim: "#FFAE3D", lift: 3, stops: [0.1, 0.4, 0.9] },
      ),
    );
    expect(out).toContain(`rim: "#0F0",`);
    expect(out).toContain("stops: [0, 1],");
    expect(out).toContain("lift: 14,");
    expect(out).toContain(`glow: { rim: "#101020", lift: 2 },`);
  });

  it("refuses when the file and the live record disagree", () => {
    const r = rewriteRecord(SRC, "TORCH_LOOK", { rim: "#22FF88" }, { rim: "#000000" });
    expect(isRefusal(r)).toBe(true);
    if (isRefusal(r)) expect(r.why).toContain("has moved");
  });

  it("refuses a field that is only there at a deeper level", () => {
    const r = rewriteRecord(SRC, "TORCH_LOOK", { missing: 1 }, { missing: 1 });
    expect(isRefusal(r)).toBe(true);
    if (isRefusal(r)) expect(r.why).toContain("`missing:`");
  });

  it("refuses a function outright rather than writing what it computes", () => {
    const r = rewriteRecord(SRC, "TORCH_LOOK", { lift: () => 1 }, { lift: 3 });
    expect(isRefusal(r)).toBe(true);
    if (isRefusal(r)) expect(r.why).toContain("function");
  });

  it("refuses a symbol that is not declared in the file", () => {
    const r = rewriteRecord(SRC, "NOT_HERE", { rim: "x" }, { rim: "x" });
    expect(isRefusal(r)).toBe(true);
  });

  it("changes nothing else in the file", () => {
    const out = text(rewriteRecord(SRC, "TORCH_LOOK", { lift: 9 }, { lift: 3 }));
    expect(out.split("\n").length).toBe(SRC.split("\n").length);
    expect(out).toContain("/** The shipped look. */");
  });
});
