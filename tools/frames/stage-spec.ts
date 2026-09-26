import type { Difficulty } from "@neon-spore/sim";

/**
 * **How the page is opened**, before any tick of the wave: the phone's size
 * and density, whose screen it is, the level it plays at, and the baked looks.
 * Every field here is settled before the bundle runs or by the URL it is
 * loaded from (`page.ts`, `page-storage.ts`); what happens once the world is
 * ours is `FrameSpec`'s, which extends this.
 *
 * Cut from `spec.ts` on 26 September 2026 at its line limit, when `--level`
 * wanted a field.
 */
export interface StageSpec {
  /** CSS viewport the phone is drawn at. A fixed size is part of what makes
   * two captures comparable — the layout math reads the viewport back. */
  viewport?: { width: number; height: number };
  /**
   * Whose screen this is. Omitted leaves the build's own default, which is the
   * test rig showing both halves at once.
   *
   * A creature whose whole point is that the two devices carry two different
   * pictures — THE VEIL, THE LURE, THE DART — cannot be photographed at all
   * without this: the rig's frame is neither of the two frames a player sees,
   * and it is the one this tool used to be able to take.
   */
  seat?: "p1" | "p2" | "test";
  /**
   * The difficulty the run is played at: its tempo, and on HARD what only HARD
   * has — the wasted shot's ricochet (`render/ricochet.ts`), THE WELL's pace.
   * Omitted leaves the build's own default, which is Medium.
   *
   * The level is not a command, it is what the device remembers it last played
   * at (`apps/game/src/progress.ts`), read once at boot (`main-world.ts`). So
   * it is written into the page's storage before the bundle runs, beside the
   * seat, and nothing HARD-only could be photographed before this without a
   * probe driving Chrome by hand.
   */
  level?: Difficulty;
  /**
   * Open the page with `?raster=1`, so the baked looks the game keeps behind
   * that flag are fetched and installed — the burst over a destroyed creature
   * and THE CLASP's hand-painted shield (`apps/game/src/raster.ts`).
   *
   * It exists because those looks were unphotographable. CLAUDE.md's rule is
   * to send the owner the frame rather than ask him to open anything, and the
   * one thing an offered look needs is a picture of it beside the shipped one;
   * without this the only way to see either was to type the flag into a
   * browser by hand, which is exactly what this tool exists to have ended.
   * Off by default, so every capture ever taken means the same thing it did.
   */
  raster?: boolean;
  /**
   * How much of the browser's own resolution to spend on it: the device scale
   * factor the page is opened at.
   *
   * A *magnification*, not a resize. At 3 the game is drawn at three times the
   * pixel density and the layout is untouched, so a cropped rectangle comes
   * back sharp instead of as forty pixels stretched over a hundred and twenty.
   */
  zoom?: number;
}
