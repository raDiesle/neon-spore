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

interface Copy {
  /** What to call instead. */
  call: string;
  /** The one file allowed to contain the arithmetic — it is the definition. */
  owner: string;
  /** The shape of the rule written out by hand. */
  pattern: RegExp;
  /** Whether to strip comments and strings before testing. Defaults to true. */
  strip?: boolean;
}

/**
 * Each row is a rule the simulation owns. The row exists because someone has
 * already re-derived that rule rather than importing it. Adding a row is how a
 * defect that got through review once is stopped from getting through twice.
 */
const COPIES: Copy[] = [
  {
    call: "mapCol",
    owner: "packages/content/src/queue.ts",
    pattern: /\bAUTHORED_COLS\s*-\s*1\b/,
  },
  {
    call: "livingKindForColor",
    owner: "packages/sim/src/types.ts",
    pattern: /"red"[\s\S]{0,30}"slick"|"slick"[\s\S]{0,30}"red"/,
    strip: false,
  },
  {
    call: "isMeteorKind",
    owner: "packages/sim/src/types.ts",
    pattern: /\bkind\s*===\s*"meteor"/,
    strip: false,
  },
  {
    call: "radarOwner",
    owner: "packages/content/src/creatures.ts",
    pattern: /controls\s*\.\s*includes\s*\(\s*"guard"\s*\)\s*\?\s*"p1"\s*:\s*"p2"/,
    strip: false,
  },
  {
    call: "categoryOf",
    owner: "packages/content/src/creatures.ts",
    pattern: /kind\s*===\s*"queen"\s*\?\s*"mixed"/,
    strip: false,
  },
  {
    call: "occupiesCol",
    owner: "packages/sim/src/types.ts",
    pattern: /c\s*\.\s*col\s*===\s*col\b/,
    strip: false,
  },
  {
    call: "colSpan",
    owner: "packages/sim/src/types.ts",
    pattern: /kind\s*===\s*"torch"\s*\?\s*2\s*:\s*1/,
    strip: false,
  },
  {
    call: "fallTilesPerBeat",
    owner: "packages/sim/src/types.ts",
    pattern: /kind\s*===\s*"torch"\s*\)\s*return\s*fallTilesPerBeat\s*\(\s*"meteorFastest"\s*\)/,
    strip: false,
  },
];

function allSourceFiles(): string[] {
  const patterns = ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts", "tools/**/*.ts"];
  const all: string[] = [];
  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for (const f of glob.scanSync(ROOT)) {
      // Tested against the path *inside* the repository, never the absolute
      // one: a git worktree lives under `.claude/worktrees/`, so an absolute
      // test threw away every file in the tree and the whole guard passed
      // vacuously wherever it mattered most — in the copy work is done in.
      const rel = f.replaceAll("\\", "/");
      if (!rel.includes("node_modules") && !rel.includes("dist") && !rel.includes(".claude")) {
        all.push(join(ROOT, f));
      }
    }
  }
  return all;
}

describe("no re-derived rules", () => {
  const files = allSourceFiles();

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const copy of COPIES) {
    const ownerPath = join(ROOT, copy.owner);

    it(`${copy.owner} contains its own pattern`, async () => {
      const text = await Bun.file(ownerPath).text();
      const code = copy.strip === false ? text : stripNonCode(text);
      expect(copy.pattern.test(code)).toBe(true);
    });

    for (const file of files) {
      if (file === ownerPath) continue;

      const name = relative(ROOT, file).replaceAll("\\", "/");
      it(`${name} calls ${copy.call} instead of re-deriving it`, async () => {
        const text = await Bun.file(file).text();
        const code = copy.strip === false ? text : stripNonCode(text);
        if (copy.pattern.test(code)) {
          throw new Error(`Call ${copy.call} from ${copy.owner}`);
        }
      });
    }
  }
});
