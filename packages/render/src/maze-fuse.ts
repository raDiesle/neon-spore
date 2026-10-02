import {
  type MazeState,
  mazeCurrent,
  mazeLeverRadiusMilli,
  mazeReadBeats,
  type World,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { mazeDrum } from "./maze-walls.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";
import { fuseAt } from "./slow-fuse-place.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **THE MAZE's clocks on the fuse every boss wears: under the drum, over the
 * hull.**
 *
 * The owner, 29 September 2026: *show the generic time remaining indicator
 * … which is between hull and boss*, for the reading clock and for the
 * heart's hold both. So it is THE SLOW's fuse (`slow-fuse.ts`) — the same
 * line, placed by the same search (`slow-fuse-place.ts`) under the drum's
 * lever ring and clear of every live mark, burning in from both ends and
 * going orange at half and red for the last two beats. The heart's own red
 * contour (`maze-timer.ts`) stays: it is the reading clock on the body, and
 * this is the one every other fight has taught the pair to read.
 *
 * Two clocks and one line, the way THE REPRISE's fuse carries two: the
 * reading phase's `mazeReadBeats`, and under `grip` the heart's
 * `mazeGripBeats`. Every other phase asks nothing of anyone in time and draws
 * none. Nothing is stored; the beat says how far it has burnt.
 */

/** The window this frame is inside, or `null` for a phase with no clock. */
export function mazeWindow(
  world: World,
  m: MazeState,
  beatPhase: number,
): Omit<SlowWindow, "asks" | "holds"> | null {
  const wheel = mazeCurrent(m);
  if (wheel === null) return null;
  const beats =
    m.phase === "read"
      ? mazeReadBeats(wheel.entrances.length)
      : m.phase === "grip"
        ? world.cfg.mazeGripBeats
        : 0;
  if (beats <= 0) return null;
  const through = Math.max(0, Math.min(1, (world.beat - m.phaseBeat + beatPhase) / beats));
  return { beats, through, left: beats * (1 - through), span: beats };
}

/** The fuse for this frame, under the drum and its lever. */
export function drawMazeFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  m: MazeState,
  beatPhase: number,
): void {
  const win = mazeWindow(world, m, beatPhase);
  if (win === null) return;
  const rest = 1 - win.through;
  if (rest <= 0) return;
  const d = mazeDrum(l, world.cfg);
  const lever = (mazeLeverRadiusMilli(world.cfg) * l.tile) / 1000;
  const at = fuseAt(l, world, beatPhase, { top: d.cy - d.r, bottom: d.cy + lever });
  const { body, core } = fuseColours(rest);
  drawFuseLine(ctx, l, at, rest, body, core);
}
