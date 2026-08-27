/**
 * ORPHANS — what is built and reached by nothing.
 *
 * THE GAUGE was playable and sat in no gap the game plays through; two
 * creatures shipped that no wave could place at all — and nothing said so,
 * because nothing was asking. `packages/content/src/mechanics.ts` is the
 * closed registry that can finally be asked, and `orphanReport` (in
 * `tools/orphans`, the same pure function `bun run orphans` prints) is that
 * question asked from the browser.
 *
 * No server round trip: unlike TO CHECK or NOT BUILT YET, the whole answer is
 * a pure read of content the bundle already carries, so it is computed once,
 * at load, and repainted the moment the sheet opens — the count on the header
 * button is never stale and never waits on a fetch.
 *
 * Styled to be found rather than opened into: a mechanic nobody can reach is
 * a defect, not a note, so the header button turns the same red a failed
 * check does the moment the count leaves zero, instead of sitting the same
 * colour as everything else until someone thinks to look.
 */

import { orphanReport } from "../../orphans/orphans.js";

let orphans = orphanReport();

function el(tag: string, cls = "", text = ""): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

/** The count on the header button, so the sheet does not have to be opened to see it. */
function paintCount(): void {
  const open = document.getElementById("orphansOpen");
  if (!open) return;
  open.textContent = orphans.length === 0 ? "☠ ORPHANS 0" : `☠ ${orphans.length} ORPHANED`;
  open.classList.toggle("danger", orphans.length > 0);
}

function render(): void {
  const body = document.getElementById("orphansBody");
  if (!body) return;
  body.replaceChildren();

  if (orphans.length === 0) {
    body.appendChild(
      el(
        "p",
        "note",
        "nothing orphaned — every mechanic that spawns or gaps is reached by a wave or a gap.",
      ),
    );
    return;
  }

  for (const orphan of orphans) {
    const row = el("div", "orphan");
    const head = el("div", "orphan-head");
    head.appendChild(el("span", "mark", "✗"));
    head.appendChild(el("span", "id", orphan.id));
    head.appendChild(el("span", "stamp", orphan.reach.toUpperCase()));
    row.appendChild(head);
    row.appendChild(el("p", "what", orphan.what));
    row.appendChild(el("p", "fix", `fix — ${orphan.fix}`));
    body.appendChild(row);
  }
}

export function bindOrphans(): void {
  // Painted before the sheet even exists to be opened: this is the one panel
  // whose whole point is being noticed unopened, the same reason TO CHECK's
  // count paints itself at load rather than waiting for a click.
  paintCount();

  const sheet = document.getElementById("orphans");
  const open = document.getElementById("orphansOpen");
  const close = document.getElementById("orphansClose");
  if (!sheet || !open || !close) return;

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (on) {
      // Re-read on every open rather than cached from load: `bun --hot`
      // reloads the content module after SAVE waves.ts writes it, and this is
      // what notices — the count painted at page load would otherwise go on
      // reporting the file as it stood before the wave that fixed it saved.
      orphans = orphanReport();
      paintCount();
      render();
    }
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });
}
