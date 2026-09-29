import type { Color, GaugeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **THE GAUGE's two colours**: the one the wound wants and the one the cannon
 * last fired. The owner, 25 September 2026: *the regular cannon, cyan or red
 * … the wounds … mixed up with colour of cannon to hit* — and on 27
 * September, asked whether that should stay a picture, *a rule*.
 *
 * So both are the simulation's and this file only reads them. The wound's is
 * drawn with the band (`sim/gauge-band.ts`) and only her screen shows the
 * wound; the cannon, its line and the shot wear the colour of the last call
 * (`sim/gauge-call.ts`), because that is the one both screens saw go out.
 * Before the first call the cannon is cyan, the colour the state opens with.
 */
export type Loaded = Color;

/** The colour the wound wants — hers to read, and the only rule it is. */
export function gaugeWoundColor(gauge: GaugeState): Loaded {
  return gauge.woundColor;
}

/** The colour the last shot went out in, which the cannon still wears. */
export function gaugeShotLoad(gauge: GaugeState): Loaded {
  return gauge.calledColor;
}

export interface LoadedLook {
  hex: string;
  rim: string;
  dark: string;
}

/** The ammunition's three, as the fire buttons and the shots wear them. */
export function loadedLook(load: Loaded): LoadedLook {
  return load === "red"
    ? { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark }
    : { hex: PALETTE.cyan, rim: PALETTE.cyanRim, dark: PALETTE.cyanDark };
}
