import { faultsNow, type MalfunctionKind, type World } from "@neon-spore/sim";
import { emitterAt } from "./fault-emitter.js";
import { type Layout, showsCodex } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What the lantern is doing, in two or three words beside it.** The owner
 * asked for it by name on 25 September 2026: *for every fault there should be
 * a text next to the centered top alien saying what it is about or what has
 * to be done* — THE FLIP's was his example, *mirroring projections*.
 *
 * The beam already says *which control* a fault has taken (`fault-emitter.ts`),
 * but a beam is a picture a pair has to have seen once before it means
 * anything, and THE FLIP, THE CODEX and THE HANDOVER take no control at all.
 * The label is the sentence the beam cannot be: short enough to say across the
 * table, in the words the rest of the game uses (`.claude/skills/game-words`).
 *
 * **Shown only where the lantern's news is this screen's to have.** THE CODEX
 * hangs on the pilot's screen alone, so its label does; THE FLIP's beams stand
 * only on the turned screen, so its label does too — the true screen is never
 * shown a tell about a picture it is not being shown (`fault-beam-ends.ts`).
 */
export const FAULT_LABEL: Record<MalfunctionKind, string> = {
  cannon: "CANNON FIRES ALONE",
  shield: "SHIELD STUCK ON",
  steer: "CANNON WALKS ALONE",
  codex: "COLOURS SWAP",
  handover: "SCREENS SWAPPED",
  leech: "KEEP CANNON MOVING",
  limpet: "KEEP SHIELD MOVING",
  flip: "MIRRORED",
};

/** Whether this screen is told about a fault of this kind at all. */
function labelShown(l: Layout, kind: MalfunctionKind): boolean {
  if (kind === "codex") return showsCodex(l.role);
  if (kind === "flip") return l.flip;
  return true;
}

/**
 * One line per fault in force, hung below and to the right of the lantern.
 * Not level with it: THE FLIP's beams leave it sideways for the walls and run
 * through that row, and on a short phone the lantern is up under the menu
 * button, which a line above it would collide with. Below the row THE FLIP's
 * beams land on, and right of the band a downward beam bows in, is air on
 * every screen. Two faults at once stack downward, the first on top: the one
 * the lantern is drawn for (`drawFaultEmitter`).
 */
export function drawFaultLabels(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const lines: string[] = [];
  for (const f of faultsNow(world)) {
    if (labelShown(l, f.kind) && !lines.includes(FAULT_LABEL[f.kind])) {
      lines.push(FAULT_LABEL[f.kind]);
    }
  }
  if (lines.length === 0) return;
  const e = emitterAt(l);
  const x = e.x + e.r * 1.2;
  const room = l.width - 6 - x;
  ctx.save();
  // As large as the tile allows, and smaller only when the longest line would
  // otherwise run off the right edge of a narrow phone.
  let size = Math.round(Math.max(11, Math.min(15, l.tile * 0.3)));
  ctx.font = `700 ${size}px "Courier New",monospace`;
  const widest = Math.max(...lines.map((t) => ctx.measureText(t).width));
  if (widest > room) {
    size = Math.max(8, Math.floor((size * room) / widest));
    ctx.font = `700 ${size}px "Courier New",monospace`;
  }
  const top = l.gridTop + l.tile * 1.4;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.arcRim;
  ctx.globalAlpha = 0.92;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i] ?? "", x, top + i * size * 1.25);
  }
  ctx.restore();
}
