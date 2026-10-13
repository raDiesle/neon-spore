import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HANG_MS } from "../../test/cpu-time.js";

/**
 * **A refused run leaves no `frame.png` in `--out`** (`frame-files.ts`,
 * `setAside`). The last run's is renamed `frame.stale.png`, so a lane that
 * piped the refusal away and opens `frame.png` finds nothing rather than an
 * old picture it takes for new — which happened twice on 9 October 2026.
 *
 * Refused on its flags, before any build or browser: `--until` and `--ticks`
 * both say when the picture is taken (`until-flags.ts`).
 */

const RUN = join(import.meta.dir, "..", "run.ts");
let out = "";

beforeAll(async () => {
  out = await mkdtemp(join(tmpdir(), "ns-refused-run-"));
});

afterAll(async () => {
  await rm(out, { recursive: true, force: true });
});

describe("a refused frames run", () => {
  it(
    "renames the last run's frame .stale.png and says so",
    async () => {
      await writeFile(join(out, "frame.png"), "old");
      const argv = [".", "--wave", "THE HIVE", "--until", "hiveOpen", "--ticks", "40"];
      const run = Bun.spawn(["bun", RUN, ...argv, "--out", out], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const said = await new Response(run.stderr).text();
      expect(await run.exited).toBe(1);
      expect(said).toContain("frame.stale.png");
      expect(await readdir(out)).toEqual(["frame.stale.png"]);
    },
    HANG_MS,
  );
});
