/**
 * The four axis groups on COMPOSE: a skin, a motion, a light and a glow stack,
 * each set once for the whole page.
 *
 * Split out of `shapes-controls.ts` when GLOW arrived and took that file past
 * the length limit. The seam is a real one rather than a convenience: what is
 * left there is *which section of the page is showing*, which is navigation,
 * and what is here is *what everything on it is wearing*, which is the
 * comparison itself. They were one file only because there was once one row.
 *
 * `button` and `group` live here rather than there because three of the four
 * callers are in this file, and because a group is what an axis is drawn as —
 * a heading, one line of prose, then the row. The VIEW tabs borrow the same
 * two, which is right: the tabs are a fifth thing that looks like an axis and
 * should read like one.
 *
 * The state itself stays in `shapes-pair.ts`. Nothing here holds any.
 */

import { MOTIONS } from "@neon-spore/shape-sheet";
import { GLOWS } from "./glows/index.js";
import { HITS } from "./hits/index.js";
import {
  clearGlows,
  clearHits,
  currentGlows,
  currentHits,
  currentLit,
  currentMotion,
  currentSkin,
  setMotion,
  setSkin,
  toggleGlow,
  toggleHit,
  toggleLit,
} from "./shapes-pair.js";
import { autoHits, fireHit, toggleAutoHits } from "./shapes-trigger.js";
import { SKINS } from "./skins/index.js";

export function button(
  host: HTMLElement,
  label: string,
  on: boolean,
  hint: string,
  pick: () => void,
) {
  const b = document.createElement("button");
  b.className = on ? "skin is-on" : "skin";
  b.textContent = label;
  b.title = hint;
  b.addEventListener("click", pick);
  host.appendChild(b);
  return b;
}

/**
 * One named axis: a heading, a description line that says what the axis
 * picks, that it is independent of the other two, and what is currently
 * picked — then the row of buttons themselves. The description is the thing
 * that makes the current pick legible without hovering a button; the
 * highlighted button is a confirmation of it, not the only place it is said.
 */
export function group(
  host: HTMLElement,
  heading: string,
  desc: string,
  build: (row: HTMLElement) => void,
): void {
  const wrap = document.createElement("div");
  wrap.className = "control-group";

  const h = document.createElement("h3");
  h.className = "control-heading";
  h.textContent = heading;
  wrap.appendChild(h);

  const p = document.createElement("p");
  p.className = "control-desc";
  p.textContent = desc;
  wrap.appendChild(p);

  const row = document.createElement("div");
  row.className = "control-row";
  build(row);
  wrap.appendChild(row);

  host.appendChild(wrap);
}

/**
 * Build the four axis groups into `axes`, which is `shapesAxes` inside the
 * COMPOSE half of `index.html`. The caller has already emptied it and decided
 * that COMPOSE is the view showing; this file only fills it.
 */
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

  // The one axis that stacks, and the description carries the whole weight of
  // saying so. The other three highlight exactly one button, which is legible
  // at a glance; a row of ticks is not — a reader glancing at three lit
  // buttons cannot tell whether they picked three things or whether the page
  // is showing them three states of one. So the stack is spelled out in words
  // as well, and NONE is named rather than left as an empty row.
  const on = currentGlows();
  const wearing =
    on.length === 0
      ? "NONE"
      : GLOWS.filter((g) => on.includes(g.id))
          .map((g) => g.label)
          .join(" + ");
  group(
    axes,
    "GLOW",
    `What the body throws off into the space around it — independent of the ` +
      `three above, and the only one of the four you may tick more than one ` +
      `of. They stack, in the order the registry declares and not the order ` +
      `you click, so two readers who tick the same three see the same ` +
      `picture. NONE is a real choice and is what every value here has to ` +
      `beat. Now: ${wearing}.`,
    (row) => {
      button(
        row,
        "NONE",
        on.length === 0,
        "no glow at all — the control the rest are judged against",
        () => {
          clearGlows();
          rerender();
        },
      );
      for (const g of GLOWS)
        button(row, g.label, on.includes(g.id), g.hint, () => {
          toggleGlow(g.id);
          rerender();
        });
    },
  );

  // The fifth axis, and the only one that needs something to *happen*. Its
  // description carries the trigger as well as the stack, because a reader who
  // ticks FLASH and sees nothing for three seconds concludes it is broken
  // rather than that it is between hits.
  const hitsOn = currentHits();
  const hitWearing =
    hitsOn.length === 0
      ? "NONE"
      : HITS.filter((h) => hitsOn.includes(h.id))
          .map((h) => h.label)
          .join(" + ");
  group(
    axes,
    "HIT",
    `What the body does at a moment — the wind-up, the impact, and what is ` +
      `left over. Independent of the four above, and it stacks like GLOW: an ` +
      `impact is three or four simple layers, not one. Nothing here draws ` +
      `between hits, so one fires on its own every few beats; HIT NOW pre-` +
      `empts the cycle and REPEAT stops it. Now: ${hitWearing}, repeat ` +
      `${autoHits() ? "on" : "off"}.`,
    (row) => {
      button(row, "HIT NOW", false, "fire one immediately — its wind-up starts now", () => {
        fireHit(performance.now() / 1000);
      });
      button(
        row,
        "REPEAT",
        autoHits(),
        "fire one every four beats on its own, so the axis is visible without clicking",
        () => {
          toggleAutoHits();
          rerender();
        },
      );
      button(row, "NONE", hitsOn.length === 0, "no hit at all", () => {
        clearHits();
        rerender();
      });
      for (const h of HITS)
        button(row, h.label, hitsOn.includes(h.id), h.hint, () => {
          toggleHit(h.id);
          rerender();
        });
    },
  );
}
