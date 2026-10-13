import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planFor } from "../decide.js";
import { patch, type Variant } from "../variant.js";

/**
 * **A candidate that patches two records in one file takes both.** `planFor`
 * read each patch's file from disk and `adopt` writes every entry whole, so
 * `bun run versus adopt scuttle:seat lobed` printed both edits and only
 * `SCUTTLE_FRAME` reached `scuttle-shape.ts` (9 October 2026).
 */

const FILE = "packages/render/src/shape.ts";
const SRC = `/** Rows. */
export const ROWS = {
  count: 3,
};

/** Frame. */
export const FRAME = {
  width: 10,
};
`;

let root = "";

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "ns-plan-for-"));
  await mkdir(join(root, "packages/render/src"), { recursive: true });
  writeFileSync(join(root, FILE), SRC);
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

const ROWS = { count: 3 };
const FRAME = { width: 10 };

const TWO: Variant = {
  slot: "shape:seat",
  name: "lobed",
  sentence: "two records, one file",
  dir: "tools/versus/candidates/shape-seat/lobed",
  patches: [
    patch({
      target: ROWS,
      reached: () => ROWS,
      where: { file: FILE, symbol: "ROWS" },
      fields: { count: 5 },
    }),
    patch({
      target: FRAME,
      reached: () => FRAME,
      where: { file: FILE, symbol: "FRAME" },
      fields: { width: 12 },
    }),
  ],
};

describe("planFor", () => {
  it("writes the last entry of a file with every patch on it", () => {
    const plan = planFor(TWO, root);
    expect(plan.map((e) => e.symbol)).toEqual(["ROWS", "FRAME"]);
    const last = plan.at(-1)?.text ?? "";
    expect(last).toContain("count: 5,");
    expect(last).toContain("width: 12,");
  });
});
