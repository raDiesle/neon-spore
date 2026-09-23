import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { freePort } from "../../../tools/ports.js";
import { fileCosts } from "../../../tools/test/figure.js";
import { wranglerCli, wranglerDevCommand } from "../dev.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. A wrangler started and stopped, which is the slowest child
// anything in the repository starts: 3.0 s alone on the cloud image on 18 September
// 2026, of which 2.3 s is the relay coming up and 6 ms is it going quiet again.
const CASE_MS = fileCosts(3000);

/**
 * And how long the relay itself gets, **inside** that budget rather than beside it.
 *
 * The two waits below were 60 s and 10 s flat under a case that was 90 s flat, and
 * three flat numbers agree with one another only until one of them is scaled. As
 * shares of the case's own budget they cannot outlast it however loaded the machine
 * is, which is what keeps the failure readable: `until` coming back false says the
 * relay never came up, and a timeout says only that something was slow.
 *
 * Sixteen twentieths and three, because that is the shape of the case — almost all
 * of it is the wait for the first answer — and the twentieth left over is the
 * spawn, the kill and the assertions around them.
 */
const UP_MS = Math.floor(CASE_MS * 0.8);
const DOWN_MS = Math.floor(CASE_MS * 0.15);

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
    expect(await until(() => up(port), UP_MS)).toBe(true);
  } finally {
    stop(proc.pid, proc);
  }
  expect(await until(async () => !(await up(port)), DOWN_MS)).toBe(true);
});
