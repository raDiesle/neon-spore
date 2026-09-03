/**
 * How the body is drawn: a skin, a motion and a light, each picked once for
 * the whole page — then the three effect axes, which live next door.
 *
 * Two splits made this file. It came out of `shapes-controls.ts` when GLOW
 * arrived: what stayed there is *which section of the page is showing*, which
 * is navigation, and what came here is *what everything on it is wearing*.
 * Then TAIL arrived and it split again, and that seam is the sharper of the
 * two: **these three say how a body is drawn, and the three in
 * `shapes-effect-axes.ts` are effects on it.** The tell is the control — these
 * are one pick each and every card wears exactly one of them, while all three
 * next door stack.
 *
 * `button` and `group` are in `shapes-widgets.ts`, since both files need them.
 * The state is all in `shapes-state.ts`, which is a leaf on purpose — this file
 * reading it out of `shapes-pair.ts` is what made the page's import cycle.
 * Nothing here holds any.
 */

import { MOTIONS } from "@neon-spore/shape-sheet";
import { effectGroups } from "./shapes-effect-axes.js";
import {
  currentLit,
  currentMotion,
  currentSkin,
  setMotion,
  setSkin,
  toggleLit,
} from "./shapes-state.js";
import { button, group } from "./shapes-widgets.js";
import { SKINS } from "./skins/index.js";

export function axisGroups(axes: HTMLElement, rerender: () => void): void {
  group(
    axes,
    "SKIN",
    `The surface every card is drawn with, for the whole page — independent ` +
      `of the motion and the light below; any skin combines with either. ` +
      `Now: ${currentSkin()}.`,
    (row) => {
      for (const s of SKINS)
        button(row, s.label, s.id === currentSkin(), s.hint, () => {
          setSkin(s.id);
          rerender();
        });
    },
  );

  const driving = currentMotion();
  group(
    axes,
    "MOTION",
    `How every card moves, for the whole page — independent of the skin and ` +
      `the light above and below. OWN leaves each card playing whatever ` +
      `motion its own catalogue entry was authored with; any other choice ` +
      `forces all of them to move the same way instead. ` +
      `Now: ${driving === undefined ? "OWN" : driving.name}.`,
    (row) => {
      button(
        row,
        "OWN",
        driving === undefined,
        "each card keeps whatever motion its own catalogue entry was authored with",
        () => {
          setMotion(undefined);
          rerender();
        },
      );
      for (const m of MOTIONS)
        button(row, m.name, driving === m, m.note, () => {
          setMotion(m);
          rerender();
        });
    },
  );

  group(
    axes,
    "LIGHT",
    `The key light, composited on top of whichever skin is picked — ` +
      `independent of the skin and the motion above. On shows the skin lit; ` +
      `off shows the same skin without it. Now: ${currentLit() ? "on" : "off"}.`,
    (row) => {
      button(
        row,
        "LIT",
        currentLit(),
        "the key light, on top of whichever skin composes it — off shows the same skin without it",
        () => {
          toggleLit();
          rerender();
        },
      );
    },
  );

  effectGroups(axes, rerender);
}
