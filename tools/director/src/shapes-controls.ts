/**
 * The control rows on SHAPES: which view, and — on COMPOSE only — a skin, a
 * motion and a light, each picked once for the whole page.
 *
 * VIEW was added when the owner asked for the one-body walk — one body drawn
 * across every skin, every motion and both lights — to be the page's default,
 * with the sixty-body catalogue behind a second tab. The two were called
 * TRANSPOSE and ADVANCED; they are OVERVIEW and COMPOSE now, because the
 * owner reads them as the page's two sections rather than as a mode switch,
 * and because ADVANCED said "harder" when what it means is "this is where the
 * combinations get set".
 *
 * **The three axis groups belong to COMPOSE and are built into its own
 * element.** OVERVIEW is meant to open on a picture: a body picker made of
 * the bodies themselves, and the three grids under it. A skin row, a motion
 * row and a light row above that are twenty-odd buttons asking to be pressed
 * before the reader has seen anything, and the walk already shows every one
 * of their values at once — so on OVERVIEW there is nothing to set and
 * nothing is shown. `host` here holds the VIEW tabs and only ever those; the
 * axes go into `shapesAxes`, inside the COMPOSE half of `index.html`, and are
 * cleared when OVERVIEW is showing.
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

export type ShapesView = "overview" | "compose";

/** Which of the two views is showing. OVERVIEW, because that is the default
 * the owner asked for — see this file's header. */
let view: ShapesView = "overview";

/**
 * Shows the picked view's element and hides the other. Called on every
 * `controlBar` build (not only on a VIEW click) so the two stay in step with
 * `view` even if something else rebuilt the page around them.
 */
function applyView(): void {
  const overview = document.getElementById("shapes-view-overview");
  const compose = document.getElementById("shapes-view-compose");
  if (overview) overview.style.display = view === "overview" ? "" : "none";
  if (compose) compose.style.display = view === "compose" ? "" : "none";
}

/**
 * Switches the view and, only when it actually changed, scrolls the sheet
 * back to the top. Landing in the middle of a sixty-card grid after leaving
 * the middle of OVERVIEW is a small thing that would irritate every
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
 * The VIEW tabs, and — when COMPOSE is showing — the three axis groups beside
 * the catalogue. `host` is the strip at the top of the page and holds the tabs
 * alone; the axes are built into `shapesAxes` inside the COMPOSE half, and
 * that element is emptied while OVERVIEW is showing. See this file's header
 * for why OVERVIEW carries no controls.
 */
export function controlBar(host: HTMLElement, rerender: () => void): void {
  host.replaceChildren();
  host.classList.add("control-bar");
  applyView();

  group(
    host,
    "VIEW",
    `Which section of the page is showing. OVERVIEW walks one body across ` +
      `every skin, every motion and both light states, with nothing to set; ` +
      `COMPOSE is the sixty-body catalogue and the three axes that say what ` +
      `every card there is wearing. Now: ${view === "overview" ? "OVERVIEW" : "COMPOSE"}.`,
    (row) => {
      button(
        row,
        "OVERVIEW",
        view === "overview",
        "one body, drawn once per skin, once per motion, once per light state",
        () => {
          setView("overview");
          rerender();
        },
      );
      button(
        row,
        "COMPOSE",
        view === "compose",
        "the sixty-body catalogue, and the skin, motion and light every card wears",
        () => {
          setView("compose");
          rerender();
        },
      );
    },
  );

  const axes = document.getElementById("shapesAxes");
  if (!axes) return;
  axes.replaceChildren();
  axes.classList.add("control-bar");
  if (view !== "compose") return;

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
}
