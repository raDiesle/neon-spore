import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { freePort } from "../../../tools/ports.js";
import { wranglerCli, wranglerDevCommand } from "../dev.js";

const DEV = Bun.fileURLToPath(new URL("../dev.ts", import.meta.url));

/** Whether anything answers the relay's health line on that port right now. */
async function up(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/net/health`, {
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function until(cond: () => Promise<boolean>, ms: number): Promise<boolean> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await cond()) return true;
    await Bun.sleep(250);
  }
  return cond();
}

/**
 * Stop the process the way anything outside a console does: the whole tree on
 * Windows, where there are no signals to forward, and `SIGTERM` elsewhere,
 * which `dev.ts` passes on to wrangler.
 */
function stop(pid: number, proc: Bun.Subprocess): void {
  if (process.platform === "win32") {
    Bun.spawnSync(["taskkill", "/F", "/T", "/PID", String(pid)]);
  } else {
    proc.kill("SIGTERM");
  }
}

test("dev.ts runs wrangler's own entry point as its direct child", () => {
  const cmd = wranglerDevCommand(8800);
  expect(cmd[0]).toBe("node");
  expect(cmd).not.toContain("npx");
  expect(existsSync(wranglerCli())).toBe(true);
  expect(cmd.slice(-2)).toEqual(["--port", "8800"]);
});

/**
 * The relay is started and stopped for real. It was `npx` through a shell,
 * and stopping the script left wrangler and two `workerd` holding the port
 * behind a shell that had already exited — found by hand on 12 September
 * 2026 after the script's own tree kill had reported the port free.
 */
test("stopping dev.ts stops the wrangler under it", async () => {
  const port = await freePort();
  const proc = Bun.spawn(["bun", DEV], {
    env: { ...process.env, RELAY_PORT: String(port), WRANGLER_SEND_METRICS: "false" },
    stdout: "ignore",
    stderr: "ignore",
  });
  try {
    expect(await until(() => up(port), 60_000)).toBe(true);
  } finally {
    stop(proc.pid, proc);
  }
  expect(await until(async () => !(await up(port)), 10_000)).toBe(true);
}, 90_000);
