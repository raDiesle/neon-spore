import { describe, expect, test } from "bun:test";
import { FIELD_ACTIONS, userOf } from "../src/field-actions.js";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { controlRect, patches, touchArea } from "../src/field-focus.js";
import { PHONE } from "../src/pose-frame.js";
import { poseNamed } from "../src/poses.js";

/**
 * Every use card on CONTROLS › ON THE FIELD is cut to the box round its
 * control, found by pressing the posed world through the game's own hit test
 * (`field-focus.ts`). A row the sweep cannot find falls back to the pose's
 * own crop — half the phone, the picture the owner asked to be rid of — so
 * a row that stops being found is a picture that silently grew again.
 */

const byName = new Map(FIELD_CONTROLS.map((c) => [c.name, c]));
const onPage = FIELD_ACTIONS.flatMap((a) => a.types.flatMap((t) => t.rows));

/**
 * Rows the sweep cannot find on their pose's tick: nothing pressed anywhere
 * on the phone reaches them, so the card keeps the pose's crop. None today —
 * the last five were posed on the tick their control first asks
 * (`poses-field-controls-asking.ts`, and THE LEAD's on its STILL). A row put
 * here is queued with it (`docs/queue.md`) and leaves when it is found.
 */
const UNFOUND: Readonly<Record<string, string>> = {};

describe("a use card's picture is cut to its control", () => {
  const cards = new Map<string, string[]>();
  for (const name of onPage) {
    const row = byName.get(name);
    if (!row) continue;
    const key = `${userOf(name)}|${row.pose}`;
    cards.set(key, [...(cards.get(key) ?? []), name]);
  }
  for (const [key, names] of cards) {
    test(key, () => {
      const rows = names.flatMap((n) => byName.get(n) ?? []);
      const [first] = rows;
      if (!first) throw new Error(key);
      const pose = poseNamed(first.pose);
      const rect = controlRect(pose.build(), pose.role ?? "test", rows);
      // A row listed as unfound and found after all is a list gone stale.
      if (names.every((n) => UNFOUND[n])) {
        expect(rect, `${names.join(" · ")} is found now: take it off UNFOUND`).toBeNull();
        return;
      }
      expect(rect, names.join(" · ")).not.toBeNull();
      if (!rect) return;
      expect(rect.w).toBeLessThanOrEqual(PHONE.width);
      expect(rect.h).toBeLessThan(PHONE.height);
    });
  }
});

describe("a touch area's patches", () => {
  test("two handles apart are two patches, each the size of its cells", () => {
    const pose = poseNamed("BALLOON · BOTH HANDS TAUT");
    const area = touchArea(pose.build(), pose.role ?? "test", []);
    const cell = (x: number, y: number) => ({ x: x * area.step, y: y * area.step });
    const two = patches({ ...area, cells: [cell(1, 1), cell(2, 1), cell(2, 2), cell(9, 1)] });
    expect(two.map((p) => [p.w / area.step, p.h / area.step])).toEqual([
      [2, 2],
      [1, 1],
    ]);
  });
});
