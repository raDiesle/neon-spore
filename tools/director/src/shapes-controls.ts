/**
 * The control row above whichever of SHAPES's two views is showing: which
 * view, a skin, a motion and a light, each picked once for the whole page.
 *
 * VIEW was added when the owner asked for the transpose — one body walked
 * across every skin, every motion and both lights — to be the page's default,
 * with the sixty-body catalogue behind a toggle they named ADVANCED. It sits
 * beside the three axis groups rather than among them: SKIN, MOTION and
 * LIGHT say what a body is wearing, and VIEW says which half of the page is
 * showing it. The two `shapes-view-*` elements it switches live in
 * `index.html`; this file only sets their `display` and does not own the
 * markup inside either.
 *
 * It used to be one undivided run of buttons — twenty skins, then the light,
 * then OWN and every spare motion, separated only by a one-character tag set
 * in the same small type as everything around it. A tag that short reads as
 * a bullet, not a heading, so the row never said the one thing it most needed
 * to: that these are three independent axes, and any skin, any motion and
 * either light state combine freely. This file says that in words. Each axis
 * gets a heading a reader parses as a heading, and one line under it, in the
 * page's own voice, naming what it picks, saying it does not touch the other
 * two, and spelling out the current pick — OWN and LIT most of all, since
 * they used to carry their whole meaning in a tooltip nobody had to read.
 *
 * The state itself — which skin, whether the light is on, which motion —
 * still lives in `shapes-pair.ts`. This file only reads it through the three
 * getters that file already exported for `shapes-all.ts`, and writes it
 * through three small setters added beside them. `shapes-pair.ts`
 * re-exports `controlBar` from here, so `shapes-panel.ts` keeps importing it
 * from the same place it always has and nothing else has to move.
 *
 * Rebuilding every card is the whole of switching: a figure's fill, aura and
 * clip are decided when it is constructed, and mutating them in place would
 * be a second copy of `buildSkin` that has to agree with the first. That
 * rebuild once cost seven to twelve seconds; almost none of it was the
 * rebuild, it was the frame fit, rescanned per card per switch for an answer
 * that had not changed — `shape-figure.ts` remembers it now, so a click here
 * costs about a fifth of a second regardless of which of the three groups it
 * lands in.
 */

import { MOTIONS } from "@neon-spore/shape-sheet";
import {
  currentLit,
  currentMotion,
  currentSkin,
  setMotion,
  setSkin,
  toggleLit,
} from "./shapes-pair.js";
import { SKINS } from "./skins/index.js";

export type ShapesView = "transpose" | "advanced";

/** Which of the two views is showing. TRANSPOSE, because that is the default
 * the owner asked for — see this file's header. */
let view: ShapesView = "transpose";

/**
 * Shows the picked view's element and hides the other. Called on every
 * `controlBar` build (not only on a VIEW click) so the two stay in step with
 * `view` even if something else rebuilt the page around them.
 */
function applyView(): void {
  const transpose = document.getElementById("shapes-view-transpose");
  const advanced = document.getElementById("shapes-view-advanced");
  if (transpose) transpose.style.display = view === "transpose" ? "" : "none";
  if (advanced) advanced.style.display = view === "advanced" ? "" : "none";
}

/**
 * Switches the view and, only when it actually changed, scrolls the sheet
 * back to the top. Landing in the middle of a sixty-card grid after leaving
 * the middle of the transpose is a small thing that would irritate every
 * single time, so a switch always opens on what it switched to rather than
 * wherever the reader had scrolled the other view to.
 */
function setView(next: ShapesView): void {
  if (next === view) return;
  view = next;
  applyView();
  document.getElementById("backlogBody")?.scrollTo({ top: 0 });
}

function button(host: HTMLElement, label: string, on: boolean, hint: string, pick: () => void) {
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
function group(
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
 * The whole control row, built once above whichever of the two views is
 * showing — VIEW picks between them, and SKIN, MOTION and LIGHT are read by
 * both: `shapes-panel.ts`'s catalogue cards and, through `shapes-all.ts`'s
 * three grids, the transpose.
 */
export function controlBar(host: HTMLElement, rerender: () => void): void {
  host.replaceChildren();
  host.classList.add("control-bar");
  applyView();

  group(
    host,
    "VIEW",
    `Which half of the page is showing — independent of the skin, motion and ` +
      `light below; either view can show any combination of them. TRANSPOSE ` +
      `walks one body across every option; ADVANCED is the sixty-body ` +
      `catalogue where the combinations get set. Now: ${view === "transpose" ? "TRANSPOSE" : "ADVANCED"}.`,
    (row) => {
      button(
        row,
        "TRANSPOSE",
        view === "transpose",
        "one body, drawn once per skin, once per motion, once per light state",
        () => {
          setView("transpose");
          rerender();
        },
      );
      button(
        row,
        "ADVANCED",
        view === "advanced",
        "the sixty-body catalogue, where a shape and an idea meet",
        () => {
          setView("advanced");
          rerender();
        },
      );
    },
  );

  group(
    host,
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
    host,
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
    host,
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
}
