/**
 * The transpose of the SHAPES tab: one body, drawn once per option, on one
 * screen — the third and last thing `docs/decisions.md` #24 asked for.
 *
 * This is what SHAPES opens on now. The owner used the sixty-body catalogue
 * beside this grid for an afternoon and said the question they actually open
 * the page to ask is the one this file answers, not that one — so `index.html`
 * shows this grid first, as OVERVIEW, and holds the catalogue and the three
 * axis rows behind `shapes-controls.ts`'s COMPOSE tab. Nothing below changed
 * for that: this file still just fills
 * `shapesAllBody`/`shapesAllSkins`/`shapesAllMotions`/`shapesAllLight`
 * whenever `renderShapes` runs, whether or not they are the visible half.
 *
 * SHAPES draws sixty bodies wearing one skin, which answers "does this skin
 * work on the catalogue." It cannot answer the other question the owner
 * actually has now that there are twenty skins to choose among: does *this*
 * skin beat that one, on the *same* body? Flipping the skin bar back and
 * forth is not a comparison, it is a tournament nobody runs to the end — the
 * same argument `shapes-pair.ts` made for a two-skin card, now made for all
 * twenty at once instead of two at a time.
 *
 * Three grids, not one, because the skins are only the first axis a body can
 * be walked across. A motion can only be seen today by forcing it on the
 * whole catalogue and remembering the last one — there is no page where all
 * eighteen stand still long enough to be told apart. The light is a third,
 * and it is two cards wide, so it rides along for nearly nothing.
 *
 * **One grid, written once, walked per axis.** The card, the clock, the body
 * picker and the size floor are the same in all three; only the list of
 * options and what each hands to `shapeFigure` differ. `grid()` below is that
 * one function, called three times.
 *
 * **Each grid holds the other two axes at whatever `shapes-pair.ts`'s control
 * row currently says**, read through its three getters. A body demonstrating
 * PERISTALSIS while wearing nothing is a contour, not a look, and a skin held
 * still is half of what a skin is — so a grid never shows its own axis
 * against a blank; it shows it against whatever the reader already picked for
 * the other two.
 *
 * **Every figure on every grid is on the one clock `shape-figure.ts` already
 * runs.** Twenty figures on twenty `t` values would be twenty phases of the
 * same animation, and what would be read is the phase rather than the skin —
 * so nothing here starts a second loop; `shapeFigure` is called the same way
 * `shapes-pair.ts` calls it, and the shared `tick` in that file does the rest.
 *
 * **Size floor.** `bun run shapes:report` at the 92 px frame this page uses
 * puts THE WEIGHT at 60.5 × 49.3 px drawn — comfortably clear of the 20–26 px
 * floor `docs/spec/graphics.md` sets, and the frame does not need to shrink to
 * fit twenty across: a row wraps rather than being forced onto one line, the
 * same choice `shapes-pair.ts` made rather than halve a card. Numbers for
 * smaller frames, checked before picking this one: 80 px → 52.6 × 42.9, 70 px
 * → 46.0 × 37.5, 60 px → 39.4 × 32.2, 50 px → 32.9 × 26.8 (short axis just
 * above the floor), 46 px → 30.2 × 24.7 (short axis under 26), 40 px → 26.3 ×
 * 21.4 (long axis barely clears, short does not). 92 — the same frame the
 * cards above already use — is the first of those with no axis near the
 * floor, so nothing here shrinks past it.
 */

import type { OwnMotion } from "@neon-spore/content";
import { CATALOGUE, type CatalogueEntry, MOTIONS } from "@neon-spore/shape-sheet";
import { GLOWS, type GlowId } from "./glows/index.js";
import { isWide, shapeFigure } from "./shape-figure.js";
import { currentGlows, currentLit, currentMotion, currentSkin } from "./shapes-pair.js";
import { SKINS, type SkinId } from "./skins/index.js";

const BOX = 92;
const WIDE = 620;

const STROKE: Record<CatalogueEntry["status"], string> = {
  draft: "var(--cyan)",
  free: "var(--gold)",
  taken: "var(--dim)",
};

/** The body every grid is drawn from. THE WEIGHT, because it is the one the
 * owner named — see the brief this file answers. */
let bodyName = "THE WEIGHT";

function bodyEntry(): CatalogueEntry {
  return (
    CATALOGUE.find((e) => e.subject.name === bodyName) ??
    CATALOGUE.find((e) => e.subject.name === "THE WEIGHT") ??
    CATALOGUE[0]!
  );
}

/** The frame a picker thumbnail is drawn into. Small enough that sixty of
 * them are a strip rather than a page, large enough that the lobes that tell
 * two bodies apart are still lobes: `bun run shapes:report` puts THE WEIGHT at
 * 60.5 × 49.3 px in the 92 px frame the grids use, so 56 leaves it near 37 ×
 * 30, clear of the field's 26 px floor on both axes — and this is a picker
 * rather than a thing being judged. */
const PICK = 56;
/** The long frame a `isWide` body gets in the picker, scaled from `WIDE` by
 * the same ratio `PICK` is scaled from `BOX`, so a hull is neither a hairline
 * nor a strip six bodies wide. */
const PICK_WIDE = 220;

/**
 * The body picker: one button per catalogue name, and the button is the body.
 *
 * These were text buttons reading THE WEIGHT, THE CAIRN and fifty-eight more,
 * which is the one thing a picker between pictures must not be — the reader
 * is choosing a shape, and a name is a shape they have to remember rather
 * than one they can see. So each button draws the contour it selects, with
 * the name kept underneath as a caption: the name is still what the grids and
 * the commit messages call it, and a picture with no name cannot be talked
 * about.
 *
 * Drawn in LINE, not in whatever skin COMPOSE last set. The picker is
 * navigation and the three grids under it are the comparison; a picker that
 * changed its own look when the skin changed would read as a fourth grid,
 * and LINE is the control every skin is judged against anyway.
 */
function bodyPicker(host: HTMLElement, rerender: () => void): void {
  host.replaceChildren();
  const seen = new Set<string>();
  for (const e of CATALOGUE) {
    if (seen.has(e.subject.name)) continue;
    seen.add(e.subject.name);

    const b = document.createElement("button");
    b.type = "button";
    b.className = e.subject.name === bodyName ? "body is-on" : "body";
    b.title = e.subject.note;
    b.appendChild(
      shapeFigure(e, {
        box: PICK,
        width: isWide(e) ? PICK_WIDE : PICK,
        stroke: STROKE[e.status],
        skin: "line",
        lit: true,
      }),
    );
    const label = document.createElement("span");
    label.className = "body-name";
    label.textContent = e.subject.name;
    b.appendChild(label);
    b.addEventListener("click", () => {
      bodyName = e.subject.name;
      rerender();
    });
    host.appendChild(b);
  }
}

interface Cell {
  label: string;
  skin: SkinId;
  lit: boolean;
  motion: OwnMotion | undefined;
  /** The glow stack this cell wears. A set, unlike the other three, which is
   * the whole reason GLOW is a fourth axis rather than more skins. */
  glows: readonly GlowId[];
  /** What to leave room for, when that is not what is drawn. Only the glow
   * row sets it — see `renderShapesAll`. */
  padFor?: readonly GlowId[];
}

function figureCell(box: number, width: number, stroke: string, entry: CatalogueEntry, c: Cell) {
  const col = document.createElement("div");
  col.style.cssText = "display:flex;flex-direction:column;gap:2px;flex:0 0 auto;min-width:0";
  col.appendChild(
    shapeFigure(entry, {
      box,
      width,
      stroke,
      skin: c.skin,
      lit: c.lit,
      motion: c.motion,
      glows: c.glows,
      padFor: c.padFor,
    }),
  );
  const label = document.createElement("span");
  label.textContent = c.label;
  label.style.cssText = "font-size:8px;letter-spacing:1px;color:#574d84;text-align:center";
  col.appendChild(label);
  return col;
}

/**
 * The one grid, walked per axis: `entry` drawn once per `cells` entry, all of
 * them at the size the page's cards already draw at, wrapping rather than
 * shrinking to fit a row.
 */
function grid(hostId: string, entry: CatalogueEntry, cells: Cell[]): void {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.replaceChildren();
  const wide = isWide(entry);
  const stroke = STROKE[entry.status];
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start";
  for (const c of cells) wrap.appendChild(figureCell(BOX, wide ? WIDE : BOX, stroke, entry, c));
  host.appendChild(wrap);
}

/**
 * The whole foot of the page: the body picker, then the three grids. Called
 * from `shapes-panel.ts`'s `renderShapes`, so a click on the skin, light or
 * motion bar above — which reruns that function — redraws these too, and the
 * two axes each grid is holding still stay in step with what the bar says.
 */
export function renderShapesAll(): void {
  const bodyHost = document.getElementById("shapesAllBody");
  if (!bodyHost) return;
  bodyPicker(bodyHost, renderShapesAll);

  const entry = bodyEntry();
  const lit = currentLit();
  const motion = currentMotion();
  const skin = currentSkin();
  const glows = currentGlows();

  grid(
    "shapesAllSkins",
    entry,
    SKINS.map((s) => ({ label: s.label, skin: s.id, lit, motion, glows })),
  );
  grid(
    "shapesAllMotions",
    entry,
    MOTIONS.map((m) => ({ label: m.name, skin, lit, motion: m, glows })),
  );
  // NONE first and then one glow at a time, never the stack the bar is set to.
  // The other three grids hold their own axis against whatever the reader
  // already picked for the rest, which is right for them — a skin under no
  // glow is still that skin. It is wrong here: a grid of seven cells each
  // showing SWARM plus the one value that cell is named after would be seven
  // pictures of SWARM, and the axis would be unreadable exactly where it is
  // being introduced. So this grid is the one place on the page that overrides
  // its own axis rather than composing with it.
  //
  // Every cell is padded for the *widest* glow rather than for its own, so the
  // eight bodies come out the same size. Padded each for its own, SPARKS drew
  // its body two thirds the width of NONE's and the row read as the axis
  // shrinking things — which is the padding being compared rather than the
  // effect.
  const padFor = GLOWS.map((g) => g.id);
  grid("shapesAllGlows", entry, [
    { label: "NONE", skin, lit, motion, glows: [], padFor },
    ...GLOWS.map((g) => ({ label: g.label, skin, lit, motion, glows: [g.id], padFor })),
  ]);
  grid("shapesAllLight", entry, [
    { label: "LIT", skin, lit: true, motion, glows },
    { label: "UNLIT", skin, lit: false, motion, glows },
  ]);
}
