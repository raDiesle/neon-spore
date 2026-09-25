import { describe, expect, test } from "bun:test";
import { emptyWave, entryAt, insertBeat, paint, podAt, removeBeat } from "../src/state.js";

/**
 * A BEAT ROW OPENED, AND A BEAT ROW TAKEN OUT.
 *
 * The map's two row verbs (`paint.ts`, reached from the beat labels in
 * `grid-rows.ts`). What matters is the shift: an insert moves everything at
 * or after the beat one later and leaves the row empty; a remove drops what is
 * on the beat and moves everything after one earlier — entries and pods
 * alike, and nothing before the beat moves at all. And the two are inverses,
 * so an empty row opened by mistake can be taken back in an editor with no
 * undo, the first row included.
 */

/** How many things a row holds, entries and pods together. */
function onBeat(wave: ReturnType<typeof emptyWave>, beat: number): number {
  return (
    wave.entries.filter((e) => e.beat === beat).length +
    (wave.pods ?? []).filter((p) => p.beat === beat).length
  );
}

function threeBeats() {
  const wave = emptyWave();
  paint(wave, 0, 1, "slick");
  paint(wave, 2, 3, "slick");
  paint(wave, 2, 5, "purge");
  paint(wave, 4, 0, "slick");
  return wave;
}

describe("insertBeat", () => {
  test("opens an empty row and moves this beat and every later one down by one", () => {
    const wave = threeBeats();
    insertBeat(wave, 2);
    expect(entryAt(wave, 0, 1)).toBeDefined();
    expect(onBeat(wave, 2)).toBe(0);
    expect(entryAt(wave, 3, 3)).toBeDefined();
    expect(podAt(wave, 3, 5)).toBeDefined();
    expect(entryAt(wave, 5, 0)).toBeDefined();
    expect(wave.entries).toHaveLength(3);
  });

  test("before beat 0 moves the whole wave a beat later", () => {
    const wave = threeBeats();
    insertBeat(wave, 0);
    expect(onBeat(wave, 0)).toBe(0);
    expect(entryAt(wave, 1, 1)).toBeDefined();
    expect(entryAt(wave, 3, 3)).toBeDefined();
    expect(podAt(wave, 3, 5)).toBeDefined();
  });

  test("keeps what hangs off an entry: the shift is a move, not a repaint", () => {
    const wave = threeBeats();
    const before = entryAt(wave, 2, 3);
    insertBeat(wave, 1);
    expect(entryAt(wave, 3, 3)).toBe(before as NonNullable<typeof before>);
  });
});

describe("removeBeat", () => {
  test("drops what is on the beat and moves every later row up by one", () => {
    const wave = threeBeats();
    removeBeat(wave, 2);
    expect(entryAt(wave, 0, 1)).toBeDefined();
    expect(entryAt(wave, 3, 0)).toBeDefined();
    expect(wave.entries).toHaveLength(2);
    // The pod went with its row, and an empty pod list is no pod list.
    expect(wave.pods).toBeUndefined();
  });

  test("an empty row goes without touching what is before it", () => {
    const wave = threeBeats();
    removeBeat(wave, 1);
    expect(entryAt(wave, 0, 1)).toBeDefined();
    expect(entryAt(wave, 1, 3)).toBeDefined();
    expect(podAt(wave, 1, 5)).toBeDefined();
    expect(entryAt(wave, 3, 0)).toBeDefined();
  });

  test("takes back an insert, beat 0 included", () => {
    const wave = threeBeats();
    const was = JSON.stringify(wave);
    insertBeat(wave, 0);
    removeBeat(wave, 0);
    expect(JSON.stringify(wave)).toBe(was);
    insertBeat(wave, 3);
    removeBeat(wave, 3);
    expect(JSON.stringify(wave)).toBe(was);
  });

  test("beat 0 with something on it goes like any other row, the wave starting from the next", () => {
    const wave = threeBeats();
    removeBeat(wave, 0);
    expect(entryAt(wave, 1, 3)).toBeDefined();
    expect(podAt(wave, 1, 5)).toBeDefined();
    expect(entryAt(wave, 3, 0)).toBeDefined();
    expect(wave.entries).toHaveLength(2);
  });
});

describe("removeBeat across a span", () => {
  test("takes every row from the first to the last and moves the rest up by as many", () => {
    const wave = threeBeats();
    removeBeat(wave, 1, 3);
    expect(entryAt(wave, 0, 1)).toBeDefined();
    expect(entryAt(wave, 1, 0)).toBeDefined();
    expect(wave.entries).toHaveLength(2);
    expect(wave.pods).toBeUndefined();
  });

  test("is what one row at a time would have done, taken from the top", () => {
    const one = threeBeats();
    const span = threeBeats();
    for (let i = 0; i < 3; i++) removeBeat(one, 0);
    removeBeat(span, 0, 2);
    expect(JSON.stringify(span)).toBe(JSON.stringify(one));
  });
});
