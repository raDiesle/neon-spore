import type { NettlePose } from "@neon-spore/sim";
import type { Figure } from "./nettle-figure.js";

/**
 * **THE NETTLE's poses**, one `Figure` each: the bell as it drifts in, the
 * eight the script names, and the beaten one it sags into at the end.
 *
 * Unlike THE INSTAR's poses, none of a mark's places live here — the script
 * (`packages/content/src/nettle-script.ts`) plants every mark at its own
 * `xMilli`/`yMilli` on the field, not on a part of the body, so `placed`
 * below has nothing of the marks' to carry into the figure.
 */

/** The bell face-on and at rest, arms drawn in, nothing lit. */
const BASE: Figure = {
  bellX: 500,
  bellY: 450,
  bellR: 260,
  side: 0,
  armL: 0,
  armR: 0,
  spotL: 0,
  spotR: 0,
  sac: 0,
  sporeL: 0,
  sporeR: 0,
  mouth: 0,
  globL: 0,
  globM: 0,
  globR: 0,
  frill: 0,
  coreGlow: 0.3,
  coreOpen: 0,
};

/** The body as it drifts in, before the first morph: the same bell, dimmer. */
export const ENTER: Figure = { ...BASE, coreGlow: 0.15 };

/** The eight poses the script names. */
export const POSES: Record<NettlePose, Figure> = {
  // Both arms drawn out to sting, at the marks' own 318/720 and 681/720.
  sting: { ...BASE, armL: 1, armR: 1 },
  // Tipped back, both eyespots lit to stare down the ship.
  gaze: { ...BASE, bellY: 400, spotL: 1, spotR: 1 },
  // The sac swollen, its spores still clinging either side of it.
  spawn: { ...BASE, sac: 1, sporeL: 1, sporeR: 1 },
  // Turned to bare the underside, the iris just starting to show.
  under: { ...BASE, side: 1, mouth: 0.4 },
  // Turned and the iris held wide open over the ship.
  gape: { ...BASE, side: 1, mouth: 1 },
  // Turned and squeezed, all three globs held at the curtain's rim.
  spit: { ...BASE, side: 1, globL: 1, globM: 1, globR: 1 },
  // Turned, the oral-arm curtain let all the way down.
  frill: { ...BASE, side: 1, frill: 1 },
  // Face-on again, the bell open, the core bared and burning.
  core: { ...BASE, side: 0, coreGlow: 1, coreOpen: 1 },
};

/** Beaten: turned, sagging, the core out, the curtain spent. */
export const BEATEN: Figure = {
  ...POSES.under,
  bellY: 550,
  coreGlow: 0,
  coreOpen: 0,
  mouth: 0,
};

/**
 * The pose unchanged: THE NETTLE's marks stand at the script's own places on
 * the field (`instar-marks.ts`, `instar-shape.ts`), never on a part of this
 * body, so there is nothing here to plant. Kept for the shape THE INSTAR's
 * `landed`/`nettleFigure` call through.
 */
export function placed(pose: NettlePose, _marks: readonly unknown[], _along = 0): Figure {
  return POSES[pose];
}
