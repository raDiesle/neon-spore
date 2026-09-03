import { describe, expect, it } from "bun:test";
import { join, relative } from "node:path";
import { Glob } from "bun";
import { ROOT, stripNonCode } from "./source-scan.js";

/**
 * Rules 1 and 2 of CLAUDE.md are enforced here, not in prose. Determinism is
 * the one thing a reviewer cannot see by looking: a single `Math.random` in
 * `sim` desynchronises two devices a minute later, in a way that reads like a
 * network bug. So the rule is a failing test — it runs in `bun test`, in CI,
 * and in the PostToolUse hook after every edit inside `packages/sim`.
 */

const GUARDED = ["packages/sim/src", "packages/content/src"];

interface Ban {
  /** Matched against source with comments and string literals removed. */
  pattern: RegExp;
  why: string;
  /**
   * The guarded directories this applies to. Absent means all of them.
   *
   * One ban needs it, and the asymmetry it expresses is real rather than
   * convenient: `content` computes contours with `Math.sin` and hands the
   * result to a canvas, where a last-bit difference is a fraction of a pixel
   * nobody can see. `sim` rounds what it computes into a stored integer, where
   * the same difference is two devices playing different games.
   */
  dirs?: string[];
}

const BANS: Ban[] = [
  {
    pattern: /\bMath\s*\.\s*random\b|\bMath\s*\[\s*["'`]random/,
    why: "Non-deterministic. Use the seeded Rng from @neon-spore/sim.",
  },
  {
    pattern: /\bDate\s*\.\s*now\b|\bnew\s+Date\b|\bperformance\s*\.\s*now\b/,
    why: "Non-deterministic. Time comes from the tick counter.",
  },
  {
    pattern: /(?<![.\w$])(window|document|navigator|localStorage|requestAnimationFrame)(?![\w$])/,
    why: "sim and content are headless. No DOM — the host drives ticks.",
  },
  {
    pattern: /\bfrom\s*["'][^"']*render[^"']*["']|\brequire\s*\(\s*["'][^"']*render/,
    why: "sim must not import render. State flows one way: sim -> render.",
  },
  {
    // The rule `maze.ts` states in a comment and nothing enforced: IEEE-754
    // does not require `sin`, `cos`, `exp`, `pow` or `log` to be correctly
    // rounded, and V8 on Android and JavaScriptCore on iOS do not agree in the
    // last bit. On its own that is nothing; passed through `Math.round` into a
    // stored `Milli` field it is a half-ulp that lands on either side of a .5
    // boundary, which is a desync that reads like a network bug and reproduces
    // on neither phone alone.
    //
    // There are no call sites today — `mazeSinMilli` is a table with a
    // bisection over it, and `mazeClickAngle` walks the same table. This exists
    // so the next boss cannot quietly add one.
    pattern:
      /\bMath\s*\.\s*(sin|cos|tan|asin|acos|atan2?|exp|expm1|log2?|log10|log1p|pow|sqrt|cbrt|hypot)\b/,
    why: "Two JS engines may round these differently in the last bit, and sim rounds the result into a stored integer. Use a table and a bisection — mazeSinMilli is the pattern.",
    dirs: ["packages/sim/src"],
  },
];

function sourceFiles(dir: string): string[] {
  const glob = new Glob("**/*.ts");
  return [...glob.scanSync(join(ROOT, dir))].map((f) => join(ROOT, dir, f));
}

describe("determinism", () => {
  const files = GUARDED.flatMap((dir) => sourceFiles(dir).map((file) => ({ dir, file })));

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const { dir, file } of files) {
    const name = relative(ROOT, file).replaceAll("\\", "/");
    const bans = BANS.filter((ban) => ban.dirs === undefined || ban.dirs.includes(dir));
    it(`${name} uses no wall clock, no randomness, no DOM, no render`, async () => {
      const code = stripNonCode(await Bun.file(file).text());
      const broken = bans.filter((ban) => ban.pattern.test(code));
      expect(broken.map((ban) => ban.why)).toEqual([]);
    });
  }
});
