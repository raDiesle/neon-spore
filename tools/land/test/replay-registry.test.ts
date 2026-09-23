import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { discover, registryText } from "../../versus/registry.js";
import { replay } from "../replay.js";

/**
 * The VERSUS registry through a real rebase: one side closes a slot, the other
 * opens one, each regenerates `registry.ts`, and git's merge of the two would
 * import the closed slot's directories. The case that put this here, 22
 * September 2026: the four `lost-screen` candidates dropped on one side, three
 * `slow-window` ones added on the other. `replay-repo.test.ts` gives the
 * reason this is a real repository and not strings.
 */

let root = "";
const CANDIDATES = "tools/versus/candidates";

async function git(args: string[]): Promise<void> {
  await gitIn(args, root);
}

async function candidate(path: string, symbol: string): Promise<void> {
  await Bun.write(
    join(root, CANDIDATES, path, "index.ts"),
    `export const ${symbol}: Variant = {};\n`,
  );
}

/** The registry as `bun run versus index` would write it over this tree, committed. */
async function regenerate(message: string): Promise<void> {
  await Bun.write(
    join(root, CANDIDATES, "registry.ts"),
    registryText(discover(join(root, CANDIDATES))),
  );
  await git(["add", "-A"]);
  await git(["commit", "-q", "-m", message]);
}

beforeAll(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-replay-registry-")));
  await git(["init", "-b", "main", "--quiet"]);
  await git(["config", "user.email", "test@example.com"]);
  await git(["config", "user.name", "Test"]);
  await candidate("lost-screen/pool", "POOL");
  await candidate("lost-screen/seam", "SEAM");
  await regenerate("a slot open");

  await git(["switch", "-c", "lane", "--quiet"]);
  await candidate("slow-window/drip", "DRIP");
  await regenerate("my lane opens a slot");
  await git(["switch", "main", "--quiet"]);
  await git(["rm", "-rq", `${CANDIDATES}/lost-screen`]);
  await regenerate("their lane closes one");
  await git(["switch", "lane", "--quiet"]);
}, repoTimeout(20));

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
}, repoTimeout(2));

describe("two lanes changing the VERSUS registry in the same hours", () => {
  test(
    "replays without stopping, and says it settled the registry",
    async () => {
      const out = await replay(root, "main");
      expect(out.ok).toBe(true);
      expect(out.resolved).toContain(`${CANDIDATES}/registry.ts`);
    },
    repoTimeout(12),
  );

  test(
    "registers what is on disk: the opened slot, and nothing of the closed one",
    async () => {
      const text = await Bun.file(join(root, CANDIDATES, "registry.ts")).text();
      expect(text).toContain(`from "./slow-window/drip/index.js"`);
      expect(text).not.toContain("lost-screen");
    },
    repoTimeout(2),
  );
});
