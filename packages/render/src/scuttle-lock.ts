import {
  type ScuttleState,
  type SimConfig,
  scuttleNextCol,
  scuttleShootable,
  scuttleWinding,
} from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { scuttleTop } from "./scuttle-shape.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * **Where the lock on the next throw's column stands**, or null when nothing
 * hangs — the box, not the drawing.
 *
 * Exported because the cue hangs its word off this exact box (`boss-cue.ts`):
 * this screen already wears a frame around the place, and a second frame
 * around the same place is the mistake `target-lock.ts` records the owner
 * ending. So the cue draws no frame here and only says the verb, which means
 * it has to know where the frame it is borrowing actually is.
 */
export function scuttleLockBox(
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
): { x: number; y: number; halfW: number; halfH: number } | null {
  const col = scuttleNextCol(s, cfg);
  if (col < 0) return null;
  return {
    x: tileCX(l, col),
    y: scuttleTop(l, cfg) - l.tile * 0.12,
    halfW: l.tile * 0.46,
    halfH: l.tile * 0.22,
  };
}

/** The lock on the column the next throw lands in, dimmed while nothing hanging can be shot. */
export function drawScuttleLock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  time: number,
  fade: number,
): void {
  const box = scuttleLockBox(l, cfg, s);
  if (box === null) return;
  const hot = scuttleShootable(s) && !scuttleWinding(s);
  drawTargetLock(
    ctx,
    box.x,
    box.y,
    box.halfW,
    box.halfH,
    PALETTE.shieldRim,
    time,
    (hot ? 1 : 0.5) * fade,
    scuttleNextCol(s, cfg) + 7,
  );
}
