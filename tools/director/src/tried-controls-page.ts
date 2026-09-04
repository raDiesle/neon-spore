/**
 * TRIED AND SET ASIDE — the other list on the CONTROLS tab, and the smaller
 * one.
 *
 * Split out of `field-controls-page.ts` when THE MAW TAP pushed that file past
 * its 250-line limit. The seam is the one that file's own header already drew:
 * it said it held **two lists**, and this is the second — controls the game was
 * played with and no longer is, which is a different subject from the ones a
 * thumb can reach today and shares nothing with them but a tab.
 */

/**
 * A control the game was played with before something else replaced it —
 * kept because the owner asked to, not because it is still reachable by any
 * wave. The write-up stays in the spec; this only names the section and
 * quotes nothing beyond it, so the two cannot say different things about
 * the same idea.
 */
export interface TriedControlDef {
  name: string;
  /** Where the write-up lives, named so a reader can find it with a text
   * search rather than a line number that will move. */
  specHeading: string;
  note: string;
}

export const TRIED_CONTROLS: readonly TriedControlDef[] = [
  {
    name: "HOLD-TO-TEAR",
    specHeading:
      "bosses.md 11.4 — Hold-to-tear, a window closed by succeeding rather than by giving up",
    note:
      "THE WARDEN's tether before the pull replaced it: hold, and only hold — " +
      "no drag, no direction, a thumb on the line that accumulates ticks " +
      "toward a tear. Implemented and working, not merely designed; the owner " +
      "asked for it kept and possibly tested on another wave or boss.",
  },
];

function triedControlRow(c: TriedControlDef): HTMLElement {
  const section = document.createElement("section");
  section.className = "tried-control";
  const h3 = document.createElement("h3");
  h3.textContent = c.name;
  section.appendChild(h3);
  const note = document.createElement("p");
  note.textContent = c.note;
  section.appendChild(note);
  const ref = document.createElement("p");
  ref.className = "ref";
  ref.textContent = c.specHeading;
  section.appendChild(ref);
  return section;
}

/** TRIED AND SET ASIDE, built once alongside PANELS — see `renderFieldControls`. */
export function renderTriedControls(): void {
  const body = document.getElementById("controlsTriedBody");
  if (!body) return;
  body.replaceChildren();
  for (const c of TRIED_CONTROLS) body.appendChild(triedControlRow(c));
}
