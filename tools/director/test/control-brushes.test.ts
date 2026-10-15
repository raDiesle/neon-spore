import { describe, expect, test } from "bun:test";
import { BRUSH_MECHANIC } from "../src/brush-wave.js";
import { BRUSHES, CONTROL_BRUSHES, LIVING_BRUSH_KINDS } from "../src/brushes.js";
import { setBlisterBy } from "../src/entry-fields-blister.js";
import { BRUSH_GROUPS, brushOf, CREATURE_BRUSHES, emptyWave, paint } from "../src/state.js";

/**
 * The owner, 14 October 2026: *one brush per on screen control type*. Every
 * gesture a blister is knocked down by is a brush in its own CONTROLS group,
 * paints a blister wearing it, and reads back as itself.
 */
describe("the CONTROLS brushes", () => {
  test("are one per gesture, in their own group, and BLISTER has no button of its own", () => {
    expect([...CONTROL_BRUSHES]).toEqual([
      "control:tap",
      "control:hold",
      "control:swipe",
      "control:turn",
      "control:rub",
      "control:combo",
    ]);
    const group = BRUSH_GROUPS.find((g) => g.label === "CONTROLS");
    expect(group?.brushes).toEqual([...CONTROL_BRUSHES]);
    expect(LIVING_BRUSH_KINDS).not.toContain("blister");
    expect(BRUSH_GROUPS.flatMap((g) => g.brushes)).not.toContain("blister");
  });

  test("each has a row with a short line, a jump to THE BLISTER, and is hidden on a boss wave", () => {
    for (const brush of CONTROL_BRUSHES) {
      const row = BRUSHES.find((b) => b.brush === brush);
      expect(row?.note.length ?? 0, brush).toBeGreaterThan(0);
      expect(row?.note.length ?? 0, brush).toBeLessThanOrEqual(60);
      expect(BRUSH_MECHANIC[brush], brush).toBe("blister");
      expect(CREATURE_BRUSHES, brush).toContain(brush);
    }
  });

  for (const brush of CONTROL_BRUSHES) {
    test(`${brush} paints a blister that reads back as ${brush}`, () => {
      const wave = emptyWave();
      paint(wave, 0, 3, brush);
      const entry = wave.entries[0];
      expect(entry?.kind as string).toBe("blister");
      expect(entry?.color).toBeNull();
      expect(entry && brushOf(entry)).toBe(brush);
    });
  }

  test("TAP is written as no gesture, so a tap blister saves as it always did", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "control:tap");
    expect(wave.entries[0]).toEqual({
      beat: 0,
      col: 3,
      kind: "blister",
      color: null,
      gesture: undefined,
    });
  });

  test("a second brush over a blister changes its gesture and keeps whose hand it is", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "control:tap");
    const placed = wave.entries[0];
    if (placed) setBlisterBy(placed, 1);
    paint(wave, 0, 3, "control:rub");
    expect(wave.entries).toHaveLength(1);
    expect(wave.entries[0]?.gesture).toBe("rub");
    expect(wave.entries[0]?.by).toBe(1);
  });
});
