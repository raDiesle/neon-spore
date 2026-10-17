import { afterAll, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { printedRows, raise, rowLiterals, withMeasure } from "../rows.js";

/**
 * `bun run budgets:measure` (`measure.ts`, `rows.ts`): a printed row goes back
 * into the next literal with its key set, a value is raised and never
 * lowered, a comment inside a row survives, and the file is left with its
 * switch off.
 */

const TABLE = `const MEASURE = false;
const VIEW = { width: 390, height: 844, dpr: 3 };
const ROWS = {
  p1: [
    { save: 3, "new Path2D": 2 },
    {
      save: 9,
      // the second frame is warmer, so fewer paths
      "new Path2D": 1,
    },
  ],
  // { save: 1, "new Path2D": 1 } in a comment is not a row
  p2: [{ save: 4, "new Path2D": 2 }],
};
`;

const row = (pairs: [string, number][]) => new Map(pairs);

describe("printedRows", () => {
  it("reads every line budgetRow printed, labels and all, and nothing else", () => {
    const out = [
      "bun test v1.4.3",
      '  p1 frame 0 { save: 5, "new Path2D": 2 },',
      "(pass) a test name { with braces }",
      '  p1 frame 1 { save: 8, "new Path2D": 3 },',
    ].join("\n");
    expect(printedRows(out)).toEqual([
      row([
        ["save", 5],
        ["new Path2D", 2],
      ]),
      row([
        ["save", 8],
        ["new Path2D", 3],
      ]),
    ]);
  });
});

describe("rowLiterals", () => {
  it("finds the rows and the viewport, and not the row inside a comment", () => {
    expect(rowLiterals(TABLE).map((l) => l.fields.map((f) => f.key).join(","))).toEqual([
      "width,height,dpr",
      "save,new Path2D",
      "save,new Path2D",
      "save,new Path2D",
    ]);
  });
});

describe("raise", () => {
  const printed = [
    row([
      ["save", 5],
      ["new Path2D", 2],
    ]),
    row([
      ["save", 7],
      ["new Path2D", 4],
    ]),
    row([
      ["save", 4],
      ["new Path2D", 2],
    ]),
  ];

  it("raises what rose, never lowers, and keeps the comment inside a row", () => {
    const { text, changes } = raise(TABLE, printed);
    expect(text).toContain('{ save: 5, "new Path2D": 2 }');
    // 7 measured under a ceiling of 9: left where it was.
    expect(text).toContain("save: 9,");
    expect(text).toContain('// the second frame is warmer, so fewer paths\n      "new Path2D": 4,');
    expect(text).toContain('p2: [{ save: 4, "new Path2D": 2 }]');
    expect(text).toContain("{ width: 390, height: 844, dpr: 3 }");
    expect(changes).toEqual([
      { line: 5, key: "save", from: 3, to: 5 },
      { line: 9, key: "new Path2D", from: 1, to: 4 },
    ]);
  });

  it("refuses a row that matches no literal, rather than writing half a file", () => {
    expect(() => raise(TABLE, [...printed, row([["fill", 1]])])).toThrow(
      "printed row 4 (fill) matches no row literal after it",
    );
  });
});

describe("withMeasure", () => {
  it("throws the switch either way, and wants exactly one", () => {
    expect(withMeasure(TABLE, true)).toStartWith("const MEASURE = true;\n");
    expect(withMeasure(withMeasure(TABLE, true), false)).toBe(TABLE);
    expect(() => withMeasure("const x = 1;\n", true)).toThrow("found 0");
  });
});

describe("bun run budgets:measure", () => {
  const dir = mkdtempSync(join(tmpdir(), "budgets-measure-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("raises a real file's rows from its own run and leaves MEASURE false", async () => {
    const file = join(dir, "toy-budget.test.ts");
    await Bun.write(
      file,
      `import { it } from "bun:test";
const MEASURE = false;
const ROWS = [{ save: 3, fill: 2 }, { save: 1 }];
it("measures", () => {
  if (MEASURE) {
    console.log("  a", "{ save: 5, fill: 1 },");
    console.log("  b", "{ save: 1 },");
  }
  return ROWS;
});
`,
    );
    const root = resolve(import.meta.dir, "..", "..", "..");
    const proc = Bun.spawn(["bun", "tools/budgets/measure.ts", file], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    const said = await new Response(proc.stdout).text();
    expect(await proc.exited).toBe(0);
    expect(said).toContain("2 rows, 1 value raised");
    const text = await Bun.file(file).text();
    expect(text).toContain("const MEASURE = false;");
    expect(text).toContain("{ save: 5, fill: 2 }");
    expect(text).toContain("{ save: 1 }");
  }, 60_000);
});
