import { autopilotHand } from "@neon-spore/hands";
import type { World } from "@neon-spore/sim";
import type { InputBuffer } from "./input-buffer.js";

/**
 * **AUTO on the phone: the machine plays a seat while you play the other.**
 *
 * The director has had it since 25 September 2026 (`stage-autopilot.ts`
 * there); a phone alone under the TEST panel still had one pair of thumbs,
 * and the fights that want two presses at once could not be tried at all.
 * The hands are the director's own, moved into `packages/hands` so this app
 * could import them — the boss's hand where there is a boss, the cannon and
 * the shield together where there is none.
 *
 * - **OFF** — nothing, the default.
 * - **BOTH** — the hand plays the whole wave; watch it played right.
 * - **P1 / P2** — the hand plays that seat and you the other.
 *
 * What it presses goes into the same `InputBuffer` a thumb's presses do, on
 * the tick, so the simulation cannot tell the autopilot from a thumb. In a
 * room the lockstep keeps only this device's own seat (`link-run.ts`), so AUTO
 * can play your half there too and never the partner's.
 */

export type AutoMode = "off" | "both" | "p1" | "p2";

export const AUTO_MODES: readonly AutoMode[] = ["off", "both", "p1", "p2"];

const PLAYS: Record<AutoMode, readonly (1 | 2)[]> = { off: [], both: [1, 2], p1: [1], p2: [2] };

export interface GameAutopilot {
  mode(): AutoMode;
  setMode(m: AutoMode): void;
  /** This tick's presses for the seats AUTO plays, into the buffer. */
  press(w: World, buffer: InputBuffer): void;
  /** Whether AUTO is on and has nothing to play here — a boss with no hand. */
  handless(w: World): boolean;
}

export function gameAutopilot(): GameAutopilot {
  let mode: AutoMode = "off";
  return {
    mode: () => mode,
    setMode: (m) => {
      mode = m;
    },
    press(w, buffer) {
      const plays = PLAYS[mode];
      // A finished run waits for a restart tap, and that is a person's.
      if (plays.length === 0 || w.over) return;
      const hand = autopilotHand(w);
      if (!hand) return;
      for (const c of hand(w)) if (plays.includes(c.player)) buffer.push(c.player, c.command);
    },
    handless: (w) => mode !== "off" && autopilotHand(w) === null,
  };
}
