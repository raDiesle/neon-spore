import { expect, test } from "bun:test";
import { createWorld, DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { TryLog } from "../src/field-try-log.js";
import { type FakeEl, installDom } from "./fake-dom.js";

/**
 * TRY's three columns (`field-try-log.ts`): what the hand sent, what the
 * game said, what its mixer played — a drag's every-tick command counted
 * rather than repeated, the beat left out, and RESTART emptying all three.
 */

const columns = (log: TryLog): string[] =>
  (log.element as unknown as FakeEl).children.map((box) => box.children[1]?.textContent ?? "");

test("TRY's log lists what was sent and said, counts a repeat, and empties on RESTART", () => {
  const dom = installDom();
  try {
    const log = new TryLog();
    const world = createWorld(DEFAULT_CONFIG, 1);
    const drag = { kind: "drag", target: "valveWheel", on: true, fromMilli: 353 } as const;
    log.sent(1, drag);
    log.sent(1, drag);
    log.sent(1, drag);
    const said = [{ type: "beat" }, { type: "ratchetJam", col: 3 }] as unknown as SimEvent[];
    log.frame(world, said, "p1");
    const [sent, game] = columns(log);
    expect(sent).toContain("P1 drag · target valveWheel");
    expect(sent).toContain("×3");
    expect(sent?.split("\n")).toHaveLength(1);
    expect(game).toBe(`${world.tick}  ratchetJam`);
    log.reset();
    expect(columns(log)).toEqual(["", "", ""]);
    log.dispose();
  } finally {
    dom.restore();
  }
});
