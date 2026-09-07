import { controlPress, controlSetForWave } from "@neon-spore/content";
import { hitSlab, type Layout, slabPanel, type ViewRole } from "@neon-spore/render";
import { pulseHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of THE PULSE: eight thumbs on eight buttons.
 *
 * A fourth round listener on the same canvas, exactly as THE GAUGE's, SNAKE's
 * and PINBALL's are. The presses underneath are not control presses — the
 * simulation refuses everything but these while the round is up — so whatever
 * `bindControls` makes of the same touch is dropped before it reaches the
 * ship.
 *
 * **Every press is a press and none of them is a hold.** This is the one round
 * where that matters: a rhythm is a sequence of instants, and a control that
 * did anything on release would put a second event a hundred milliseconds
 * after the one the pair meant. So there is no `pointerup` handler here at all,
 * which is also why the file is a third the length of PINBALL's.
 *
 * **It answers `pointerdown` and nothing else, on purpose.** The round is
 * judged to within eight ticks — sixty-seven milliseconds — and every layer
 * between the glass and `stepPulseRound` is spent out of that budget. A
 * listener that waited to see whether a touch became a drag would cost more
 * than the window is wide.
 *
 * **Both seats' buttons are on the panel and either may be pressed**, which is
 * new: every other round splits its verbs between the two seats and this one
 * splits what the two screens can read instead (`sim/pulse-controls.ts`). On a
 * phone a device carries one seat's four, and `slabPanel` is what decides
 * that; on a desk with both halves on screen, one person can play both.
 */

export interface PulseBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  /** A pointer event on the stage, or null beside it — one conversion for
   * every listener in the app (`viewport.ts`, `render/stage-point.ts`). */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
}

/** Which seat a slab belongs to, off its id. The panel carries eight. */
const SEAT_OF = /^pulse([12])/;

export function bindPulse({ canvas, buffer, world, layout, inStage, role }: PulseBinding): void {
  canvas.addEventListener("pointerdown", (e) => {
    if (!pulseHolds(world)) return;
    const p = inStage(e);
    if (!p) return;
    for (const slab of slabPanel(layout(), controlSetForWave(world.wave), role())) {
      if (!hitSlab(slab, p.x, p.y)) continue;
      const seat = SEAT_OF.exec(slab.control.id);
      if (seat === null) continue;
      buffer.push(seat[1] === "2" ? 2 : 1, controlPress(slab.control.id).down);
      return;
    }
  });
}
