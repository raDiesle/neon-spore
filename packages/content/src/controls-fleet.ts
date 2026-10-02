import type { ControlDef } from "./controls.js";

/**
 * **THE FLEET's five**: the salvo under the pilot's thumb, and the four
 * arrows that carry the sights a square at a time under the navigator's.
 *
 * Cut out of `controls-round.ts` when it stood at 246 lines, for the reason
 * `controls-throat.ts` was never put there: THE FLEET is a boss, and this file
 * is where a boss's own panel is written, the rounds' next door. `CONTROLS`
 * spreads it in place, so nothing that reads the vocabulary had to learn
 * there is a third file.
 */
export const FLEET_CONTROLS: readonly ControlDef[] = [
  {
    id: "salvo",
    player: 1,
    form: "lobe",
    label: "SALVO",
    does: "Fires into whichever square of THE FLEET's chart the sights are standing in.",
  },
  {
    id: "aimLeft",
    player: 2,
    form: "lobe",
    label: "◀",
    does: "Carries the sights one square left. A step, never a place — a place would need no telling.",
  },
  {
    id: "aimUp",
    player: 2,
    form: "lobe",
    label: "▲",
    does: "One square up the chart.",
  },
  {
    id: "aimDown",
    player: 2,
    form: "lobe",
    label: "▼",
    does: "One square down the chart.",
  },
  {
    id: "aimRight",
    player: 2,
    form: "lobe",
    label: "▶",
    does: "One square right.",
  },
];
