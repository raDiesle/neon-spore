import { describe, expect, test } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { DEFAULT_CONFIG, fallTilesPerBeat, hullRow, ticksPerBeat } from "@neon-spore/sim";
import { arrivalsIn, beatOfTick, standingNote, standingNotes } from "../press-standing.js";
import type { PressSpec } from "../spec.js";

/**
 * Whether the wave puts anything in the column a `--press` names.
 *
 * The other half of `press-column.test.ts`' failure, and the half that cost
 * the pictures: a column that exists and is empty photographs exactly as well
 * as one no authored column reaches, and the ledger's three sheets of a bolt
 * sailing past nothing were the first kind and not the second.
 *
 * Every number below is read off the shipped waves rather than written down,
 * so an edit to a wave moves the test with it and only the *rules* — the
 * column, the beat window, what silence means — are asserted.
 */

const CFG = DEFAULT_CONFIG;
const WAVE = 0;

/** A column this wave sends nothing into, and one it does. */
function columns(): { empty: number; used: number } {
  const used = new Set(buildQueue(WAVE, CFG.cols).map((e) => e.col));
  const empty = [...Array(CFG.cols).keys()].find((c) => !used.has(c));
  expect(empty, "every column of wave 1 is used; pick another wave").toBeDefined();
  const first = buildQueue(WAVE, CFG.cols)[0];
  expect(first, "wave 1 sends nothing at all").toBeDefined();
  return { empty: empty as number, used: (first as { col: number }).col };
}

function press(tick: number, col: number): PressSpec {
  return { tick, player: 1, command: { kind: "cannonCol", col } };
}

describe("arrivalsIn", () => {
  test("hands back only what the wave puts in that column", () => {
    const { used } = columns();
    const mine = arrivalsIn(WAVE, used, CFG);
    expect(mine.length).toBeGreaterThan(0);
    const queued = buildQueue(WAVE, CFG.cols).filter((e) => e.col === used);
    expect(mine.map((a) => a.beat)).toEqual(queued.map((e) => e.beat));
  });

  test("asks the simulation how fast a body falls rather than working it out", () => {
    const { used } = columns();
    for (const a of arrivalsIn(WAVE, used, CFG)) {
      const perBeat = fallTilesPerBeat(a.kind);
      // The window is the arrival beat plus the beats it takes to cross the
      // rows above the hull — and a kind that does not fall has no last beat
      // at all, which is the answer a wisp, a mine and the Warden's line want.
      if (perBeat === 0) expect(a.last).toBeNull();
      else expect(a.last).toBe(a.beat + Math.ceil(hullRow(CFG) / perBeat));
    }
  });

  test("is empty for a column the wave never uses", () => {
    const { empty } = columns();
    expect(arrivalsIn(WAVE, empty, CFG)).toEqual([]);
  });
});

describe("beatOfTick", () => {
  test("reads a press's tick as the beat the wave is written in", () => {
    const per = ticksPerBeat(CFG);
    expect(beatOfTick(0, CFG)).toBe(0);
    expect(beatOfTick(per - 1, CFG)).toBe(0);
    expect(beatOfTick(per, CFG)).toBe(1);
  });
});

describe("standingNote", () => {
  test("says so when the wave sends nothing into the column at all", () => {
    const { empty } = columns();
    const said = standingNote("cannonCol", empty, 0, WAVE, CFG);
    expect(said).toContain("sends nothing into field column");
    expect(said).toContain(`${empty}`);
  });

  test("is silent while something the wave sent is still above the hull", () => {
    const { used } = columns();
    const first = arrivalsIn(WAVE, used, CFG)[0];
    expect(first, "no arrival to stand on").toBeDefined();
    const tick = (first as { beat: number }).beat * ticksPerBeat(CFG);
    expect(standingNote("cannonCol", used, tick, WAVE, CFG)).toBeNull();
  });

  test("names the arrivals when the press lands with none of them up", () => {
    const { used } = columns();
    const all = arrivalsIn(WAVE, used, CFG);
    const latest = Math.max(...all.map((a) => a.last ?? 0));
    // A beat past the last one anything could still be falling on. Kinds that
    // never fall carry no last beat and would make this unanswerable, so a
    // wave full of them is a wave this case cannot be written against.
    expect(
      all.every((a) => a.last !== null),
      "wave 1 sends something that never falls",
    ).toBe(true);
    const said = standingNote("cannonCol", used, (latest + 1) * ticksPerBeat(CFG), WAVE, CFG);
    expect(said).toContain("is above the hull then");
    expect(said).toContain("arriving on beat");
  });

  test("never claims a column is empty when it is only the beat that is wrong", () => {
    const { used } = columns();
    const all = arrivalsIn(WAVE, used, CFG);
    const latest = Math.max(...all.map((a) => a.last ?? 0));
    const said = standingNote("cannonCol", used, (latest + 1) * ticksPerBeat(CFG), WAVE, CFG);
    expect(said).not.toContain("sends nothing");
  });
});

describe("standingNotes", () => {
  test("says a line per press, in the order they were written", () => {
    const { empty } = columns();
    const said = standingNotes([press(0, empty), press(10, empty)], WAVE, CFG);
    expect(said).toHaveLength(2);
  });

  test("has nothing to say about a control that is not a column", () => {
    const fire: PressSpec = { tick: 0, player: 1, command: { kind: "fire" } };
    expect(standingNotes([fire], WAVE, CFG)).toEqual([]);
  });
});
