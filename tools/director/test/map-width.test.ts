import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { WAVE_COLS } from "@neon-spore/content";
import { OPEN_TRACKS } from "../src/columns.js";
import {
  BEAT_LABEL_PX,
  CELL_PX,
  GAP_PX,
  gridTemplateColumns,
  mapWidthPx,
  ROW_ACT_PX,
} from "../src/grid-metrics.js";

/**
 * THE MAP'S WIDTH IS ONE NUMBER, AND THE STYLESHEET HAS TO HOLD THE SAME ONE.
 *
 * `#gridNote` is capped at the map's width, because a block
 * child with no cap contributes its unwrapped line length to the column's
 * auto-sizing pass and pushes the map column wider than the map itself. The
 * cap was written out as `262px` and stayed there through two changes to the
 * tracks — the beat-label column went from 24px to 56px and nothing failed.
 *
 * So the cap is `--map-w` now, and this is what reads the stylesheet for it.
 */

const SRC = join(import.meta.dir, "..", "src");

describe("the map's width", () => {
  test("adds up the tracks the grid is actually built from", () => {
    expect(gridTemplateColumns()).toBe(
      `${BEAT_LABEL_PX}px repeat(${WAVE_COLS}, ${CELL_PX}px) ${ROW_ACT_PX}px`,
    );
    // Thirteen tracks, twelve gaps.
    expect(mapWidthPx()).toBe(
      BEAT_LABEL_PX + WAVE_COLS * CELL_PX + ROW_ACT_PX + (WAVE_COLS + 1) * GAP_PX,
    );
  });

  test("is what director-map.css declares", async () => {
    const text = await Bun.file(join(SRC, "director-map.css")).text();
    const declared = /--map-w:\s*(\d+)px/.exec(text);
    expect(declared).not.toBeNull();
    expect(Number((declared as RegExpExecArray)[1])).toBe(mapWidthPx());
  });

  test("fits inside the map column's own track, with its padding and a scrollbar", async () => {
    const text = await Bun.file(join(SRC, "director-brush.css")).text();
    expect(text).toContain("max-width: var(--map-w)");
    const least = /^minmax\((\d+)px,/.exec(OPEN_TRACKS.map ?? "");
    expect(least).not.toBeNull();
    expect(Number((least as RegExpExecArray)[1])).toBeGreaterThanOrEqual(mapWidthPx() + 20 + 10);
  });
});
