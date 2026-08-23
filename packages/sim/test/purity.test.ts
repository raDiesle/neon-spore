import { describe, expect, it } from "bun:test";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";

/**
 * Rules 1 and 2 of CLAUDE.md are enforced here, not in prose. Determinism is
 * the one thing a reviewer cannot see by looking: a single `Math.random` in
 * `sim` desynchronises two devices a minute later, in a way that reads like a
 * network bug. So the rule is a failing test — it runs in `bun test`, in CI,
 * and in the PostToolUse hook after every edit inside `packages/sim`.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GUARDED = ["packages/sim/src", "packages/content/src"];

interface Ban {
  /** Matched against source with comments and string literals removed. */
  pattern: RegExp;
  why: string;
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
];

/**
 * Comments and string literals are not code. Stripping them keeps the bans
 * honest: this very file names `Math.random` and must not fail itself, and a
 * message that explains the rule may quote it.
 */
function stripNonCode(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:[^`\]|[\s\S])*`/g, '""')
    .replace(/"(?:[^"\\n]|\.)*"/g, '""')
    .replace(/'(?:[^'\\n]|\.)*'/g, '""');
}

function sourceFiles(dir: string): string[] {
  const glob = new Glob("**/*.ts");
  return [...glob.scanSync(join(ROOT, dir))].map((f) => join(ROOT, dir, f));
}

describe("determinism", () => {
  const files = GUARDED.flatMap(sourceFiles);

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const name = relative(ROOT, file).replaceAll("\\", "/");
    it(`${name} uses no wall clock, no randomness, no DOM, no render`, async () => {
      const code = stripNonCode(await Bun.file(file).text());
      const broken = BANS.filter((ban) => ban.pattern.test(code));
      expect(broken.map((ban) => ban.why)).toEqual([]);
    });
  }
});
