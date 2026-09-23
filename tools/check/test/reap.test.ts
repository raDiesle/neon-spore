import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * A runner that is signalled takes its children with it (`reap.ts`).
 *
 * The runner here is a scratch script that does what `fast.ts` and `shard.ts`
 * do — `reapOnSignal`, then a tracked child — with a child that sleeps rather
 * than a `bun test` shard, so the test costs a second and not a suite. It is
 * sent the signal alone, the way a hook or another session sends one, never
 * to its group, which is the case a Ctrl-C at a terminal hides.
 */

let dir = "";

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "ns-reap-"));
  const reap = join(import.meta.dirname, "..", "reap.ts");
  await writeFile(
    join(dir, "runner.ts"),
    [
      `import { reapOnSignal, track } from ${JSON.stringify(reap)};`,
      "reapOnSignal();",
      'const child = track(Bun.spawn(["sleep", "60"]));',
      "console.log(child.pid);",
      "await child.exited;",
    ].join("\n"),
  );
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function firstLine(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  let text = "";
  while (!text.includes("\n")) {
    const { value, done } = await reader.read();
    if (done) break;
    text += new TextDecoder().decode(value);
  }
  reader.releaseLock();
  return text.split("\n")[0] ?? "";
}

async function gone(pid: number, withinMs: number): Promise<boolean> {
  const until = Date.now() + withinMs;
  while (Date.now() < until) {
    if (!alive(pid)) return true;
    await Bun.sleep(20);
  }
  return !alive(pid);
}

describe("reapOnSignal", () => {
  for (const [signal, code] of [
    ["SIGTERM", 143],
    ["SIGINT", 130],
  ] as const) {
    it(`takes a sleeping child with the runner on ${signal}`, async () => {
      const runner = Bun.spawn(["bun", join(dir, "runner.ts")], { stdout: "pipe" });
      const child = Number(await firstLine(runner.stdout));
      expect(alive(child)).toBe(true);

      runner.kill(signal);
      expect(await runner.exited).toBe(code);
      const reaped = await gone(child, 3000);
      if (!reaped) process.kill(child, "SIGKILL");
      expect(reaped).toBe(true);
    }, 10_000);
  }
});
