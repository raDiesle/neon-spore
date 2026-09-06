import { button, el } from "./dom.js";
import { animationsUrl, openInNewTab } from "./versus-open.js";
import { versusListSection } from "./versus-page.js";

/**
 * The VERSUS tab: every look offered beside what the field already draws,
 * never in place of it — as a list of doors, with nothing animating on it.
 *
 * It was called OTHER GRAPHICS until the owner pointed out that everything
 * about it — this repository, `docs/versus.md`, `tools/versus/`, every session
 * that has ever discussed it — calls the mechanism VERSUS, and a tab named
 * after the one word nobody uses is a tab you have to remember the way to.
 * The name on the button is now the name in the files.
 *
 * Two kinds of look live behind it and both open in a new tab rather than on
 * this page. **Candidates** (`versus-page.ts`) are patches on records the game
 * already exports, judged against what ships. **Baked animations**
 * (`animations-page.ts`) are the PNG, APNG and animated WebP examples, plus the
 * hand-painted sequences with no shipped counterpart at all — CLAUDE.md's *A
 * look with no shipped alternative* exemption. Everything used to be drawn
 * here at once, which meant a tab nobody could open without the browser
 * animating five demos and eighteen phone-sized renderers. It is a list now,
 * and a look costs something only when it is opened.
 *
 * Mounted the way GUIDES is (`guide-page.ts`): a tab button and a page
 * appended to the backlog sheet's own bar before `bindTabs` runs, placed right
 * after SHAPES rather than at the end — the two are the pages a look gets
 * judged on. There is no lazy draw left to wire, because there is nothing on
 * this page that moves.
 */

const TAB_ID = "versus";

export function mountVersusTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = button("VERSUS");
  tab.dataset.tab = TAB_ID;
  // Next to SHAPES, not appended at the end of the bar — the two are the
  // pages a look gets judged on, and `insertBefore(x, null)` is `appendChild`
  // for the case SHAPES's own tab button is somehow not there yet.
  const shapesTab = tabs.querySelector<HTMLElement>('[data-tab="shapes"]');
  tabs.insertBefore(tab, shapesTab?.nextSibling ?? null);

  const page = el("div", "sheetpage");
  page.id = `sheet-${TAB_ID}`;

  page.appendChild(
    el(
      "p",
      "note",
      "Nothing on this page is on the field. Every look below is offered " +
        "beside what the game already draws, for the owner to accept, improve " +
        "or throw away — see CLAUDE.md's *A look is offered, never replaced*.",
    ),
  );
  page.appendChild(
    el(
      "p",
      "note",
      "Nothing here animates either. Each look opens in its own tab, so the " +
        "browser draws the one comparison you came for rather than all of them " +
        "at once.",
    ),
  );

  page.appendChild(versusListSection());
  page.appendChild(animationsSection());
  body.appendChild(page);
}

/** The other door: the baked-animation page, which is a page rather than a
 * candidate because none of it has a shipped counterpart to vote against. */
function animationsSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "BAKED ANIMATIONS"));
  section.appendChild(
    el(
      "p",
      "note",
      "The sixteen-frame burst as a sprite strip, an APNG and an animated " +
        "WebP; the same strip looping as a powerup aura; the burst hung on a " +
        "real kill on a real field; what this browser can decode; and the " +
        "hand-painted sequences collected from outside this repository. Five " +
        "animations, all of them running the whole time they are on screen — " +
        "which is why they are behind this button and not on this page.",
    ),
  );
  const open = button("OPEN THE BAKED ANIMATIONS ↗", "versus-cast");
  open.addEventListener("click", () => openInNewTab(animationsUrl()));
  section.appendChild(open);
  return section;
}
