/**
 * DOCUMENTATION → STYLE: the whole visual language on one page, drawn live.
 *
 * `docs/style-guide.md` argues it and `bun run style-guide` draws a sheet of
 * it; this is the same specimens in the one place a person is already looking
 * when they ask "what colour is that". Everything is built out of `PALETTE`,
 * `STROKE` and `silhouettes.ts` at open time, so the page cannot describe a
 * game the code stopped being — and a swatch here can be clicked and copied,
 * which is the thing a flat picture of a palette can never do.
 *
 * Lazy, like every other room in this sheet: nothing is drawn until the tab is
 * clicked, and it is drawn once.
 */

import { colourSection, dialSection } from "./style-colour.js";
import { depthSection, lineSection, silhouetteSection, sizeSection } from "./style-form.js";

let drawn = false;

function renderStyle(): void {
  if (drawn) return;
  const body = document.getElementById("styleBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren(
    colourSection(),
    dialSection(),
    lineSection(),
    sizeSection(),
    silhouetteSection(),
    depthSection(),
  );
}

export function bindStyleTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="style"]')
    ?.addEventListener("click", renderStyle);
}
