import type { SimConfig } from "@neon-spore/sim";
import { jumpWaveIndex } from "./brush-wave.js";
import { rememberWave } from "./rail-arrive.js";
import type { Selection } from "./selection.js";
import type { PlaceSession } from "./session.js";
import { renderShip } from "./ship.js";
import type { StagePanel } from "./stage.js";
import { type Brush, currentWave, type Store } from "./state.js";

/** Anything beside the stage that paints the wave being edited. */
interface Painted {
  render(): void;
}

/**
 * The panels a repaint walks, in the order it walks them. Read through a
 * getter, because each of them is bound with one of the callbacks below and so
 * exists only after `bindRefresh` has returned.
 */
export interface WavePanels {
  rail: Painted;
  grid: Painted | null;
  boss: Painted;
  palette: Painted;
  cells: Painted;
}

export interface RefreshOptions {
  store: Store;
  cfg: SimConfig;
  place: PlaceSession;
  selection: Selection;
  stage: StagePanel;
  panels: () => WavePanels;
  paintStatus: () => void;
}

export interface Refresh {
  /** A wave changed shape: redraw every panel and replay from the top. */
  onShape(): void;
  /** A different wave is open: forget what belonged to the last one, then redraw. */
  refreshAll(): void;
  /** Open the wave that first puts `brush` on the field, and let it run. */
  jumpToBrushWave(brush: Brush): void;
}

/**
 * **THE TWO REPAINTS OF `main.ts`, AND THE JUMP THAT USES ONE.**
 *
 * An edit and a change of wave redraw the same panels in the same order; a
 * change of wave first puts down what belonged to the wave it left — the
 * remembered address, the selected cell, the boss's round. Its own file
 * because `main.ts` was at 238 lines of a 250-line ceiling, and because these
 * three are one subject: what the director does when the wave under it moves.
 */
export function bindRefresh({
  store,
  cfg,
  place,
  selection,
  stage,
  panels,
  paintStatus,
}: RefreshOptions): Refresh {
  const repaint = (): void => {
    const { rail, grid, boss, palette, cells } = panels();
    // The list too: a fault is painted on the map, and its ⚠ is on the wave's
    // own row (`rail-marks.ts`). No other mark moves on a shape edit.
    rail.render();
    grid?.render();
    boss.render();
    palette.render();
    // The selection did not move on an edit, but what is under it may have just
    // been erased or painted over — the panel names the contents, not the
    // coordinates.
    cells.render();
    stage.rebuild();
    paintStatus();
    renderShip(cfg, currentWave(store));
  };

  const refreshAll = (): void => {
    place.persist(store.index);
    rememberWave(store.index);
    // A different wave: beat 4 column 2 is a different cell now, and pointing the
    // panel at whatever happens to be there would be a selection nobody made.
    selection.set(null);
    // And a round belongs to the boss it was picked for — before `boss.render`,
    // which marks the tab, and before the rebuild that would stand this wave's
    // fight on the last one's fourth sheet.
    stage.closeRound();
    repaint();
  };

  return {
    onShape: repaint,
    refreshAll,
    // Ctrl-click on a brush: open the wave that first puts it on the field and
    // let it run, so a brush can be *seen* rather than read about. The same two
    // steps DEMOS takes (`demo-panel.ts`) — `refreshAll` is what every jump to a
    // wave goes through — with the play on the end, since the transport may
    // have been left paused and a wave opened to be watched should not land held.
    jumpToBrushWave: (brush) => {
      const index = jumpWaveIndex(store.waves, brush);
      if (index === undefined) return;
      store.index = index;
      refreshAll();
      stage.play();
    },
  };
}
