import { button, el } from "./dom.js";
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
 * One kind of look lives behind it, and it opens in a new tab rather than on
 * this page: **candidates** (`versus-page.ts`), patches on records the game
 * already exports, judged against what ships. Everything used to be drawn here
 * at once, which meant a tab nobody could open without the browser animating
 * five demos and eighteen phone-sized renderers. It is a list now, and a look
 * costs something only when it is opened.
 *
 * A second door stood here until 7 September 2026: BAKED ANIMATIONS, the PNG,
 * APNG and animated WebP examples. The owner rejected it on the one ground the
 * technique cannot answer — a baked sequence is hundreds of kilobytes down a
 * phone's connection for something the field already draws procedurally, and
 * looking at it harder does not make those bytes worth sending. The machinery
 * it was a door onto is still in the tree and still works, so the page opens
 * on `parkedSection()`, which says so in the one place somebody would look.
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

  page.appendChild(parkedSection());
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
  body.appendChild(page);
}

/**
 * The first thing on the tab, and the reason it is first: a capability the
 * game carries and does not use is invisible, and the next session that wants
 * an animated sequence would build the whole of it a second time.
 *
 * Baked sprite sheets — a strip, an APNG, an animated WebP, the loader, the
 * browser capability probe and the generator that writes them — are shipped
 * code, tested, and wired into the real game behind `?raster=1`. What they do
 * not have is a graphic worth the bytes or a place on the field that wants
 * one. The owner asked for that written down where it cannot be lost, rather
 * than for the code to be deleted.
 */
function parkedSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "PARKED: ANIMATED SPRITE SHEETS"));
  section.appendChild(
    el(
      "p",
      "note",
      "The game can play baked frame animations — a sprite strip stepped by " +
        "the tick counter, an APNG or an animated WebP in a plain <img>, a " +
        "loader, and a probe for what the browser can decode. It is built, " +
        "tested and wired into the real field behind ?raster=1. It is switched " +
        "off because a sixteen-frame burst costs 80–200 kB down a phone's " +
        "connection and the field draws the same explosion procedurally for " +
        "nothing.",
    ),
  );
  section.appendChild(
    el(
      "p",
      "note",
      "Turn it back on the day there is a graphic that earns the bytes and a " +
        "use case the procedural renderer cannot reach. The parts are " +
        "packages/render's sprite-burst.ts, raster-load.ts, raster-caps.ts and " +
        "raster-probe.ts; apps/game's raster.ts; the generator under " +
        "tools/raster (bun run raster, raster:pack, raster:verify); and the " +
        "assets in assets/raster and assets/gallery. How the whole of it fits " +
        "together is docs/raster.md.",
    ),
  );
  return section;
}
