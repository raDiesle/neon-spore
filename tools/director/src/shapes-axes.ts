/**
 * How the body is drawn: a skin, a filling, a motion and a light, each picked
 * once for the whole page — then the three effect axes, which live next door.
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
import { FILLINGS } from "./fillings/index.js";
import { effectGroups } from "./shapes-effect-axes.js";
import {
  currentFilling,
  currentLit,
  currentMotion,
  currentSkin,
  setFilling,
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

  fillingGroup(axes, rerender);
  effectGroups(axes, rerender);
}

/**
 * FILLING — what the body has *in* it, as against what its wall is made of.
 *
 * The seventh axis, and the owner asked for it by name on 9 September 2026
 * after reading eight interiors on the ALTERNATIVES page: he took one of each
 * pair into the game and wanted the rest where they could be browsed, *maybe
 * new category like filling*.
 *
 * It is here rather than next door in `shapes-effect-axes.ts` because it is
 * **one pick**, which is that file's own test for the seam: a body has one
 * inside, the way it has one skin and one motion. And it is beside SKIN rather
 * than folded into it because the two are a different question about the same
 * body, which is the line `packages/render/src/body-interior.ts` draws in the
 * game — the material around a mark, and the mark.
 *
 * NONE is named rather than left as an empty row, and it is the default: most
 * bodies in this game have never been drawn with anything in them, so an empty
 * body is what every value here has to beat.
 */
function fillingGroup(axes: HTMLElement, rerender: () => void): void {
  const on = currentFilling();
  const wearing = FILLINGS.find((f) => f.id === on);
  group(
    axes,
    "FILLING",
    `What every card has inside it, for the whole page — independent of the ` +
      `skin, the motion and the light. One pick, not a stack: a body has one ` +
      `inside. SPORES and BLOOM are marked IN THE GAME — they are what a bulb ` +
      `and a slick wear today, and everything else here has to beat them and ` +
      `to beat NONE. Now: ${wearing?.label ?? "NONE"}.`,
    (row) => {
      button(
        row,
        "NONE",
        on === undefined,
        "nothing inside — the picture the rest are judged against",
        () => {
          setFilling(undefined);
          rerender();
        },
      );
      for (const f of FILLINGS)
        button(
          row,
          f.shipped ? `${f.label} *` : f.label,
          f.id === on,
          f.shipped ? `IN THE GAME — ${f.shipped}. ${f.hint}` : f.hint,
          () => {
            setFilling(f.id);
            rerender();
          },
        );
    },
  );
}
