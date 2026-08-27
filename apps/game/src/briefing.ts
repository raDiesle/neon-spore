import { briefingHolds, forgetBriefings, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The thumb on a briefing card. Everything else about a card — which one is
 * due, whether it is still up, what putting it away costs — is world state and
 * belongs to `sim/briefing.ts`; this is only the press.
 */
export interface BriefingBinding {
  /** Both seats say they have read it. Nothing happens when no card is up. */
  dismiss(): void;
  /** Forget everything the pair has met. For a genuinely fresh pair only. */
  forget(): void;
  /** Whether a card is holding the wave — the banner waits behind it. */
  holds(): boolean;
}

export interface BriefingOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
}

/**
 * The whole stage is the card's button. There is exactly one thing to do while
 * a card is up and nowhere else to press, so a target the size of the screen
 * is one nobody has to look for.
 *
 * Both acks go into the buffer whichever seat this device holds. In a room the
 * lockstep scheduler drops the half this device is not sitting in, which is
 * the contract the keyboard already plays by (`keys.ts`), and solo there is
 * nobody else to wait for.
 *
 * A second listener on the same canvas rather than a case in `touch.ts`: the
 * press underneath is not a control press, and the simulation refuses
 * everything but this while a card is up, so whatever `bindControls` makes of
 * the same touch is dropped before it reaches the ship.
 */
export function bindBriefing({ canvas, buffer, world }: BriefingOptions): BriefingBinding {
  const dismiss = (): void => {
    if (!briefingHolds(world)) return;
    buffer.push(1, { kind: "brief" });
    buffer.push(2, { kind: "brief" });
  };
  canvas.addEventListener("pointerdown", dismiss);
  return {
    dismiss,
    forget: () => forgetBriefings(world),
    holds: () => briefingHolds(world),
  };
}
