import { describe, expect, test } from "bun:test";
import { WAVES, type Wave } from "@neon-spore/content";
import { flagsOf, shortPanel, waveRows } from "../src/waves-table-rows.js";

/**
 * DOCUMENTATION › WAVES › EVERY WAVE's rows: the ranges of
 * `docs/spec/wave-curriculum.md` §3 said on the row they are broken on — the
 * owner, 15 October 2026.
 */

const wave = (over: Partial<Wave> = {}): Wave => ({ id: "w", name: "W", entries: [], ...over });
const at = (beats: number[]): Wave["entries"] =>
  beats.map((beat) => ({ beat, col: 5, color: "red" as const }));

describe("shortPanel", () => {
  test("STANDARD is S, a numbered one keeps its number, the rest lose THE", () => {
    expect(shortPanel("STANDARD")).toBe("S");
    expect(shortPanel("STANDARD 4")).toBe("S4");
    expect(shortPanel("THE CLAW")).toBe("CLAW");
  });
});

describe("flagsOf", () => {
  const row = (w: Wave, clearBeat: number | undefined, kind: "boss" | "intro" | "regular") => ({
    index: 40,
    wave: w,
    kind,
    fresh: [],
    panel: { short: "S", full: "STANDARD" },
    arrivals: w.entries.length,
    span: Math.max(0, ...w.entries.map((e) => e.beat)),
    clearBeat,
    autoSeconds:
      clearBeat === undefined || clearBeat < 0 ? undefined : Math.round(clearBeat * 0.625),
    pressure: undefined,
    head: 39,
    size: 0,
    flags: [],
  });

  test("a regular wave in range says nothing", () => {
    expect(flagsOf(row(wave({ entries: at([0, 8, 16, 24, 30]) }), 40, "regular"), true)).toEqual(
      [],
    );
  });

  test("a short regular wave is flagged on its span and its arrivals", () => {
    const flags = flagsOf(row(wave({ entries: at([0, 4]) }), 12, "regular"), true);
    expect(flags.map((f) => f.column).sort()).toEqual(["arrivals", "span"]);
    expect(flags.every((f) => f.level === "warn")).toBe(true);
  });

  test("a wave AUTO loses is the worst thing on the row, and first", () => {
    const flags = flagsOf(row(wave({ entries: at([0, 4]) }), -1, "regular"), true);
    expect(flags[0]).toMatchObject({ column: "auto", level: "bad" });
  });

  test("a boss is held to its band, and nothing else", () => {
    const short = flagsOf(row(wave({ boss: { kind: "queen" } as Wave["boss"] }), 20, "boss"), true);
    expect(short.map((f) => f.text)).toEqual(["short for a normal boss: 30–60 s"]);
    expect(
      flagsOf(row(wave({ boss: { kind: "queen" } as Wave["boss"] }), 72, "boss"), true),
    ).toEqual([]);
  });
});

describe("waveRows", () => {
  const clear = Object.fromEntries(WAVES.map((w) => [w.id, 40]));
  const rows = waveRows(WAVES, clear);

  test("one row a wave, folded the way the wave list folds them", () => {
    expect(rows).toHaveLength(WAVES.length);
    for (const r of rows) {
      if (r.head !== -1) expect(rows[r.head]?.size ?? 0).toBeGreaterThan(0);
      if (r.wave.boss) expect(r.head).toBe(-1);
    }
  });

  test("a wave never measured says so rather than passing", () => {
    const fresh = waveRows(WAVES, {});
    expect(fresh[0]?.flags.some((f) => f.text.startsWith("not measured"))).toBe(true);
  });
});
