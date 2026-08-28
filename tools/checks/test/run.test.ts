import { describe, expect, test } from "bun:test";
import type { Decision } from "../ledger.js";
import { settle } from "../run.js";

const CHECK = {
  sha: "1111111",
  text: "the hull renders — `bun run shapes`",
  command: "bun run shapes",
};

describe("settle", () => {
  test("a green command is a PASS, and gets recorded", async () => {
    const recorded: Decision[] = [];
    const outcome = await settle("/repo", CHECK, "2026-08-28", {
      run: async () => ({ ok: true, output: "done" }),
      record: async (_root, decision) => {
        recorded.push(decision);
      },
    });
    expect(outcome.status).toBe("PASS");
    expect(recorded).toEqual([
      { sha: "1111111", date: "2026-08-28", verdict: "PASS", text: CHECK.text, note: "" },
    ]);
  });

  test("a red exit is a FAIL, and is never recorded", async () => {
    const recorded: Decision[] = [];
    const outcome = await settle("/repo", CHECK, "2026-08-28", {
      run: async () => ({ ok: false, output: "boom" }),
      record: async (_root, decision) => {
        recorded.push(decision);
      },
    });
    expect(outcome.status).toBe("FAIL");
    expect(outcome.detail).toBe("boom");
    expect(recorded).toEqual([]);
  });

  test("a command that cannot even start is 'not run', not FAIL", async () => {
    const outcome = await settle("/repo", CHECK, "2026-08-28", {
      run: async () => {
        throw new Error("spawn wrangler ENOENT");
      },
    });
    expect(outcome.status).toBe("not run");
    expect(outcome.detail).toContain("ENOENT");
  });

  test("a command that hangs past the timeout is 'not run', and the caller does not hang with it", async () => {
    const outcome = await settle("/repo", CHECK, "2026-08-28", {
      timeoutMs: 10,
      run: () => new Promise(() => {}),
    });
    expect(outcome.status).toBe("not run");
    expect(outcome.detail).toContain("timed out");
  });

  test("a check with no command is 'not run' without ever calling the runner", async () => {
    let called = false;
    const outcome = await settle(
      "/repo",
      { sha: "1111111", text: "the wave's timing", command: null },
      "2026-08-28",
      {
        run: async () => {
          called = true;
          return { ok: true, output: "" };
        },
      },
    );
    expect(outcome.status).toBe("not run");
    expect(called).toBe(false);
  });
});
