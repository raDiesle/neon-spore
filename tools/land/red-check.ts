import { tmpdir } from "node:os";
import { join } from "node:path";
import { LOAD_MARK } from "../check/closing.js";

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
export async function redCheckReport(
  output: string,
  trunk: string,
  script = "check",
): Promise<string[]> {
  const all = output.trim();
  const kept = join(tmpdir(), `neon-spore-check-${process.pid}.log`);
  await Bun.write(kept, `${all}\n`);
  const lines = all.split("\n");
  return [
    `✗ bun run ${script} is red on the replayed lane; ${trunk} was not moved`,
    ...lines.filter((l) => NAMED.test(l)),
    ...lines.slice(-TAIL),
    `  kept     the whole of it — ${kept}`,
  ];
}

/**
 * Whether a red check is worth one more run: it said every failure was a
 * timeout and none an assertion (`tools/check/closing.ts`'s `loadLine`).
 */
export function onlyTimedOut(output: string): boolean {
  return output.split("\n").some((l) => l.trimStart().startsWith(LOAD_MARK));
}

/**
 * `bun run <args>` in `root`, said green or not; a red one is reported here,
 * the same way for the full check and for the narrowed one a race asks for
 * (`race-retry.ts`).
 *
 * **A red that only timed out is run once more before it is reported.** On
 * 15 October 2026 one two-button landing went red twice before it passed the
 * third time, each time on a different test running out of time under other
 * sessions' load, and each red was a session reading a test the diff never
 * reached. Once, and only once: a second red is reported whatever it says,
 * and the load average on its line tells a busy machine from a hung test.
 */
export async function checkGreen(
  root: string,
  trunk: string,
  args: string[],
  again = true,
): Promise<boolean> {
  const check = Bun.spawn(["bun", "run", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(check.stdout).text(),
    new Response(check.stderr).text(),
    check.exited,
  ]);
  if (code === 0) return true;
  const said = `${out}${err}`;
  if (again && onlyTimedOut(said)) {
    const line = said.split("\n").find((l) => l.trimStart().startsWith(LOAD_MARK)) ?? "";
    console.log(`  again    bun run ${args[0]} — ${line.trim()}`);
    return checkGreen(root, trunk, args, false);
  }
  for (const line of await redCheckReport(said, trunk, args[0])) console.log(line);
  return false;
}
