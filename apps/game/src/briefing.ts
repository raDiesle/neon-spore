import { guideHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The thumb on a wave's guide. Everything else about the opening — which state
 * is up, whether it is still holding the wave, what putting it away costs — is
 * world state and belongs to `sim/briefing.ts`; this is only the press.
 */
export interface BriefingBinding {
  /** Both seats say they have read it. Nothing happens when no guide is up. */
  dismiss(): void;
  /** Whether a guide is holding the wave. */
  holds(): boolean;
}

export interface BriefingOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
}

/**
 * The whole stage is the guide's button. There is exactly one thing to do
 * while a guide is up and nowhere else to press, so a target the size of the
 * screen is one nobody has to look for.
 *
 * **Only while the guide is up.** The introduction before it passes on a timer
 * and is not a thing to dismiss (the owner's own answer), so a tap during it
 * is dropped here rather than skipping past the wave's name — which is the one
 * thing a player who has just picked the phone up is most likely to do.
 *
 * Both acks go into the buffer whichever seat this device holds. In a room the
 * lockstep scheduler drops the half this device is not sitting in, which is
 * the contract the keyboard already plays by (`keys.ts`), and solo there is
 * nobody else to wait for.
 *
 * A second listener on the same canvas rather than a case in `touch.ts`: the
 * press underneath is not a control press, and the simulation refuses
 * everything but this while the wave is held, so whatever `bindControls` makes
 * of the same touch is dropped before it reaches the ship.
 */
export function bindBriefing({ canvas, buffer, world }: BriefingOptions): BriefingBinding {
  const dismiss = (): void => {
    if (!guideHolds(world)) return;
    buffer.push(1, { kind: "brief" });
    buffer.push(2, { kind: "brief" });
  };
  canvas.addEventListener("pointerdown", dismiss);
  return {
    dismiss,
    holds: () => guideHolds(world),
  };
}
