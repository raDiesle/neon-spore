#!/usr/bin/env bun

/**
 * The Stop hook typechecks unconditionally and then decides which test
 * directories can possibly have moved. A session that touched only
 * `packages/net` cannot have broken `tools/frames` — but a session that
 * touched `packages/sim` can have broken almost anything, since nearly every
 * package reads it, so that row (and a few others with the same property)
 * opts out of the whole scheme and asks for a full run instead.
 *
 * `scopeFor` is pure so the mapping table is unit-testable without a git
 * checkout; the CLI at the bottom is the only part that touches `git`.
 */

/** A row's `dirs` is `null` for "run everything" (a shared file), and `[]` for "run nothing" (config that no test reads, e.g. `.claude/`). */
type Row = { readonly prefix: string; readonly dirs: readonly string[] | null };

const ROWS: readonly Row[] = [
  // Rules 1 and 2 (no sim->render import, no wall clock) are enforced by
  // packages/sim/test/purity.test.ts, which scans *every* package — a sim
  // change can break that scan's assumptions anywhere.
  { prefix: "packages/sim/", dirs: null },
  // content is read by sim's own tests, render's fixtures, and every wave
  // and creature tool under tools/ — no single directory owns it.
  { prefix: "packages/content/", dirs: null },
  { prefix: "package.json", dirs: null },
  { prefix: "tsconfig.json", dirs: null },
  { prefix: "tsconfig.", dirs: null },
  { prefix: "biome.json", dirs: null },
  { prefix: "bun.lock", dirs: null },

  // render is drawn by the director's preview pages, walked by the shape
  // sheet and rasterised by tools/frames and tools/versus's candidate pairs.
  {
    prefix: "packages/render/",
    dirs: [
      "packages/render",
      "tools/director",
      "tools/shape-sheet",
      "tools/frames",
      "tools/versus",
    ],
  },
  // audio is only ever driven from the director's music page.
  { prefix: "packages/audio/", dirs: ["packages/audio", "tools/director"] },
  // net's wire format is shared with the game client that speaks it, and
  // with the relay's own server package.
  { prefix: "packages/net/", dirs: ["packages/net", "apps/game"] },
  { prefix: "apps/server/", dirs: ["packages/net", "apps/game"] },
  // apps/game is the one thing that drives the renderer at runtime.
  { prefix: "apps/game/", dirs: ["apps/game", "packages/render"] },

  // docs/spec and the top-level docs/*.md files are read by the director's
  // backlog, notes and parked-idea parsers (backlog.ts, notes.ts, parked.ts,
  // design-docs.ts, docs-api.ts, notes-api.ts, whole-doc.ts, spec.ts) — a
  // change to their shape can break how those pages parse them.
  { prefix: "docs/spec/", dirs: ["tools/director"] },

  // .claude/, README.md and CLAUDE.md carry no code a test reads.
  { prefix: ".claude/", dirs: [] },
  { prefix: "README.md", dirs: [] },
  { prefix: "CLAUDE.md", dirs: [] },
];

/** `docs/<name>.md` at the top level (not `docs/spec/...`) maps like docs/spec/. */
function docsTopLevelRow(path: string): readonly string[] | null | undefined {
  const m = /^docs\/([^/]+\.md)$/.exec(path);
  return m ? ["tools/director"] : undefined;
}

/** `tools/<name>/...` maps to that tool's own directory, whatever its name. */
function toolsRow(path: string): readonly string[] | null | undefined {
  const m = /^tools\/([^/]+)\//.exec(path);
  return m ? [`tools/${m[1]}`] : undefined;
}

function dirsFor(path: string): readonly string[] | null {
  const dynamic = docsTopLevelRow(path) ?? toolsRow(path);
  if (dynamic !== undefined) return dynamic;
  for (const row of ROWS) {
    if (path === row.prefix || path.startsWith(row.prefix)) return row.dirs;
  }
  return [];
}

/**
 * Returns the test directories worth running for a set of changed paths, or
 * `[]` meaning "no filter — run everything" (either nothing mapped, which
 * cannot happen alongside a match, or something requested a full run).
 */
export function scopeFor(paths: readonly string[]): string[] {
  const dirs = new Set<string>();
  for (const path of paths) {
    const mapped = dirsFor(path);
    if (mapped === null) return [];
    for (const d of mapped) dirs.add(d);
  }
  return [...dirs].sort();
}

if (import.meta.main) {
  const { spawnSync } = await import("node:child_process");
  const status = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  const diff = spawnSync("git", ["diff", "--name-only", "HEAD"], { encoding: "utf8" });

  const fromStatus = status.stdout
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
  const fromDiff = diff.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const paths = [...new Set([...fromStatus, ...fromDiff])];
  const scope = scopeFor(paths);
  if (scope.length > 0) process.stdout.write(scope.join(" "));
}
