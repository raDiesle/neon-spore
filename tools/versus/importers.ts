import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { slotDir } from "./slots.js";

/**
 * **Who outside a slot still imports its candidates.** Closing a slot takes
 * its directories off the disk, and a file elsewhere that imported one — a
 * sheet drawing the candidate beside the shipped look, a budget test applying
 * it — is left naming a module that is gone. On 2 October 2026 `drop
 * instar:drift` left two (a `bun run solid` strip and a budget test), and the
 * typecheck was the first to say so. `adopt` and `drop` ask this first and
 * refuse with the list, before anything has changed, because whether such a
 * file goes with the slot or is rewritten against the shipped record is a
 * judgement and not a deletion.
 *
 * The registry is not counted — closing the slot rewrites it — and nor is
 * anything inside the slot's own directory.
 */

/** Where an importer can live: what `tsconfig.json` typechecks. */
const SEARCHED = ["apps", "packages", "tools"];
const SKIPPED = new Set(["node_modules", "dist", ".git", ".wrangler"]);

/** Every source file under `root/dir`, as a path relative to `root`. */
function sources(root: string, dir: string): string[] {
  let names: string[];
  try {
    names = readdirSync(join(root, dir), { recursive: true }) as string[];
  } catch {
    return [];
  }
  return names
    .filter((n) => /\.(ts|tsx)$/.test(n) && !n.split(sep).some((part) => SKIPPED.has(part)))
    .map((n) => join(dir, n));
}

/**
 * The files outside `slot` that import from any of its candidate directories,
 * or name the slot in a string — a test that finds its candidate in `VARIANTS`
 * by slot, or asks the director for its pose — `/`-separated. The director's
 * pose map is not counted: closing the slot takes its row out (`pose-row.ts`).
 */
export function importersOf(slot: string, root: string): string[] {
  const own = join("tools", "versus", "candidates", slotDir(slot)) + sep;
  const skip = new Set([
    join("tools", "versus", "candidates", "registry.ts"),
    join("tools", "director", "src", "versus-pose.ts"),
  ]);
  const spec = new RegExp(
    `(?:from\\s*|import\\s*\\(\\s*)["'][^"']*candidates/${slotDir(slot)}/[^"']*["']`,
  );
  // A quoted string, not a backticked one: comments name slots in backticks.
  const named = new RegExp(`(["'])${slot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`);
  return SEARCHED.flatMap((d) => sources(root, d))
    .filter((f) => !skip.has(f) && !f.startsWith(own))
    .filter((f) => {
      const text = readFileSync(join(root, f), "utf8");
      return spec.test(text) || named.test(text);
    })
    .map((f) => f.split(sep).join("/"))
    .sort();
}

/** The refusal, naming each importer; nothing when there is none. */
export function refuseImporters(slot: string, root: string): void {
  const found = importersOf(slot, root);
  if (found.length === 0) return;
  throw new Error(
    [
      `${slot} is still imported from outside it, so closing it would leave these naming a module that is gone:`,
      ...found.map((f) => `  ${f}`),
      "Delete what exists only for the candidate, or rewrite it against the shipped record, then run this again.",
    ].join("\n"),
  );
}
