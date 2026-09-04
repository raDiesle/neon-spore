import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Which Bun this project expects, said once and held in step.
 *
 * **It used to be said nowhere a session could see.** The only declaration was
 * a literal inside `.github/workflows/ci.yml`, which nothing outside GitHub
 * ever reads — so a cloud session, which clones `origin` and gets whatever Bun
 * its image happens to ship, had no way to know what the project was tested
 * against, and neither did anybody opening the repository. The question "are
 * we on the version this was written for" had no answer in the tree.
 *
 * Three places declare it now and this holds them equal:
 *
 * - **`.bun-version`** is the file, and the one to edit. `oven-sh/setup-bun`
 *   reads it directly (`bun-version-file`), so CI cannot drift from it.
 * - **`package.json`'s `packageManager`** is the ecosystem's own way of saying
 *   it, in the shape every other tool looks for.
 * - **`engines.bun`** is the floor, for a reader rather than for a check —
 *   Bun does not refuse to run on a mismatch and this test does not either.
 *
 * **It does not fail on the Bun you happen to be running.** A version that is
 * merely different is a session's business to report, not a reason to stop it
 * working (`docs/cloud-session.md` on saying what could not be verified);
 * what would be a bug is the three declarations disagreeing, because then
 * raising the version leaves one of them behind and CI tests something nobody
 * asked for.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** `1.4.0` — no `v`, no range, because two of the three readers take it
 * literally and a range would silently mean `latest` to one of them. */
const EXACT = /^\d+\.\d+\.\d+$/;

async function text(rel: string): Promise<string> {
  return await Bun.file(join(ROOT, rel)).text();
}

describe("the Bun version this project expects", () => {
  it("is one exact version in `.bun-version`", async () => {
    const pinned = (await text(".bun-version")).trim();
    expect(pinned, ".bun-version is not one exact version").toMatch(EXACT);
  });

  it("is the same version `package.json` names as its package manager", async () => {
    const pinned = (await text(".bun-version")).trim();
    const pkg = JSON.parse(await text("package.json")) as {
      packageManager?: string;
      engines?: { bun?: string };
    };
    expect(pkg.packageManager, "package.json does not name a package manager").toBe(
      `bun@${pinned}`,
    );
    // The floor is written as a range and has to admit the pinned version
    // itself, which is the only thing worth checking about it: a floor above
    // the pin would refuse the very version CI installs.
    expect(pkg.engines?.bun, "engines.bun does not admit the pinned version").toBe(`>=${pinned}`);
  });

  it("is the version the workflow installs, and the workflow reads the file", async () => {
    // `bun-version-file` rather than `bun-version`, so there is no second
    // number in the YAML to forget. If this ever goes back to a literal, the
    // assertion below is what says so.
    const ci = await text(".github/workflows/ci.yml");
    expect(ci, "CI names a Bun version of its own instead of reading the file").not.toMatch(
      /bun-version:\s*\d/,
    );
    expect(ci, "CI does not read .bun-version").toContain("bun-version-file: .bun-version");
  });
});
