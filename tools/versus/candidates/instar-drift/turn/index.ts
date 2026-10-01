import * as drift from "../../../../../packages/render/src/instar-drift.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * TURN — offered 1 October 2026, from `docs/spec/living-bosses.md` §1. The
 * owner, 26 September 2026: the full body should keep turning, look left,
 * then right, the body too, so it reads 3D. The side-on body drifts on the
 * rig's slow yaw, pitch and roll (`idle-drift.ts`) about its middle, and the
 * head turns on it, leading the body, always toward the players: from
 * profile to three-quarter and back, never the back of its skull. Hushed to a
 * tenth over live marks while THE SLOW is open, still face-on, stilled when
 * beaten — and the marks are pressed where they are drawn, drift and all.
 *
 * Retuned 1 October 2026 — the owner: it looks better, but the body's
 * movement and shake should be bigger. Every angle now reaches 1.75 times the
 * shared drift's, and a quick tremor rides the body's roll and pitch.
 */
export const INSTAR_DRIFT_TURN: Variant = {
  slot: "instar:drift",
  name: "turn",
  sentence:
    "turn — THE INSTAR's whole side-on body keeps turning on a wide slow drift with a tremor in it, and its head turns on top of it toward the players, profile to three-quarter and back",
  dir: "tools/versus/candidates/instar-drift/turn",
  patches: [
    patch({
      target: drift.INSTAR_DRIFT,
      reached: () => drift.INSTAR_DRIFT,
      where: {
        file: "packages/render/src/instar-drift.ts",
        symbol: "INSTAR_DRIFT",
        type: "{ amount: number; reach: number; shake: number; head: (ctx: CanvasRenderingContext2D, look: Look, yaw: number) => void }",
      },
      fields: { amount: 1, reach: 1.75, shake: 1 },
    }),
  ],
};
