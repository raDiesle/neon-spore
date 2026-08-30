import { CATALOGUE, type CatalogueEntry } from "@neon-spore/shape-sheet";
import { isWide, shapeFigure } from "./shape-figure.js";

/**
 * The body picker: one button per catalogue name, and the button is the body.
 *
 * Split out of `shapes-all.ts` when the HITS axis took that file past the
 * length limit. The seam is a real one: everything left there answers *what
 * does one body look like across an axis*, and this answers *which body*. One
 * is the comparison, the other is navigation to it.
 */

/** The frame a picker thumbnail is drawn into. Small enough that sixty of
 * them are a strip rather than a page, large enough that the lobes that tell
 * two bodies apart are still lobes: `bun run shapes:report` puts THE WEIGHT at
 * 60.5 x 49.3 px in the 92 px frame the grids use, so 56 leaves it near 37 x
 * 30, clear of the field's 26 px floor on both axes — and this is a picker
 * rather than a thing being judged. */
const PICK = 56;
/** The long frame a `isWide` body gets in the picker, scaled from the grids'
 * wide frame by the same ratio `PICK` is scaled from theirs, so a hull is
 * neither a hairline nor a strip six bodies wide. */
const PICK_WIDE = 220;

const STROKE: Record<CatalogueEntry["status"], string> = {
  draft: "var(--cyan)",
  free: "var(--gold)",
  taken: "var(--dim)",
};

/** The body every grid is drawn from. THE WEIGHT, because it is the one the
 * owner named — see the brief this file answers. */
let bodyName = "THE WEIGHT";

export function pickedEntry(): CatalogueEntry {
  return (
    CATALOGUE.find((e) => e.subject.name === bodyName) ??
    CATALOGUE.find((e) => e.subject.name === "THE WEIGHT") ??
    CATALOGUE[0]!
  );
}

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
export function bodyPicker(host: HTMLElement, rerender: () => void): void {
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
        glows: [],
        hits: [],
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
