import { waveHasGuide } from "@neon-spore/content";
import { type Layout, lostHit } from "@neon-spore/render";
import { lostAsks, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";
import { pressQuit } from "./quit.js";

export interface LostOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
}

/**
 * The presses on a lost wave's screen: RETRY WAVE, TUTORIAL AGAIN and QUIT
 * (`render/lost-screen.ts`).
 *
 * Bound on the canvas beside the field's own listener rather than inside it,
 * the way the guide's bar is (`briefing.ts`): while the screen is up the field
 * under it is held and answers nothing, so a press that is not on a button is
 * simply a press on nothing. Both seats' commands go into the buffer whichever
 * seat this device holds — in a room the scheduler drops the half this device
 * is not sitting in, so the answer arrives signed by the seat that gave it,
 * which is what tells the other phone who quit (`sim/wave-fail.ts`).
 *
 * At a desk, Enter is RETRY WAVE — here rather than in `keys.ts`, because
 * that rig is the wave's and this screen is not part of the wave: nothing
 * under it answers a key while it asks. TUTORIAL AGAIN and QUIT have no key:
 * Escape is already the menu's (`menu.ts`), leaving a run should be a press on
 * the word, and the one key here is for the press a pair makes twenty times an
 * evening rather than for each of three.
 */
export function bindLost({ canvas, buffer, world, layout, inStage }: LostOptions): void {
  const answer = (kind: "retry" | "retryGuide" | "quit"): void => {
    if (kind === "quit") {
      pressQuit(buffer);
      return;
    }
    buffer.push(1, { kind });
    buffer.push(2, { kind });
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (!lostAsks(world)) return;
    const p = inStage(e);
    if (!p) return;
    // The same question the screen was drawn from, asked the same way
    // (`render/lost-screen.ts`): a wave with no guide has no third button and
    // no third box to land on.
    const hit = lostHit(layout(), p.x, p.y, waveHasGuide(world.wave));
    if (hit) answer(hit);
  });
  window.addEventListener("keydown", (e) => {
    if (!lostAsks(world) || e.repeat) return;
    if (e.key === "Enter") answer("retry");
  });
}
