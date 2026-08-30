import type { OwnMotion } from "@neon-spore/content";
import type { CatalogueEntry } from "@neon-spore/shape-sheet";
import type { GlowId } from "./glows/index.js";
import type { HitId } from "./hits/index.js";
import { isWide, shapeFigure } from "./shape-figure.js";
import type { SkinId } from "./skins/index.js";
import type { TailId } from "./tails/index.js";

/**
 * One grid, written once and walked per axis.
 *
 * Split out of `shapes-all.ts` when TAIL made a sixth grid and took that file
 * past the length limit. The seam is the one the file already described in
 * prose: this is **the card, the frame and the row**, identical whichever axis
 * is being shown, and what is left there is **which axes get walked and what
 * each cell holds still**. Six callers, one implementation — a second copy of
 * a card would drift, and a page comparing drifted cards compares nothing.
 */

const BOX = 92;
const WIDE = 620;

const STROKE: Record<CatalogueEntry["status"], string> = {
  draft: "var(--cyan)",
  free: "var(--gold)",
  taken: "var(--dim)",
};

export interface Cell {
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
  /** The hit stack this cell wears. Draws nothing between triggers. */
  hits: readonly HitId[];
  /** The hit equivalent of `padFor`. Only the hit row sets it. */
  padForHits?: readonly HitId[];
  /** The tail stack this cell wears. */
  tails: readonly TailId[];
  /** The tail equivalent of `padFor`. Only the tail row sets it. */
  padForTails?: readonly TailId[];
  /** A second caption line under the cell, for a value that is already in the
   * game rather than a proposal. Only the tail row sets it. */
  note?: string;
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
      hits: c.hits,
      padForHits: c.padForHits,
      tails: c.tails,
      padForTails: c.padForTails,
    }),
  );
  const label = document.createElement("span");
  label.textContent = c.label;
  label.style.cssText = "font-size:8px;letter-spacing:1px;color:#574d84;text-align:center";
  col.appendChild(label);
  if (c.note) {
    // Brighter than the name, because it is the thing that changes how the
    // cell is read: this one is not a proposal, it is what ships.
    const note = document.createElement("span");
    note.textContent = c.note;
    note.style.cssText = "font-size:7px;letter-spacing:1px;color:#2FE0F0;text-align:center";
    col.appendChild(note);
  }
  return col;
}

/**
 * The one grid, walked per axis: `entry` drawn once per `cells` entry, all of
 * them at the size the page's cards already draw at, wrapping rather than
 * shrinking to fit a row.
 *
 * `box` is an override and only the TAIL row passes one. Every other axis
 * draws something that surrounds the body, so a square frame fits it; a tail
 * is the one thing on this page that is entirely *vertical*, reaching two or
 * three body-heights up and nothing sideways. In a square frame padded for
 * that, the body it is a tail of comes out around 25 px — at the legibility
 * floor `docs/spec/graphics.md` sets, and being judged at a size the field
 * never shows it at. A taller card is the same fix `isWide` already makes for
 * a hull, turned ninety degrees.
 */
export function grid(hostId: string, entry: CatalogueEntry, cells: Cell[], box = BOX): void {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.replaceChildren();
  const wide = isWide(entry);
  const stroke = STROKE[entry.status];
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start";
  for (const c of cells) wrap.appendChild(figureCell(box, wide ? WIDE : box, stroke, entry, c));
  host.appendChild(wrap);
}

/**
 * The whole foot of the page: the body picker, then the three grids. Called
 * from `shapes-panel.ts`'s `renderShapes`, so a click on the skin, light or
 * motion bar above — which reruns that function — redraws these too, and the
 * two axes each grid is holding still stay in step with what the bar says.
 */
