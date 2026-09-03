/**
 * The control rows on SHAPES: which view, and — on COMPOSE only — a skin, a
 * motion, a light and a glow stack, each set once for the whole page.
 *
 * VIEW was added when the owner asked for the one-body walk — one body drawn
 * across every skin, every motion and both lights — to be the page's default,
 * with the sixty-body catalogue behind a second tab. The two were called
 * TRANSPOSE and ADVANCED; they are OVERVIEW and COMPOSE now, because the
 * owner reads them as the page's two sections rather than as a mode switch,
 * and because ADVANCED said "harder" when what it means is "this is where the
 * combinations get set".
 *
 * **The axis groups belong to COMPOSE and are built into its own element.**
 * OVERVIEW is meant to open on a picture: a body picker made of the bodies
 * themselves, and the grids under it. A skin row, a motion row, a light row
 * and a glow row above that are thirty-odd buttons asking to be pressed
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
 * to: that these are independent axes, and any skin, any motion, either light
 * state and any glow stack combine freely. This file says that in words. Each
 * axis gets a heading a reader parses as a heading, and one line under it, in
 * the page's own voice, naming what it picks, saying it does not touch the
 * others, and spelling out the current pick — OWN, LIT and NONE most of all,
 * since those used to carry their whole meaning in a tooltip nobody had to
 * read, or in GLOW's case in an empty row that says nothing at all.
 *
 * **GLOW is the fourth and it is the one that stacks.** The other three
 * highlight exactly one button, which a reader parses at a glance; a row of
 * ticks does not say whether three lit buttons are three picks or three
 * states of one thing. So its description carries more weight than the rest:
 * it names the whole stack in words, says the stacking order comes from the
 * registry rather than from click order, and names NONE.
 *
 * The state itself — which skin, whether the light is on, which motion, which
 * glows — lives in `shapes-state.ts`, a leaf nothing in the page imports back.
 * The axis rows read it through the getters there and write it through the
 * small setters beside them. `shapes-pair.ts` re-exports `controlBar` from
 * here, so `shapes-panel.ts` keeps importing it from the same place it always
 * has; that re-export is why the state had to move out of `shapes-pair.ts`,
 * which the axes it builds were importing back.
 *
 * Rebuilding every card is the whole of switching: a figure's fill, aura and
 * clip are decided when it is constructed, and mutating them in place would
 * be a second copy of `buildSkin` that has to agree with the first. That
 * rebuild once cost seven to twelve seconds; almost none of it was the
 * rebuild, it was the frame fit, rescanned per card per switch for an answer
 * that had not changed — `shape-figure.ts` remembers it now, so a click here
 * costs about a fifth of a second regardless of which group it lands in.
 */

import { axisGroups } from "./shapes-axes.js";
import { renderShapesBuild } from "./shapes-build.js";
import { button, group } from "./shapes-widgets.js";

export type ShapesView = "overview" | "compose" | "build";

/** Which of the three views is showing. OVERVIEW, because that is the default
 * the owner asked for — see this file's header. */
let view: ShapesView = "overview";

/**
 * Shows the picked view's element and hides the other two. Called on every
 * `controlBar` build (not only on a VIEW click) so all three stay in step
 * with `view` even if something else rebuilt the page around them.
 *
 * BUILD is drawn here rather than left to `renderShapes` the way OVERVIEW and
 * COMPOSE's contents are: neither of those changes when the reader merely
 * switches tabs, but BUILD holds its own state (`shapes-build.ts`'s
 * `attachments`) and a click elsewhere on the page must not silently
 * discard the card mid-build. Drawing it every time this runs is cheap — one
 * body, not sixty — so there is no reason to make that guarantee do less than
 * it could.
 */
function applyView(): void {
  const overview = document.getElementById("shapes-view-overview");
  const compose = document.getElementById("shapes-view-compose");
  const build = document.getElementById("shapes-view-build");
  if (overview) overview.style.display = view === "overview" ? "" : "none";
  if (compose) compose.style.display = view === "compose" ? "" : "none";
  if (build) build.style.display = view === "build" ? "" : "none";
  if (view === "build") renderShapesBuild();
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

/**
 * The VIEW tabs, and — when COMPOSE is showing — the four axis groups beside
 * the catalogue. `host` is the strip at the top of the page and holds the tabs
 * alone; the axes are built into `shapesAxes` inside the COMPOSE half, and
 * that element is emptied while OVERVIEW is showing. See this file's header
 * for why OVERVIEW carries no controls.
 */
export function controlBar(host: HTMLElement, rerender: () => void): void {
  host.replaceChildren();
  host.classList.add("control-bar");
  applyView();

  const viewLabel = view === "overview" ? "OVERVIEW" : view === "compose" ? "COMPOSE" : "BUILD";
  group(
    host,
    "VIEW",
    `Which section of the page is showing. OVERVIEW walks one body across ` +
      `every skin, every motion and both light states, with nothing to set; ` +
      `COMPOSE is the sixty-body catalogue and the four axes that say what ` +
      `every card there is wearing; BUILD is a base blob and a click-together ` +
      `list of parts, for trying a recipe before it is one. Now: ${viewLabel}.`,
    (row) => {
      button(
        row,
        "OVERVIEW",
        view === "overview",
        "one body, drawn once per skin, once per motion, once per glow, once per light state",
        () => {
          setView("overview");
          rerender();
        },
      );
      button(
        row,
        "COMPOSE",
        view === "compose",
        "the sixty-body catalogue, and the skin, motion, light and glow every card wears",
        () => {
          setView("compose");
          rerender();
        },
      );
      button(
        row,
        "BUILD",
        view === "build",
        "pick a base and click parts onto it, then copy the recipe out",
        () => {
          setView("build");
          rerender();
        },
      );
    },
  );

  // The axes go into COMPOSE's own element rather than into `host`, and are
  // simply not built while OVERVIEW is showing — see this file's header for
  // why OVERVIEW opens on a picture and carries no controls at all.
  const axes = document.getElementById("shapesAxes");
  if (!axes) return;
  axes.replaceChildren();
  axes.classList.add("control-bar");
  if (view !== "compose") return;
  axisGroups(axes, rerender);
}
