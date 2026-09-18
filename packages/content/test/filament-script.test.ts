import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, filamentWalkable, walkFilament } from "@neon-spore/sim";
import { FILAMENT_SCRIPT } from "../src/filament-script.js";

/**
 * THE FILAMENT's seven words, walked, are lines a hand can follow: every
 * tile on the field, no tile twice, at least two of them. A word that
 * stepped off the field would light a tile nobody can touch, and one that
 * crossed itself would give `filamentIndexOf` two answers for one tile; the
 * simulation refuses neither, because a wave's script is checked here,
 * once, and not on every tick.
 */
describe("THE FILAMENT's script", () => {
  it("hangs seven filaments", () => {
    expect(FILAMENT_SCRIPT.length).toBe(7);
  });

  it("walks every one into a line a hand can follow", () => {
    for (const path of FILAMENT_SCRIPT) {
      const tiles = walkFilament(path);
      expect(filamentWalkable(DEFAULT_CONFIG, tiles), `${path.col},${path.row} ${path.moves}`).toBe(
        true,
      );
    }
  });

  it("gets longer with every filament, and the first is straight", () => {
    const lengths = FILAMENT_SCRIPT.map((p) => walkFilament(p).length);
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]).toBeGreaterThan(lengths[i - 1] ?? 0);
    }
    expect(FILAMENT_SCRIPT[0]?.moves.replace(/U/g, "")).toBe("");
  });

  it("hangs every free end below its root, toward the body over the field", () => {
    for (const path of FILAMENT_SCRIPT) {
      const tiles = walkFilament(path);
      const root = tiles[tiles.length - 1];
      expect(root?.row ?? 99).toBeLessThan(path.row);
    }
  });
});
