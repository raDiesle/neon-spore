import { afterEach, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { reconcile } from "../reconcile.js";

/**
 * A pushed note names a commit the pushed trunk holds.
 *
 * `ours` lands a commit and stamps its note and an `Unverified at` heading
 * with its sha, the way `bun run land` does; `them` has pushed first, so the
 * reconcile replays `ours` onto it and every sha of ours changes
 * (`restamp.ts`, `docs/queue.md` 26 September 2026).
 */

let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
}, CLEANUP_MS);

const PREAMBLE = "# Release notes\n\nNewest first.\n";

test(
  "restamps the release note and the unverified heading onto the replayed sha",
  async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "ns-restamp-")));
    dir = root;
    const origin = join(root, "origin.git");
    await run(["init", "--bare", "-b", "main", "--quiet", origin], root);

    const ours = join(root, "ours");
    await run(["clone", "--quiet", origin, ours], root);
    await run(["config", "user.email", "us@example.com"], ours);
    await run(["config", "user.name", "Us"], ours);
    await Bun.write(join(ours, "docs", "release-notes.md"), PREAMBLE);
    await Bun.write(join(ours, "docs", "queue.md"), "# Queue\n");
    await run(["add", "."], ours);
    await run(["commit", "-q", "-m", "seed"], ours);
    await run(["push", "--quiet", "origin", "main"], ours);

    const them = join(root, "them");
    await run(["clone", "--quiet", origin, them], root);
    await run(["config", "user.email", "them@example.com"], them);
    await run(["config", "user.name", "Them"], them);
    await Bun.write(join(them, "b.ts"), "export const b = 1;\n");
    await run(["add", "."], them);
    await run(["commit", "-q", "-m", "theirs"], them);
    await run(["push", "--quiet", "origin", "main"], them);

    await Bun.write(join(ours, "c.ts"), "export const c = 1;\n");
    await run(["add", "c.ts"], ours);
    await run(["commit", "-q", "-m", "ours"], ours);
    const landed = (await run(["rev-parse", "HEAD"], ours)).slice(0, 9);
    const note = `\n## 2026-09-27 · ${landed} — ours\n\nWhat it did.\n`;
    await Bun.write(join(ours, "docs", "release-notes.md"), PREAMBLE + note);
    await Bun.write(
      join(ours, "docs", "queue.md"),
      `# Queue\n\n## Unverified at ${landed}: ours\n`,
    );
    await run(["commit", "-qam", "Release notes for one landing"], ours);
    await run(["fetch", "--quiet", "origin", "main"], ours);

    const out = await reconcile(ours, "main");
    expect(out.ok, out.lines.join("\n")).toBe(true);
    expect(out.lines.join("\n")).toContain("restamped");

    const notes = await run(["show", "main:docs/release-notes.md"], ours);
    const queue = await run(["show", "main:docs/queue.md"], ours);
    const stamp = notes.match(/· ([0-9a-f]{9}) — ours/)?.[1] ?? "";
    expect(stamp).not.toBe(landed);
    expect(queue).toContain(`Unverified at ${stamp}:`);
    // The whole point: the stamp names a commit the trunk being pushed holds.
    await run(["merge-base", "--is-ancestor", stamp, "main"], ours);
    expect(await run(["log", "-1", "--format=%s", stamp], ours)).toBe("ours");
    expect(await run(["status", "--porcelain"], ours)).toBe("");
  },
  repoTimeout(30),
);
