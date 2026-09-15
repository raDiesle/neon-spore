import { describe, expect, it } from "bun:test";
import { lines, RELAY_RUNS, runArgs } from "../all.js";

/**
 * **The four runs, and the one line each of them is read by.**
 *
 * `all.ts` starts a wrangler and stops it, which is not a thing a test does —
 * so what is held here is the part that decides *what is run* and *what is
 * printed*, and the driving around it is twenty lines with no choices in them.
 * The four are the four `.claude/skills/net-change` names, and each is one of
 * the things the Durable Object does that no unit test reaches.
 */

describe("the four relay checks", () => {
  it("are the four the skill names, in its order", () => {
    expect(RELAY_RUNS.map((r) => r.name)).toEqual(["plain", "split", "full", "rejoin"]);
  });

  it("carry the plain run without a flag and every other with its own", () => {
    expect(RELAY_RUNS[0]?.flag).toBeUndefined();
    expect(RELAY_RUNS.slice(1).map((r) => r.flag)).toEqual(["--split", "--full", "--rejoin"]);
  });

  it("give the rejoin longer than the rest, because a device has to come back", () => {
    // Drop, be gone a moment, return, and *then* be in step for long enough
    // that the fingerprint means something.
    const rejoin = RELAY_RUNS.find((r) => r.name === "rejoin");
    expect(rejoin?.seconds).toBeGreaterThan(RELAY_RUNS[0]?.seconds ?? 0);
  });

  it("say what a green run proves, so the line is a sentence and not a tick", () => {
    for (const run of RELAY_RUNS) expect(run.proves.length).toBeGreaterThan(10);
  });

  it("pass the relay first and the flag last, the way the check reads them", () => {
    const [plain, split] = RELAY_RUNS;
    if (!plain || !split) throw new Error("the four runs are not four");
    expect(runArgs(plain, "ws://127.0.0.1:1")).toEqual(["ws://127.0.0.1:1", "8"]);
    expect(runArgs(split, "ws://127.0.0.1:1")).toEqual(["ws://127.0.0.1:1", "8", "--split"]);
  });
});

describe("what a check said", () => {
  it("drops bun's echo of the command, which is otherwise the last line", () => {
    // The failure this catches: a run that passed printing the command it ran
    // in place of the verdict it reached.
    const said = lines(
      '$ bun run --cwd tools/relay-check all\n$ bun run check.ts "ws" "8"\nin step\n',
    );
    expect(said).toEqual(["in step"]);
  });

  it("keeps every line of a run that failed, because the verdict is not the story", () => {
    const said = lines("A  seat 1  live\nB  seat 2  gone\nout of step at tick 300\n");
    expect(said).toHaveLength(3);
  });

  it("drops the blank lines a spawn leaves at either end", () => {
    expect(lines("\n\nin step\n\n")).toEqual(["in step"]);
  });
});
