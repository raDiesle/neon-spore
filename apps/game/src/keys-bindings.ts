import type { ControlSet } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import type { Creature, SimConfig } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";
import type { deskGrip } from "./keys-grip.js";

/**
 * **Everything the desk rig is handed** (`keys.ts`): the buffer it pushes
 * into, and every getter it reads the game through, each with the reason it
 * is read fresh. Its own file since 15 October 2026, when the interface had
 * grown to a quarter of `keys.ts` and the next key would have taken that file
 * over the line ceiling. Re-exported from `keys.ts`, so `input.ts` and the
 * tests import it as they did.
 */
export interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
  /** For `midCol`: where the ship stands before either player has moved. */
  cfg: SimConfig;
  isOver: () => boolean;
  /** The field, for G — the grip needs something to take hold of. */
  creatures: () => readonly Creature[];
  /** The boss, for G on THE WARDEN's rope, whose carry follows its bow (`keys-grip.ts`). */
  boss?: Parameters<typeof deskGrip>[1];
  /**
   * Whether the guide is up — the only state the desk's three gate keys answer.
   * The introduction before it passes on its own timer, and a `brief` sent
   * while it stands is indistinguishable from that timer firing
   * (`sim/step.ts`); the touch dismiss guards on this for the same reason.
   */
  guideHolds: () => boolean;
  onPauseToggle: () => void;
  onWaveStep: (delta: number) => void;
  /** R, behind a guide: the desk's REPLAY (`render/guide-nav.ts`). */
  onGuideReplay: () => void;
  /**
   * The panel this wave is played on. Read fresh rather than captured: a wave
   * step changes it under the same listener, and a set captured at bind time
   * would gate the whole run by wave one's buttons.
   */
  controls: () => ControlSet;
}
