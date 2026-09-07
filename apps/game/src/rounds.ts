import type { Layout, ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { bindGauge } from "./gauge.js";
import type { InputBuffer } from "./input.js";
import { bindPinball } from "./pinball.js";
import { bindSnake } from "./snake.js";

/**
 * Every round that draws **slabs**, bound to the canvas at once.
 *
 * `bindControls` cannot answer a slab: it is handed a `Field`, and a slab
 * panel's buttons are in none of them. So each such round needs a listener of
 * its own — and they all take the same handle, which is what this file is for.
 * `main.ts` spends one line on all of them rather than a line and an import
 * apiece, and the rounds still to come cost that file nothing at all.
 *
 * **A round on the band needs nothing here**, and THE PULSE is the first:
 * its four lanes are lobes in the panel the pair already hold, so `touchDown`
 * answers them like every other button in the game (`render/touch-lobe.ts`).
 *
 * It is `tools/director/src/stage-rounds.ts` on this side of the fence, and it
 * arrived for the same reason: the fourth round was the one that made four
 * near-identical lines worth naming.
 *
 * No two listeners can both fire: the simulation holds one boss at a time and
 * each of them asks whether the round running is its own.
 */
export interface RoundBindings {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
}

export function bindRounds(handle: RoundBindings): void {
  bindGauge(handle);
  bindSnake(handle);
  bindPinball(handle);
}
