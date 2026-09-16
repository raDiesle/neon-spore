import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { reconcile } from "../reconcile.js";

/**
 * The trunk reconciled against `origin`, in a repository git actually made.
 *
 * `notes-merge.ts` is proved against hand-written strings, which says
 * everything about the merge and nothing about the wiring — whether the
 * resolver is reached at all, whether the rebase is run in the tree that has
 * the trunk checked out, and whether a refusal leaves that trunk where it was.
 * That is what a hand-reconciliation actually costs and it is what this file
 * holds.
 *
 * So: a bare `origin`, two clones of it that each land a commit, and the real
 * `git rebase`. `replay-repo.test.ts` is the pattern, `realpath` on the way in
 * for the reason `repo.test.ts` gives.
 */

const PREAMBLE = "# Release notes\n\nWhat each landing changed, newest first.\n";

function note(sha: string, subject: string): string {
  return `\n## 2026-09-16 · ${sha} — ${subject}\n\nWhat it did.\n`;
}

async function run(args: string[], cwd: string): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim()}`);
  return out.trim();
}

let dir = "";

/**
 * A bare origin and two clones, both of which have landed a commit the other
 * has not — which is the whole of the situation, and the only one `bun run
 * push` ever refused for.
 *
 * `ours` gets the trunk with a release note on top and, optionally, a file of
 * its own; `theirs` is already pushed. Returns where `ours` is.
 */
async function diverged(mine: string, theirs: string, file?: [string, string]): Promise<string> {
  dir = await realpath(await mkdtemp(join(tmpdir(), "ns-reconcile-")));
  const origin = join(dir, "origin.git");
  await run(["init", "--bare", "-b", "main", "--quiet", origin], dir);

  const seed = join(dir, "seed");
  await run(["clone", "--quiet", origin, seed], dir);
  await run(["config", "user.email", "test@example.com"], seed);
  await run(["config", "user.name", "Test"], seed);
  await Bun.write(join(seed, "docs", "release-notes.md"), PREAMBLE);
  await Bun.write(join(seed, "code.ts"), "export const n = 1;\n");
  await run(["add", "."], seed);
  await run(["commit", "-q", "-m", "the record, and something to build on"], seed);
  await run(["push", "--quiet", "origin", "main"], seed);

  const them = join(dir, "them");
  await run(["clone", "--quiet", origin, them], dir);
  await run(["config", "user.email", "them@example.com"], them);
  await run(["config", "user.name", "Them"], them);
  await Bun.write(join(them, "docs", "release-notes.md"), PREAMBLE + note("bbbbbbb", theirs));
  await run(["add", "."], them);
  await run(["commit", "-q", "-m", theirs], them);
  await run(["push", "--quiet", "origin", "main"], them);

  const ours = join(dir, "ours");
  await run(["clone", "--quiet", origin, ours], dir);
  await run(["config", "user.email", "us@example.com"], ours);
  await run(["config", "user.name", "Us"], ours);
  // Rewound to the seed, so this clone is a session that landed before the
  // other one pushed: its own commit is on top of the commit they shared.
  await run(["reset", "--hard", "--quiet", "HEAD~1"], ours);
  await Bun.write(join(ours, "docs", "release-notes.md"), PREAMBLE + note("ccccccc", mine));
  if (file) await Bun.write(join(ours, file[0]), file[1]);
  await run(["add", "."], ours);
  await run(["commit", "-q", "-m", mine], ours);
  await run(["fetch", "--quiet", "origin", "main"], ours);
  return ours;
}

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
});

describe("two sessions that both pushed", () => {
  test("replays the trunk onto origin's and settles the release notes", async () => {
    const ours = await diverged("ours, landed here", "theirs, pushed first");
    const out = await reconcile(ours, "main");
    expect(out.ok, out.lines.join("\n")).toBe(true);
    expect(out.lines.join("\n")).toContain("docs/release-notes.md");

    const text = await Bun.file(join(ours, "docs", "release-notes.md")).text();
    expect(text).toContain("ours, landed here");
    expect(text).toContain("theirs, pushed first");
    // Newest first: this trunk's entry sits above the one origin already had.
    expect(text.indexOf("ccccccc")).toBeLessThan(text.indexOf("bbbbbbb"));
    expect(text.startsWith(PREAMBLE)).toBe(true);
  });

  test("leaves the trunk one commit ahead of origin and none behind", async () => {
    const ours = await diverged("ours", "theirs");
    expect((await reconcile(ours, "main")).ok).toBe(true);
    expect(await run(["rev-list", "--count", "origin/main..main"], ours)).toBe("1");
    expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("0");
  });

  test("stops on a conflict nobody can settle, and the trunk does not move", async () => {
    // Both sides rewrote the same line of the same source file, which is a
    // real disagreement and is a person's.
    const ours = await diverged("ours", "theirs", ["code.ts", "export const n = 2;\n"]);
    const them = join(dir, "them");
    await Bun.write(join(them, "code.ts"), "export const n = 3;\n");
    await run(["commit", "-qam", "theirs, again"], them);
    await run(["push", "--quiet", "origin", "main"], them);
    await run(["fetch", "--quiet", "origin", "main"], ours);
    const was = await run(["rev-parse", "main"], ours);

    const out = await reconcile(ours, "main");
    expect(out.ok).toBe(false);
    expect(out.lines.join("\n")).toContain("code.ts");
    expect(await run(["rev-parse", "main"], ours)).toBe(was);
    // And no rebase was left half-done for the next command to trip over.
    expect(await run(["status", "--porcelain"], ours)).toBe("");
  });

  test("refuses while the trunk's own worktree has uncommitted work", async () => {
    const ours = await diverged("ours", "theirs");
    await Bun.write(join(ours, "code.ts"), "export const n = 9;\n");
    const out = await reconcile(ours, "main");
    expect(out.ok).toBe(false);
    expect(out.lines.join("\n")).toContain("code.ts");
    expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("1");
  });

  test("refuses when no worktree has the trunk checked out", async () => {
    const ours = await diverged("ours", "theirs");
    await run(["checkout", "--quiet", "--detach", "HEAD"], ours);
    const out = await reconcile(ours, "main");
    expect(out.ok).toBe(false);
    expect(out.lines.join("\n")).toContain("checked out");
  });
});
