import { describe, expect, test } from "bun:test";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { FIELD_GROUPS } from "../src/field-families.js";
import { DECISIONS, ROW_NOTES } from "../src/field-notes.js";
import { GESTURE_NOTES, TRIED_NOTES } from "../src/field-notes-gestures.js";
import { GESTURES } from "../src/gesture-catalogue.js";
import { TRIED_CONTROLS } from "../src/tried-controls-page.js";

/**
 * CONTROLS › ON THE FIELD names its rows rather than holding them: the
 * families and the suggestions are keyed by a row's name, and the rows
 * themselves stay in `FIELD_CONTROLS`. A name is a promise nothing else
 * checks — a row renamed, added or cut would leave the page silently short or
 * pointing at nothing. So every row is in exactly one group, every name the
 * page uses is a row, and every gesture and tried control has its SUGGESTED
 * line.
 */

const ROWS = new Set(FIELD_CONTROLS.map((c) => c.name));

describe("CONTROLS › ON THE FIELD", () => {
  test("no two rows share a name", () => {
    expect(ROWS.size).toBe(FIELD_CONTROLS.length);
  });

  test("every row is in exactly one group", () => {
    const seen = new Map<string, string[]>();
    for (const g of FIELD_GROUPS)
      for (const name of g.members) seen.set(name, [...(seen.get(name) ?? []), g.key]);
    const twice = [...seen].filter(([, keys]) => keys.length > 1).map(([n]) => n);
    const nowhere = [...ROWS].filter((n) => !seen.has(n));
    expect({ twice, nowhere }).toEqual({ twice: [], nowhere: [] });
  });

  test("every name the page uses is a row", () => {
    const named = [
      ...FIELD_GROUPS.flatMap((g) => g.members),
      ...Object.keys(ROW_NOTES),
      ...DECISIONS.flatMap((d) => d.rows ?? []),
    ];
    expect(named.filter((n) => !ROWS.has(n))).toEqual([]);
  });

  test("every group key is its own", () => {
    const keys = FIELD_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("every gesture has a suggestion, and every suggestion a gesture", () => {
    const names = GESTURES.map((g) => g.name);
    expect(names.filter((n) => !GESTURE_NOTES[n])).toEqual([]);
    expect(Object.keys(GESTURE_NOTES).filter((n) => !names.includes(n))).toEqual([]);
  });

  test("every control tried and set aside has a suggestion", () => {
    expect(TRIED_CONTROLS.filter((c) => !TRIED_NOTES[c.name]).map((c) => c.name)).toEqual([]);
  });
});
