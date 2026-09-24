import {
  isPhoneView,
  onPhone,
  type PhoneView,
  rememberedView,
  showPhoneView,
} from "./phone-view.js";

/**
 * On a phone the director opens on a menu, not on a wave. Every reachable
 * thing — the three views (WAVE, GAME, MAP) and the five pages the header has
 * always opened (≡ RELEASE NOTES, ☠ ORPHANS, ◇ NOT BUILT YET, ▣ DOCUMENTATION,
 * ♪ SOUND) — is one `.menu-item` button in `<header>`, marked in
 * the markup rather than assembled here; `body.menu-open` is what turns that
 * same header into the full-screen list (see the `@media (max-width: 700px)`
 * block in index.html). Nothing is duplicated: a page still opens exactly
 * the way it always did, from the same button, whether that button is
 * showing as a compact header item on a wide screen or as a full-width row
 * in the phone menu.
 *
 * `#menuToggle` is the way back in, reachable from any of the three views
 * because the header sits outside every one of them. A page opened from the
 * menu carries its own ✕ CLOSE, which returns to whichever view was showing
 * underneath — the menu itself is not in that loop, by design: closing a
 * page is "go back one", not "go all the way out".
 *
 * **Which view is showing is not this file's any more** (`phone-view.ts`): a
 * row in the wave list opens a wave straight into one, so the switch needed an
 * owner the menu is only one caller of.
 */

export function initMobileMenu(search: string = location.search): void {
  const main = document.querySelector("main");
  const menuToggle = document.getElementById("menuToggle");
  const viewButtons = document.querySelectorAll<HTMLButtonElement>("header .menu-item[data-view]");
  const menuItems = document.querySelectorAll<HTMLButtonElement>("header .menu-item");
  if (!main || !menuToggle) return;

  const forced = new URLSearchParams(search).get("view");
  // Remembered only when it was chosen, which is what `showPhoneView`'s second
  // argument is for: a `?view=` in the address is this load's alone.
  if (isPhoneView(forced)) showPhoneView(forced, false);
  else showPhoneView(rememberedView() ?? "wave", false);

  for (const b of viewButtons)
    b.addEventListener("click", () => showPhoneView(b.dataset.view as PhoneView));

  // Any menu item, view or page, dismisses the menu — a page opens over it,
  // a view is now showing underneath it. Runs alongside each button's own
  // click handler (bound elsewhere for the six pages), not instead of it.
  for (const item of menuItems)
    item.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
    });

  menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  // RUN follows the menu rather than any one of the four callers that open or
  // close it — `showPhoneView` is one of them and has no business knowing what
  // a transport is (`phone-view.ts`).
  new MutationObserver(() => holdTransport(document.body.classList.contains("menu-open"))).observe(
    document.body,
    { attributeFilter: ["class"] },
  );

  // `?view=` is a one-load override for a session driving the page with no
  // mouse (mirrors columns.ts's `?closed=`) — it jumps straight past the
  // menu. Otherwise the phone always opens on the menu, even on a repeat
  // visit: that is the point being asked for, not a default to remember.
  if (onPhone() && !isPhoneView(forced)) {
    document.body.classList.add("menu-open");
    holdTransport(true);
  }
}

/**
 * **RUN, WHILE THE MENU IS OPEN.**
 *
 * The GAME view is the whole screen from 24 September 2026 — the owner: *"the
 * game must fit 100 height and width so I can play it with focus and without
 * scroll."* RUN stood one thumb-flick under the field before that, which cost
 * the view a scroll; and a canvas filling the screen answers every press
 * itself (`touch-action: none`), so the flick had nowhere left to start from.
 *
 * So the transport stands in the open menu instead, which is the ☰ the same
 * owner's *"only menu button"* leaves on screen. **Moved, not copied**: ⏸ and
 * DIFFICULTY are bound to these elements by id (`stage-transport.ts`,
 * `pair-panel.ts`), and a second set of them would be a second state to keep
 * right. It goes home to its own section on the way out, so a desk — which
 * never opens this menu — sees the column it always had.
 *
 * Called off `body`'s own class rather than from each of the places that open
 * and close the menu: `showPhoneView` is one of them, reached from a row in
 * the wave list, and that file has no business knowing what a transport is.
 */
function holdTransport(open: boolean): void {
  const transport = document.querySelector<HTMLElement>(".transport");
  const header = document.querySelector("header");
  const home = document.querySelector('section[data-column="run"]');
  if (!transport || !header || !home) return;
  if (open && onPhone()) header.append(transport);
  else if (transport.parentElement === header) home.append(transport);
}
