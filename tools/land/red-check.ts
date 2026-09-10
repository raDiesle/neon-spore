import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * What a landing says when `bun run check` comes back red.
 *
 * It printed the last twenty-five lines of the check's output until 10
 * September 2026, and a red shard's name sits well above the tail of eight
 * shards' output: three landings in one afternoon went red on the same flake
 * and none of them could say which test it was, so the flake went into
 * `docs/queue.md` nameless twice. Now the failing tests' own lines come first,
 * the tail follows, and the whole of it is kept in a file the last line names
 * — so a session that ran `land` through `tail` still has something to read.
 */

/** How many closing lines of the check's output are shown after the names. */
const TAIL = 25;

/** The lines that name a failure: bun's `(fail)` rows, the sharder's red
 * shard headers, and a timeout, which is the flake this was written for. */
const NAMED = /\(fail\)|^✗ shard|timed out/;

/** The report, as lines to print, with the whole output kept on disk. */
export async function redCheckReport(output: string, trunk: string): Promise<string[]> {
  const all = output.trim();
  const kept = join(tmpdir(), `neon-spore-check-${process.pid}.log`);
  await Bun.write(kept, `${all}\n`);
  const lines = all.split("\n");
  return [
    `✗ bun run check is red on the replayed lane; ${trunk} was not moved`,
    ...lines.filter((l) => NAMED.test(l)),
    ...lines.slice(-TAIL),
    `  kept     the whole of it — ${kept}`,
  ];
}
