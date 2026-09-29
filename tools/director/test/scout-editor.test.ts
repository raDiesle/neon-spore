import { describe, expect, it } from "bun:test";
import { SCOUT_ARENAS } from "@neon-spore/content";
import type { ScoutArena, ScoutEntry } from "@neon-spore/sim";
import { renderScoutEditor } from "../src/scout-editor.js";
import { kindAt, press, scoutArenaFault } from "../src/scout-editor-grid.js";
import { levelComments, milli, serializeScoutArenas } from "../src/serialize-scout.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * THE SCOUT's levels in the director: a press walks a cell, the level bar
 * moves, and a save writes back exactly what was painted — and nothing else,
 * since the file it writes is the one the game ships.
 */

const SOURCE = await Bun.file(
  new URL("../../../packages/content/src/scout-arenas.ts", import.meta.url),
).text();

function blank(): ScoutArena {
  return { beats: 24, motes: [], hazards: [] };
}

describe("a press on a cell", () => {
  it("walks it through mote, hazard right, hazard left and back to nothing", () => {
    const a = blank();
    const seen: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      press(a, 2, 5);
      seen.push(kindAt(a, 2, 5));
    }
    expect(seen).toEqual(["mote", "right", "left", null]);
    expect(a.motes).toEqual([]);
    expect(a.hazards).toEqual([]);
  });

  it("puts a new piece in the middle of its tile and keeps one written off it", () => {
    const a = blank();
    press(a, 2, 5);
    expect(a.motes).toEqual([{ colMilli: 2_500, rowMilli: 5_500 }]);
    const b: ScoutArena = { ...blank(), motes: [{ colMilli: 1_500, rowMilli: 4_000 }] };
    press(b, 1, 4);
    expect(b.hazards[0]).toMatchObject({ colMilli: 1_500, rowMilli: 4_000 });
  });

  it("touches only its own tile", () => {
    const a: ScoutArena = structuredClone(SCOUT_ARENAS[2]!);
    const before = structuredClone(a);
    press(a, 0, 0);
    expect(a.hazards).toEqual(before.hazards);
    expect([...a.motes.slice(0, before.motes.length)]).toEqual([...before.motes]);
  });
});

describe("what the editor refuses to call a level", () => {
  it("passes every level the game ships", () => {
    for (const a of SCOUT_ARENAS) expect(scoutArenaFault(a)).toBeNull();
  });

  it("names an empty level and a mote on the mouth", () => {
    expect(scoutArenaFault(blank())).toMatch(/no mote/);
    const onMouth = { ...blank(), motes: [{ colMilli: 3_500, rowMilli: 13_500 }] };
    expect(scoutArenaFault(onMouth)).toMatch(/mouth/);
  });
});

describe("the level bar", () => {
  function render(boss: ScoutEntry, onEdit = () => {}): FakeEl {
    const panel = new FakeEl();
    renderScoutEditor(panel as unknown as HTMLElement, boss, onEdit);
    return panel;
  }
  const buttons = (panel: FakeEl, prefix: string) =>
    panel.descendants().filter((e) => e.textContent.startsWith(prefix));

  it("draws a tab a level and moves to the one pressed", () => {
    const dom = installDom();
    try {
      const boss: ScoutEntry = { kind: "scout", arenas: structuredClone(SCOUT_ARENAS) };
      let panel = render(boss);
      expect(buttons(panel, "LEVEL ")).toHaveLength(SCOUT_ARENAS.length);
      buttons(panel, "LEVEL 3")[0]?.click();
      panel = render(boss);
      const on = buttons(panel, "LEVEL ").findIndex((t) => t.classList.contains("on"));
      expect(on).toBe(2);
    } finally {
      dom.restore();
    }
  });

  it("adds a copy of the last level and opens on it", () => {
    const dom = installDom();
    try {
      const boss: ScoutEntry = { kind: "scout", arenas: structuredClone(SCOUT_ARENAS) };
      buttons(render(boss), "+")[0]?.click();
      expect(boss.arenas).toHaveLength(SCOUT_ARENAS.length + 1);
      expect(boss.arenas.at(-1)).toEqual(boss.arenas.at(-2)!);
      const on = buttons(render(boss), "LEVEL ").findIndex((t) => t.classList.contains("on"));
      expect(on).toBe(SCOUT_ARENAS.length);
    } finally {
      dom.restore();
    }
  });
});

describe("serializeScoutArenas", () => {
  it("writes the shipped levels back as the file they came from", () => {
    expect(serializeScoutArenas(SOURCE, SCOUT_ARENAS)).toBe(SOURCE);
  });

  it("keeps each level's comment over it, and writes a new level bare", () => {
    const arenas = [...structuredClone(SCOUT_ARENAS), blank()];
    press(arenas[4]!, 2, 5);
    const out = serializeScoutArenas(SOURCE, arenas);
    const after = out.slice(out.indexOf("SCOUT_ARENAS"));
    expect(levelComments(after)).toEqual([...levelComments(SOURCE), []]);
    expect(out).toContain("motes: [{ colMilli: 2_500, rowMilli: 5_500 }],");
  });

  it("refuses a source with no array to replace", () => {
    expect(() => serializeScoutArenas("// nothing here", SCOUT_ARENAS)).toThrow(/SCOUT_ARENAS/);
  });

  it("writes a number as the file does", () => {
    expect([500, 3_500, -2_600, 10_500, 0].map(milli)).toEqual([
      "500",
      "3_500",
      "-2_600",
      "10_500",
      "0",
    ]);
  });
});
