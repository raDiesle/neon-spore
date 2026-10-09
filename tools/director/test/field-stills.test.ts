import { describe, expect, test } from "bun:test";
import { FIELD_ACTIONS, userOf } from "../src/field-actions.js";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { stillTicks } from "../src/field-stills.js";
import { poseNamed } from "../src/poses.js";

/**
 * A card's ▤ STILLS are six moments found by playing its pose with AUTO's
 * hand (`field-stills.ts`). They run in order, and the cards AUTO cannot
 * play are named here — so a hand that learns one, or forgets one, says so.
 */

const NOT_PLAYED = [
  "PINBALL'S PLUNGER",
  "PINBALL'S TABLE",
  "THE ANTIPHON'S ORGAN",
  "THE BALLOON'S LEFT HANDLE",
  "THE BALLOON'S RIGHT HANDLE",
  "THE CHOIR'S LEFT ARROW",
  "THE CHOIR'S RIGHT ARROW",
  "THE GAUGE'S BAND",
  "THE GUM",
  "THE LEAD'S STALK",
  "THE LEDGER'S FOOT",
  "THE LEDGER'S HAUL",
  "THE LEDGER'S PLUG",
  "THE LEDGER'S PULL",
  "THE LID'S CORD",
  "THE LIGHT",
  "THE MAZE'S STRING",
  "THE MIRROR'S LOBES",
  "THE PULSE'S ARREST",
  "THE PULSE'S BRACE",
  "THE TASTER'S PIN",
  "THE TASTER'S WIPE",
];

const byName = new Map(FIELD_CONTROLS.map((c) => [c.name, c]));
const cards = new Map<string, string[]>();
for (const name of FIELD_ACTIONS.flatMap((a) => a.types.flatMap((t) => t.rows))) {
  const row = byName.get(name);
  if (row)
    cards.set(`${userOf(name)}|${row.pose}`, [
      ...(cards.get(`${userOf(name)}|${row.pose}`) ?? []),
      name,
    ]);
}

describe("a card's stills", () => {
  const unplayed: string[] = [];
  for (const [key, names] of cards) {
    const rows = names.flatMap((n) => byName.get(n) ?? []);
    const [first] = rows;
    if (!first) continue;
    const moments = stillTicks(poseNamed(first.pose).build(), rows);
    if (!moments) {
      unplayed.push(...names);
      continue;
    }
    test(`${key} runs in order`, () => {
      const at = moments.map((m) => m.at);
      expect(at).toEqual([...at].sort((a, b) => a - b));
      expect(moments).toHaveLength(6);
    });
  }

  // A creature has no hand (THE GUM, PINBALL), and a hand reaches what its
  // boss needs within the reach, not every control it has. Each of these
  // cards says so and points at ▶ TRY IT.
  test("the rows AUTO does not play", () => {
    expect([...new Set(unplayed)].sort()).toEqual(NOT_PLAYED);
  });
});
