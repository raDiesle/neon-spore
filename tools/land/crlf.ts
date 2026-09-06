/**
 * The line endings on disk, asked before `bun run check` is asked anything.
 *
 * A landing failed in a lane on a file the lane had never touched:
 * `.claude/launch.json` had CRLF on disk while its blob in `HEAD` was LF, so
 * `git status` said the tree was clean and nothing pointed at the working copy
 * at all. What biome printed was the whole file as a formatter diff, and the
 * landing stopped with `script "lint" exited with code 1`; finding the cause
 * took six commands and the fix was one substitution.
 *
 * It is reachable by any tracked file a Windows tool rewrites — `.gitattributes`
 * governs checkout and commit, not a third party's write — so the answer is not
 * another attribute but a landing that says the words *line ending* before the
 * formatter gets a chance to say something else.
 *
 * `git ls-files --eol` is the whole measurement: git already knows what is on
 * disk, one command, no file read. The parsing is here and pure, because a
 * refusal that fires on the wrong file would stop every landing on the machine.
 */

/** The extensions biome checks (`biome.json`'s `files.includes`). A file it
 * never opens cannot fail the lint, whatever its line endings are. */
const CHECKED = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"];

/** Paths biome is told to skip. `.claude/launch.json` is on this list because
 * the harness rewrites it, which is how the failure was found in the first
 * place — the exclusion is biome's, and this has to agree with it or it
 * refuses a landing over a file the lint would have passed. */
const SKIPPED = ["node_modules/", "dist/", "legacy/", ".claude/launch.json"];

export function biomeChecks(path: string): boolean {
  const at = path.replaceAll("\\", "/");
  if (SKIPPED.some((skip) => at === skip || at.startsWith(skip) || at.includes(`/${skip}`))) {
    return false;
  }
  return CHECKED.some((ext) => at.endsWith(ext));
}

/**
 * The tracked files whose *working copy* has CRLF in it, out of what
 * `git ls-files --eol` printed.
 *
 * Each line is `i/<index>  w/<worktree>  attr/<attributes>\t<path>`, and only
 * the `w/` half is a fact about disk — `i/crlf` would be a file committed with
 * CRLF, which is a different problem and not this one. `mixed` counts too: a
 * file with both is one biome will rewrite whole, exactly like a file with
 * neither.
 */
export function crlfOnDisk(listing: string): string[] {
  const found: string[] = [];
  for (const line of listing.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const worktree = line
      .slice(0, tab)
      .split(/\s+/)
      .find((field) => field.startsWith("w/"));
    if (worktree !== "w/crlf" && worktree !== "w/mixed") continue;
    const path = line.slice(tab + 1).trim();
    if (biomeChecks(path)) found.push(path);
  }
  return found;
}

/** What the landing prints instead of letting biome print a whole file. */
export function crlfRefusal(paths: readonly string[], trunk: string): string[] {
  const many = paths.length === 1 ? "file has" : "files have";
  return [
    `✗ ${paths.length} tracked ${many} CRLF line endings on disk; ${trunk} was not moved`,
    ...paths.slice(0, 10).map((path) => `  ${path}`),
    ...(paths.length > 10 ? [`  and ${paths.length - 10} more`] : []),
    "  the lint would report this as a formatter diff over the whole file, naming no cause",
    "  run: bun run format",
  ];
}
