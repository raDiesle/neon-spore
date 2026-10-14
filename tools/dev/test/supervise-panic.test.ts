import { describe, expect, it } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { fileCosts } from "../../test/figure.js";

// Two supervisors, each with a child that aborts once and a half-second wait
// before the second: about 700 ms apiece on the slower machine.
fileCosts(2000);

/**
 * **A child that panics at start is spawned once more** (`supervise.ts`). A
 * director restarted by a `git rm` died with the Bun panic its restart hit,
 * exit 134, and took the supervisor with it. These run the real loop against
 * a stub child that aborts with 134: once, and the second child serves; every
 * time, and the supervisor gives up after the second, with the child's code.
 */

const SUPERVISOR = fileURLToPath(new URL("../supervise.ts", import.meta.url));
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

/** Aborts with 134 the first time, or every time with `ALWAYS`; otherwise prints its pid and waits. */
const CHILD = `
const fs = require("node:fs");
const mark = process.env.PANIC_MARK;
if (process.env.ALWAYS || !fs.existsSync(mark)) { fs.writeFileSync(mark, ""); process.exit(134); }
console.log("child " + process.pid);
setInterval(() => {}, 60_000);
`;

function supervise(extra: Record<string, string>): Bun.Subprocess<"ignore", "pipe", "pipe"> {
  const bun = process.execPath;
  const mark = join(mkdtempSync(join(tmpdir(), "panic-")), "mark");
  return Bun.spawn([bun, SUPERVISOR, bun, "-e", CHILD], {
    cwd: ROOT,
    env: { ...process.env, NO_DEV_RESTART: "1", PANIC_MARK: mark, ...extra },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
}

/** Everything the supervisor printed until a child said its pid, or it exited. */
async function until(stdout: ReadableStream<Uint8Array>, said: RegExp): Promise<string> {
  const reader = stdout.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return buffered;
      buffered += decoder.decode(value, { stream: true });
      if (said.test(buffered)) return buffered;
    }
  } finally {
    reader.releaseLock();
  }
}

describe("supervise.ts and a panic at start", () => {
  it("starts the server once more, and says so in a line", async () => {
    const supervisor = supervise({});
    const out = await until(supervisor.stdout, /child \d+/);
    expect(out).toContain("crashed at start (exit 134)");
    expect(out).toMatch(/child \d+/);
    supervisor.kill();
    await supervisor.exited;
  });

  it("gives up on a second panic in a row, with the child's code", async () => {
    const supervisor = supervise({ ALWAYS: "1" });
    const out = await until(supervisor.stdout, /$^/);
    expect(await supervisor.exited).toBe(134);
    expect(out.match(/crashed at start/g)).toHaveLength(1);
  });
});
