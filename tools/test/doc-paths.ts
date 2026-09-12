import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { existsIn } from "../queue/stale.js";

/**
 * Whether a path a document names is a path this tree has — the deciding half of
 * `doc-drift.test.ts`, in a file of its own for `tools/index/drift.ts`' reason:
 * what counts as a claim, and what counts as answering one, is the argument, and
 * it is worth reading without the assertions around it.
 *
 * The docs name a file about 2,200 times, and nearly none of those is the path a
 * checkout would use — nor should be. Running prose says `sim/hash.ts` and
 * `render/glow.ts`, because a paragraph about the fingerprint is not improved by
 * three more directories in it. So the question here is not *is this string a
 * path in the tree*, which would report nine hundred healthy sentences, but
 * **could a reader follow this to a file**.
 */

export const ROOT = join(import.meta.dirname, "..", "..");

/**
 * Every `.md` under `docs/`, repository-relative and with forward slashes.
 *
 * `.claude` is skipped for `tools/test/tree-walk.test.ts`' reason: the owner keeps
 * every open lane in a worktree under `.claude/worktrees/`, so a walk that
 * descends there reads another checkout's copy of this repository and reports its
 * documents as this one's. Nothing under `docs/` reaches it today, and the rule is
 * held over the shape rather than over today's starting directory.
 */
export function docFiles(dir = join(ROOT, "docs"), out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".claude" || entry.name === "node_modules") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) docFiles(path, out);
    else if (entry.name.endsWith(".md")) out.push(relative(ROOT, path).replaceAll("\\", "/"));
  }
  return out;
}

/**
 * Every file the tree has: tracked, plus the ones a lane has added and not
 * committed yet, minus everything `.gitignore` covers.
 *
 * `--others` is the half that matters in a lane: a document and the file it names
 * usually arrive in the same commit, and a check reading only the index would
 * call the new path drift and send somebody hunting for a rename that never
 * happened.
 */
export const TREE = Bun.spawnSync(
  ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
  { cwd: ROOT },
)
  .stdout.toString()
  .split("\n")
  .filter(Boolean);

/** Every extension the tree actually uses, so a doc naming `foo/bar.py` is prose. */
const EXTENSIONS = new Set(
  TREE.map((path) => /\.([A-Za-z0-9]+)$/.exec(path)?.[1] ?? "").filter(Boolean),
);

/** Tracked paths by file name — the cheap half of resolving a shorthand. */
const BY_NAME = new Map<string, string[]>();
for (const path of TREE) {
  const name = path.split("/").pop() ?? "";
  BY_NAME.set(name, [...(BY_NAME.get(name) ?? []), path]);
}

/**
 * Whether a backticked span is a claim about a path at all.
 *
 * One token with a slash in it and an extension the tree uses. That leaves out
 * every command line (`bun run --cwd apps/server dev`), every package name
 * (`@neon-spore/sim`, which has no extension), every URL, every route
 * (`/versus.html` is a thing a server serves, not a file it has) and every
 * template (`packages/render/src/<round>.ts`).
 */
export function isPathClaim(span: string): boolean {
  if (/[\s<>|]/.test(span) || span.includes("://") || span.startsWith("/")) return false;
  if (!span.includes("/")) return false;
  const extension = /\.([A-Za-z0-9]+)$/.exec(span.split("/").pop() ?? "")?.[1] ?? "";
  // `.js` is in for one reason: an ESM specifier names the compiled sibling of a
  // `.ts` file, and the docs quote specifiers.
  return extension !== "" && (EXTENSIONS.has(extension) || extension === "js");
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replaceAll("*", "[^/]*").replaceAll("?", ".")}$`);
}

/**
 * Whether the shorthand the docs are written in names a file the tree has.
 *
 * A mention resolves when its segments appear **in order** in a path and its last
 * segment is that path's file name. `test/purity.test.ts` finds
 * `packages/sim/test/purity.test.ts`; `render/glow.ts` does not find
 * `packages/sim/src/glow.ts`, because there is no such file to find.
 */
function resolvesAsShorthand(mention: string): boolean {
  const segments = mention.split("/").filter((s) => s !== "" && s !== "." && s !== "..");
  const last = segments.at(-1) ?? "";
  const candidates = /[*?]/.test(last) ? TREE : (BY_NAME.get(last) ?? []);
  return candidates.some((path) => {
    let matched = 0;
    for (const part of path.split("/")) {
      if (matched < segments.length && globToRegExp(segments[matched] as string).test(part)) {
        matched++;
      }
    }
    return matched === segments.length;
  });
}

/** Paths git is told to ignore: a build output a document names is not drift. */
export function ignoredByGit(paths: readonly string[]): Set<string> {
  if (paths.length === 0) return new Set();
  const out = Bun.spawnSync(["git", "check-ignore", "--stdin"], {
    cwd: ROOT,
    stdin: Buffer.from(`${paths.join("\n")}\n`),
  }).stdout.toString();
  return new Set(out.split("\n").filter(Boolean));
}

/**
 * Whether a reader could follow this mention to a file: the queue tool's own rule
 * for a path first — `existsIn` takes a file, a directory or a glob, and is
 * called rather than written out again — then the docs' shorthand, each also
 * tried with a `.js` specifier read as the `.ts` file it names.
 */
export function namesAFile(mention: string): boolean {
  const clean = mention.replace(/^\.{1,2}\//, "").replace(/\/$/, "");
  for (const candidate of [clean, clean.replace(/\.js$/, ".ts")]) {
    if (existsIn(TREE, candidate) || resolvesAsShorthand(candidate)) return true;
  }
  return false;
}

/** The text of a document with its fenced blocks taken out: those are examples. */
function outsideFences(text: string): string {
  const kept: string[] = [];
  let fenced = false;
  for (const line of text.split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    else if (!fenced) kept.push(line);
  }
  return kept.join("\n");
}

/** Every path claim a document makes, in order, fenced examples left out. */
export function pathClaimsIn(doc: string): string[] {
  const text = outsideFences(readFileSync(join(ROOT, doc), "utf8"));
  const claims: string[] = [];
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const mention = (match[1] ?? "").trim();
    if (isPathClaim(mention)) claims.push(mention);
  }
  return claims;
}
