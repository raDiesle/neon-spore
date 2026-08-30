import { GLOWS } from "./glows/index.js";
import { HITS } from "./hits/index.js";
import {
  clearGlows,
  clearHits,
  clearTails,
  currentGlows,
  currentHits,
  currentTails,
  toggleGlow,
  toggleHit,
  toggleTail,
} from "./shapes-pair.js";
import { autoHits, fireHit, toggleAutoHits } from "./shapes-trigger.js";
import { button, group } from "./shapes-widgets.js";
import { TAILS } from "./tails/index.js";

/**
 * The three effect axes on COMPOSE: GLOW, HIT and TAIL.
 *
 * Split from `shapes-axes.ts` when TAIL took that file past the length limit,
 * and the seam is a real division rather than a convenience. SKIN, MOTION and
 * LIGHT say **how the body is drawn** — they are one pick each, they have been
 * there since the page existed, and every card wears exactly one of each.
 * These three are **effects**: they all stack, they are all recent, and each
 * of them was added because a question about the game could not be looked at.
 *
 * The practical tell is the control. The three there are radio buttons and the
 * three here are ticks, plus a trigger that only one of them needs.
 */

export function effectGroups(axes: HTMLElement, rerender: () => void): void {
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

  // The sixth axis, and the only one whose controls are partly *the game*.
  // Two of its values are what the renderer already draws, marked here and in
  // the OVERVIEW caption — a proposal compared against a memory of the shipped
  // look wins every time, so the shipped look is on the row.
  const tailsOn = currentTails();
  const tailWearing =
    tailsOn.length === 0
      ? "NONE"
      : TAILS.filter((x) => tailsOn.includes(x.id))
          .map((x) => x.label)
          .join(" + ");
  group(
    axes,
    "TAIL",
    `What the body leaves behind as it falls — the one axis about the field ` +
      `rather than about the body, since falling down a column is the only ` +
      `motion the field has. It stacks, and it draws upward, so a card ` +
      `wearing one sits lower in its frame to leave the room. HALOES and ` +
      `WEDGE are marked IN THE GAME: they are what a slick and a torch wear ` +
      `today, and everything else here has to beat them. Now: ${tailWearing}.`,
    (row) => {
      button(row, "NONE", tailsOn.length === 0, "no tail at all", () => {
        clearTails();
        rerender();
      });
      for (const x of TAILS)
        button(
          row,
          x.shipped ? `${x.label} *` : x.label,
          tailsOn.includes(x.id),
          x.shipped ? `IN THE GAME — ${x.shipped}. ${x.hint}` : x.hint,
          () => {
            toggleTail(x.id);
            rerender();
          },
        );
    },
  );
}
