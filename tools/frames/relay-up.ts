import { relayPort } from "../ports.js";

/**
 * **The relay, up and then down again**, for a tool that needs one for the
 * length of one run.
 *
 * The same bargain `startPreview` makes next door, and for the same reason: a
 * session that may not leave a server standing cannot use a tool that assumes
 * one is already up. `apps/server/dev.ts` is spawned as a direct child, so
 * stopping it stops the wrangler under it — never a hunt for a stray `workerd`
 * (`apps/server/test/dev-stop.test.ts`).
 *
 * `tools/relay-check/all.ts` does this for the four checks; this is the same
 * three steps for anything that wants a room to be real. They are not shared
 * because that one must run with no dependency on `playwright-core`, which is
 * this package's.
 */

/** Whether the relay answers its own health line, which is the only readiness
 * worth waiting on: a port that accepts a socket is not a Durable Object ready
 * to seat anybody. */
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

/** Wrangler fetches a `Request.cf` it cannot reach on a sandboxed machine and
 * falls back after a timeout of its own, so a first start is slow. */
const UP_MS = 120_000;

export async function startRelay(cwd: string): Promise<{ url: string; stop: () => Promise<void> }> {
  const port = Number(process.env.RELAY_PORT ?? relayPort(cwd));
  const proc = Bun.spawn(["bun", "apps/server/dev.ts"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, RELAY_PORT: String(port) },
  });
  const end = Date.now() + UP_MS;
  while (Date.now() < end) {
    if (await healthy(port)) {
      return {
        url: `ws://127.0.0.1:${port}`,
        stop: async () => {
          proc.kill();
          await proc.exited;
        },
      };
    }
    await Bun.sleep(250);
  }
  proc.kill();
  await proc.exited;
  throw new Error(`the relay never answered http://127.0.0.1:${port}/net/health`);
}
