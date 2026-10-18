import type { CreatureDef } from "./creatures.js";

/**
 * **The bodies the maw finishes**, named alone for THE BEATBOX's reason:
 * `creatures-table.ts` is near its limit, and this family has more coming
 * (`sim/creature-kinds-maw.ts`).
 */
export const MORSEL_CREATURE: CreatureDef = {
  kind: "morsel",
  // **Aim**, for the shot that turns it; the maw that finishes it is not a
  // `ControlGroup`, for the moult's reason — it is on every panel that has
  // one at all. No guard: nothing about it is the shield's.
  controls: ["aim"],
  // None of its own: a wave authors one per arrival, the carom's way
  // (`authorsColor`). It is the colour that turns it limp.
  color: null,
  // Player 2's strip, like every aim target.
  radar: "p2",
  authorsColor: true,
  blurb:
    'A soft body a shot does not kill. The matching colour turns it limp and amber, and it goes on falling; only the maw finishes it, with the cannon within two columns and SUCK open as it lands, and a limp one nobody swallows loses the wave. So the shot is only the first half, and the sentence after it — "it\'s down, suck" — is a timing the pilot has to hear, not a kill to stop watching. Unshot, it breaks the hull like any slick.',
};

export const SEEDER_CREATURE: CreatureDef = {
  kind: "seeder",
  // **Aim**: a shot kills it, and the pod it leaves is freed by a shot too.
  // The maw that takes the pod is on every panel that has one (`MORSEL`'s
  // argument). No guard.
  controls: ["aim"],
  // Authored per arrival, the carom's way: the colour that kills it.
  color: null,
  radar: "p2",
  authorsColor: true,
  blurb:
    "A body that dies to the matching colour like any slick — and leaves a pod hanging where it died, with the pod's clock running. So the kill is a debt: three shot in a hurry are three clocks at once, and every pod must be freed and swallowed or the wave is lost. Player 2 chooses *when* to kill, and says so: \"hold the left one, we've still got a pod up.\" Unshot, it breaks the hull like any slick.",
};
