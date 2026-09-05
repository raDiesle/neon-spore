import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * No tracked file is stored with carriage returns in it.
 *
 * `.gitattributes` says `* text=auto eol=lf`, and that settles what a checkout
 * *writes*. It does not settle what is already in the index: a blob committed
 * with CRLF before the attribute landed stays CRLF, and every clone from then
 * on writes the file out exactly as stored. That is how `CLAUDE.md` and
 * `.claude/settings.json` arrived in one worktree with CRLF endings while every
 * other file in the same checkout arrived with LF — and `bun run check` then
 * went red on the first command of a lane, saying `CLAUDE.md` had grown past
 * its ceiling when nothing had changed. `git add --renormalize .` settles it
 * once; nothing keeps it settled.
 *
 * So this is the guard. It reads the index rather than the working tree, which
 * is the half a `.gitattributes` line cannot reach and the only half that
 * follows the repository to the next clone. The working tree's own endings are
 * deliberately not checked: the desktop harness rewrites `.claude/launch.json`
 * with CRLF whenever it opens a worktree, that file is the harness's rather
 * than the repository's, and a check that fails for it would be the same shape
 * of false alarm this exists to stop.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * The paths `git ls-files --eol` says are stored with carriage returns.
 *
 * Each line is `i/<eol> w/<eol> attr/<attrs>\t<path>`, where the `i/` field is
 * the index copy. `crlf` is a file stored entirely with CRLF and `mixed` one
 * stored with both; either is a blob a fresh clone writes out wrong. `-text`
 * is a binary and says nothing about line endings at all.
 */
export function storedWithCarriageReturns(lsFilesEol: string): string[] {
  const bad: string[] = [];
  for (const line of lsFilesEol.split("\n")) {
    const [fields, path] = line.split("\t");
    if (!fields || !path) continue;
    const index = fields.trim().split(/\s+/)[0] ?? "";
    if (index === "i/crlf" || index === "i/mixed") bad.push(path.trim());
  }
  return bad;
}

describe("line endings in the index", () => {
  it("reads the index column and ignores the working tree's", () => {
    const listing = [
      "i/lf    w/lf    attr/text=auto eol=lf \tCLAUDE.md",
      "i/crlf  w/crlf  attr/text=auto eol=lf \t.claude/settings.json",
      "i/lf    w/crlf  attr/                 \t.claude/launch.json",
      "i/mixed w/mixed attr/text=auto eol=lf \tdocs/queue.md",
      "i/-text w/-text attr/                 \tassets/raster/atlas.png",
    ].join("\n");
    expect(storedWithCarriageReturns(listing)).toEqual([".claude/settings.json", "docs/queue.md"]);
  });

  it("finds none in this repository", () => {
    const listed = spawnSync("git", ["ls-files", "--eol"], { cwd: ROOT, encoding: "utf8" });
    // A checkout with no git is not a repository this can have an opinion
    // about — a tarball of the tree, say. Saying so beats passing quietly.
    expect(listed.status, `git ls-files --eol failed: ${(listed.stderr ?? "").trim()}`).toBe(0);
    const bad = storedWithCarriageReturns(listed.stdout ?? "");
    expect(
      bad,
      `stored with carriage returns: ${bad.join(", ")}. Run \`git add --renormalize .\` and commit the result — every clone writes these out as they are stored, whatever .gitattributes says.`,
    ).toEqual([]);
  });
});
