import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `CLAUDE.md` is loaded into every session in this project, so its size is not
 * a matter of taste: it is a tax on every turn of every conversation, and it is
 * paid again each time the file changes, because an edit invalidates the prompt
 * cache that would otherwise bill a re-read at a tenth of the price.
 *
 * It reached 537 lines and 31 KB — about 7.8k tokens — of which the Git and
 * cloud sections alone were 47%, and both were narrative: the argument for a
 * rule rather than the rule. The argument is worth keeping and worth *not*
 * re-reading, so it moved to `docs/git-and-landing.md`, `docs/cloud-session.md`
 * and `docs/looks.md`, one hop from the pointer that names it.
 *
 * This test is what keeps it there. The ceiling is generous — the file may grow
 * by half again — because the failure mode is not one paragraph, it is a
 * section drifting back over months with nobody noticing.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
/** Comfortably above the 14.5 KB it stands at, well under the 31 KB it was. */
const SIZE_LIMIT = 22_000;

async function read(name: string): Promise<string> {
  return await Bun.file(join(ROOT, name)).text();
}

describe("CLAUDE.md", () => {
  it("stays small enough to load into every session", async () => {
    const text = await read("CLAUDE.md");
    expect(
      text.length,
      `CLAUDE.md is ${text.length} bytes, ceiling is ${SIZE_LIMIT}. Move the reasoning into docs/ and leave a pointer — see docs/git-and-landing.md for the shape.`,
    ).toBeLessThanOrEqual(SIZE_LIMIT);
  });

  /**
   * A command that no longer exists is worse than one that is missing: a
   * session runs it, reads the error and spends a turn working out whether the
   * document or the repository is wrong.
   */
  it("names only scripts that exist", async () => {
    const text = await read("CLAUDE.md");
    const pkg = (await Bun.file(join(ROOT, "package.json")).json()) as {
      scripts: Record<string, string>;
    };
    const named = [...text.matchAll(/bun run ([a-z][a-z0-9:]*)/g)].map((m) => m[1] ?? "");
    expect(named.length).toBeGreaterThan(10);
    for (const script of new Set(named)) {
      expect(
        script in pkg.scripts,
        `CLAUDE.md names \`bun run ${script}\`, which package.json has not got`,
      ).toBe(true);
    }
  });

  /** The same for the documents it hands work off to. */
  it("points only at files that exist", async () => {
    const text = await read("CLAUDE.md");
    const paths = [...text.matchAll(/`(docs\/[a-z0-9./-]+\.md)`/g)].map((m) => m[1] ?? "");
    expect(paths.length).toBeGreaterThan(5);
    for (const path of new Set(paths)) {
      expect(await Bun.file(join(ROOT, path)).exists(), `CLAUDE.md points at ${path}`).toBe(true);
    }
  });

  /**
   * The three documents the sections were split into. Named here rather than
   * left implicit: a later edit that folds one of them back into CLAUDE.md
   * would pass the size check for a while and then stop, and the failure would
   * point at the wrong thing.
   */
  it("keeps the reasoning where it was moved to", async () => {
    for (const doc of ["docs/git-and-landing.md", "docs/cloud-session.md", "docs/looks.md"]) {
      const text = await read(doc);
      expect(text.length, `${doc} is empty`).toBeGreaterThan(1_000);
    }
  });
});
