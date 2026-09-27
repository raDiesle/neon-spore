import { expect, test } from "bun:test";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { git as gitOut } from "../git.js";
import { replay } from "../replay.js";

/**
 * Two rows for one file that git merges **without a conflict**, so no
 * resolver is ever asked (`index-merge.ts`). The lane's row went in at the
 * end of the table and the trunk's near the top, far enough apart that the
 * two hunks do not touch — and the replay has to be the one to notice.
 */

const rows = (...r: string[]) =>
  `# Context map\n\n| Path | One line |\n|---|---|\n${r.join("\n")}\n`;
const FILLER = ["a", "b", "c", "d", "e"].map((n) => `| \`tools/${n}.ts\` | Tool ${n} |`);
const RIME = "| `tools/zg.ts` | **What THE RIME is asking for** |";
const TRIVET = "| `tools/zg.ts` | **What THE TRIVET is asking for** |";

test(
  "a replay whose clean merge names one file twice stops, and puts the lane back",
  async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "index-twice-")));
    const run = (args: string[]) => gitIn(args, root);
    const index = (text: string) => writeFile(join(root, "docs", "INDEX.md"), text);
    try {
      await mkdir(join(root, "docs"), { recursive: true });
      await index(rows(...FILLER));
      await run(["init", "-b", "main", "--quiet"]);
      await run(["config", "user.email", "t@t"]);
      await run(["config", "user.name", "t"]);
      await run(["add", "-A"]);
      await run(["commit", "-q", "-m", "the table"]);

      await run(["checkout", "-q", "-b", "lane"]);
      await index(rows(...FILLER, TRIVET));
      await run(["commit", "-q", "-am", "THE TRIVET's page"]);
      const laneWas = await gitOut(["rev-parse", "HEAD"], root);

      await run(["checkout", "-q", "main"]);
      const [first, ...rest] = FILLER;
      await index(rows(first ?? "", RIME, ...rest));
      await run(["commit", "-q", "-am", "THE RIME's page"]);

      await run(["checkout", "-q", "lane"]);
      const out = await replay(root, "main");
      expect(out.ok).toBe(false);
      expect(out.said).toContain("the replay's docs/INDEX.md has two rows for tools/zg.ts");
      expect(out.resolved).toEqual([]);
      expect(await gitOut(["rev-parse", "HEAD"], root)).toBe(laneWas);
      expect(await gitOut(["status", "--porcelain"], root)).toBe("");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  repoTimeout(14),
);
