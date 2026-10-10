import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { placedGestures } from "../src/field-action-cards.js";
import {
  EVERY_WAVE_ROWS,
  FIELD_ACTIONS,
  OFF_THE_PAGE,
  sortedActions,
  typeUses,
  usersOf,
} from "../src/field-actions.js";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { USE_LOOKS } from "../src/field-looks.js";
import { DECISIONS, ROW_NOTES } from "../src/field-notes.js";
import { GESTURE_NOTES, TRIED_NOTES } from "../src/field-notes-gestures.js";
import { GESTURES } from "../src/gesture-catalogue.js";
import { TRIED_CONTROLS } from "../src/tried-controls-page.js";

/**
 * CONTROLS › ON THE FIELD names its rows rather than holding them: the
 * actions, their types and the suggestions are keyed by a row's name, and the rows
 * themselves stay in `FIELD_CONTROLS`. A name is a promise nothing else
 * checks — a row renamed, added or cut would leave the page silently short or
 * pointing at nothing. So every row is in exactly one place — EVERY WAVE, one
 * type of one action, or off the page with a reason; a row of many steps on
 * every type one of its steps uses, saying which — every name the page
 * uses is a row, every row belongs to a wave that exists, and every gesture and tried control has its SUGGESTED
 * line.
 */

const ROWS = new Set(FIELD_CONTROLS.map((c) => c.name));

describe("CONTROLS › ON THE FIELD", () => {
  test("no two rows share a name", () => {
    expect(ROWS.size).toBe(FIELD_CONTROLS.length);
  });

  const TYPES = FIELD_ACTIONS.flatMap((a) => a.types);
  const PLACES: [string, readonly string[]][] = [
    ["every", EVERY_WAVE_ROWS],
    ["off", Object.keys(OFF_THE_PAGE)],
    ...FIELD_ACTIONS.flatMap((a) =>
      a.types.map((t): [string, readonly string[]] => [`${a.key}/${t.key}`, t.rows]),
    ),
  ];

  /** A row of many steps, on a type that names which step it is. */
  const stepped = new Set(TYPES.flatMap((t) => Object.keys(t.steps ?? {})));

  test("every row is in exactly one place, or one card per step it has", () => {
    const seen = new Map<string, string[]>();
    for (const [key, rows] of PLACES)
      for (const name of rows) seen.set(name, [...(seen.get(name) ?? []), key]);
    const twice = [...seen]
      .filter(([n, keys]) => keys.length > 1 && !stepped.has(n))
      .map(([n]) => n);
    const nowhere = [...ROWS].filter((n) => !seen.has(n));
    expect({ twice, nowhere }).toEqual({ twice: [], nowhere: [] });
  });

  test("a row of many steps names its step on every type it is on, and only there", () => {
    const unnamed = TYPES.flatMap((t) =>
      t.rows.filter((r) => stepped.has(r) && !t.steps?.[r]).map((r) => `${t.key}: ${r}`),
    );
    const astray = TYPES.flatMap((t) =>
      Object.keys(t.steps ?? {})
        .filter((r) => !t.rows.includes(r))
        .map((r) => `${t.key}: ${r}`),
    );
    const anywhereElse = [...EVERY_WAVE_ROWS, ...Object.keys(OFF_THE_PAGE)].filter((r) =>
      stepped.has(r),
    );
    expect({ unnamed, astray, anywhereElse }).toEqual({
      unnamed: [],
      astray: [],
      anywhereElse: [],
    });
  });

  test("every name the page uses is a row", () => {
    const named = [
      ...PLACES.flatMap(([, rows]) => rows),
      ...Object.keys(ROW_NOTES),
      ...DECISIONS.flatMap((d) => d.rows ?? []),
    ];
    expect(named.filter((n) => !ROWS.has(n))).toEqual([]);
  });

  test("every row on an action belongs to a wave that exists", () => {
    const waves = new Set(WAVES.map((w) => w.name));
    const users = usersOf(TYPES.flatMap((t) => t.rows));
    expect(users.filter((u) => !waves.has(u))).toEqual([]);
  });

  test("every action and every type has a key of its own", () => {
    const keys = PLACES.map(([key]) => key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("every card says how it is found and what it does under the finger, once", () => {
    const cards = TYPES.flatMap((t) =>
      usersOf(t.rows).map((u) => t.rows.filter((r) => usersOf([r])[0] === u)),
    );
    const wrong = cards.filter((rows) => rows.filter((r) => USE_LOOKS[r]).length !== 1);
    expect(wrong).toEqual([]);
    const onCards = new Set(cards.flat());
    expect(Object.keys(USE_LOOKS).filter((k) => !onCards.has(k))).toEqual([]);
  });

  test("actions and types are drawn most used first", () => {
    const sorted = sortedActions();
    const uses = sorted.map((s) => s.uses);
    expect(uses).toEqual([...uses].sort((a, b) => b - a));
    for (const s of sorted) {
      const t = s.types.map(typeUses);
      expect(t).toEqual([...t].sort((a, b) => b - a));
    }
  });

  test("every gesture has a suggestion, and every suggestion a gesture", () => {
    const names = GESTURES.map((g) => g.name);
    expect(names.filter((n) => !GESTURE_NOTES[n])).toEqual([]);
    expect(Object.keys(GESTURE_NOTES).filter((n) => !names.includes(n))).toEqual([]);
  });

  test("every control tried and set aside has a suggestion", () => {
    expect(TRIED_CONTROLS.filter((c) => !TRIED_NOTES[c.name]).map((c) => c.name)).toEqual([]);
  });

  test("every gesture an action starts from is a built gesture, drawn once", () => {
    const placed = FIELD_ACTIONS.flatMap(placedGestures);
    const built = new Set(GESTURES.filter((g) => g.state === "built").map((g) => g.name));
    expect(placed.filter((n) => !built.has(n))).toEqual([]);
    expect(placed.length).toBe(new Set(placed).size);
  });

  test("every built gesture is drawn under an action — the page has no other place for one", () => {
    const placed = new Set(FIELD_ACTIONS.flatMap(placedGestures));
    const left = GESTURES.filter((g) => g.state === "built" && !placed.has(g.name));
    expect(left.map((g) => g.name)).toEqual([]);
  });
});
