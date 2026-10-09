import { expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { LITERAL, ROW_NUMBERS } from "../src/field-numbers.js";

/**
 * Every ON THE FIELD row says what its gesture is held to
 * (`field-numbers.ts`): a `SimConfig` field with a value under
 * `DEFAULT_CONFIG`, or a line naming the literal. The names are rows the
 * page draws, so a renamed row is caught here and a renamed field by `tsc`.
 */

const rows = new Set(FIELD_CONTROLS.map((r) => r.name));

test("every row named has numbers, and every name is a row", () => {
  const named = [...Object.keys(ROW_NUMBERS), ...Object.keys(LITERAL)];
  expect(named.filter((n) => !rows.has(n))).toEqual([]);
  const said = new Set(named);
  expect([...rows].filter((r) => !said.has(r))).toEqual([]);
});

test("every field named has a value", () => {
  const fields = Object.values(ROW_NUMBERS).flat();
  expect(fields.filter((f) => DEFAULT_CONFIG[f] === undefined)).toEqual([]);
});
