import { relayPort } from "../ports.js";

/**
 * **The four relay checks, against a wrangler this script starts and stops.**
 *
 * `bun run relay:check` wants a relay already running, which is right for
 * somebody with two terminals and wrong for everything else. Two lanes have now
 * written the same throwaway script to get one: start `apps/server/dev.ts`,
 * wait for it, run the checks, kill it. The second time a session writes the
 * same file is the point at which it should be a command, and the thing that
 * makes it worth one is the *stopping* — a wrangler left standing holds the
 * tree's port, and the hunt for a stray `workerd` is what cost the first lane
 * its afternoon (`apps/server/test/dev-stop.test.ts`).
 *
 * One process, in the foreground, so the relay cannot outlive the run: it is a
 * direct child, and a `finally` kills it whether the checks passed, failed or
 * threw.
 *
 * **A cloud session can run this.** `docs/cloud-session.md` said the sandbox
 * had no wrangler until 15 September 2026, when all four came back green from
 * one; the four things they prove are the four the Durable Object does that no
 * unit test reaches (`.claude/skills/net-change`).
 */

/** What each run is called and what it proves, in the order the skill lists. */
export interface RelayRun {
  name: string;
  /** Seconds of simulated play. The rejoin needs longer: a device has to drop,
   * be gone a moment, come back and then be in step for the count to mean
   * anything. */
  seconds: number;
  flag?: string;
  /** What a green run says, for the line this prints. */
  proves: string;
}

export const RELAY_RUNS: readonly RelayRun[] = [
  { name: "plain", seconds: 8, proves: "two devices still share a fingerprint" },
  { name: "split", seconds: 8, flag: "--split", proves: "a forced desync is caught" },
  { name: "full", seconds: 8, flag: "--full", proves: "a third device is told the room is full" },
  { name: "rejoin", seconds: 14, flag: "--rejoin", proves: "a dropped seat comes back in step" },
];

/** One run's arguments, as `tools/relay-check/check.ts` reads them. */
export function runArgs(run: RelayRun, relay: string): string[] {
  return [relay, String(run.seconds), ...(run.flag ? [run.flag] : [])];
}

/** Whether the relay answers its own health line. The same question
 * `dev-stop.test.ts` asks, and the only one worth waiting on: a port that
 * accepts a socket is not a Durable Object that is ready to seat anybody. */
async function healthy(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/net/health`, {
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * What a check actually said, without `bun run`'s own echo of the command.
 *
 * `bun run --cwd … check` prints `$ bun run check.ts …` before the script's
 * first word, so the *last* line of the output is that echo rather than the
 * verdict — and a verdict is the one line worth printing for a run that
 * passed.
 */
export function lines(output: string): string[] {
  return output
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l !== "" && !l.startsWith("$ "));
}

async function until(cond: () => Promise<boolean>, ms: number): Promise<boolean> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await cond()) return true;
    await Bun.sleep(250);
  }
  return cond();
}

/** How long wrangler is given to come up. It fetches a `Request.cf` it cannot
 * reach on a sandboxed machine and falls back after a timeout of its own, so
 * the first start is slower than the second. */
const UP_MS = 120_000;

if (import.meta.main) {
  const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
  const port = Number(process.env.RELAY_PORT ?? relayPort(root));
  const relay = `ws://127.0.0.1:${port}`;

  const dev = Bun.spawn(["bun", "apps/server/dev.ts"], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, RELAY_PORT: String(port) },
  });

  let failed = 0;
  try {
    if (!(await until(() => healthy(port), UP_MS))) {
      console.log(`✗ the relay never answered http://127.0.0.1:${port}/net/health`);
      process.exit(1);
    }
    console.log(`relay up on ${relay}\n`);

    for (const run of RELAY_RUNS) {
      const one = Bun.spawn(
        ["bun", "run", "--cwd", "tools/relay-check", "check", ...runArgs(run, relay)],
        {
          cwd: root,
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const [out, err, code] = await Promise.all([
        new Response(one.stdout).text(),
        new Response(one.stderr).text(),
        one.exited,
      ]);
      if (code !== 0) failed++;
      // The check's own last line is its verdict; the rest is two devices
      // reporting their seat and their tick, which is worth keeping on a
      // failure and noise on a pass.
      const said = lines(`${out}${err}`);
      const tail = code === 0 ? said.slice(-1) : said;
      console.log(`${code === 0 ? "✓" : "✗"} ${run.name} — ${run.proves}`);
      for (const line of tail) console.log(`    ${line}`);
    }
  } finally {
    // Stopping `dev.ts` stops the wrangler under it: it is a direct child and
    // goes with it. Never a hunt for `workerd`.
    dev.kill();
    await dev.exited;
  }

  console.log(failed === 0 ? "\nall four green" : `\n${failed} of ${RELAY_RUNS.length} red`);
  process.exit(failed === 0 ? 0 : 1);
}
