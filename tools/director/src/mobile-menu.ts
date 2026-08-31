/**
 * On a phone the director opens on a menu, not on a wave. Every reachable
 * thing — the three views (WAVE, GAME, MAP) and the five pages the header has
 * always opened (⚑ TO CHECK, ☠ ORPHANS, ◇ NOT BUILT YET, ▣ GAME MECHANICS,
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
 */

const VIEWS = ["wave", "game", "map"] as const;
type MobileView = (typeof VIEWS)[number];
const isMobileView = (v: string | null): v is MobileView =>
  v !== null && (VIEWS as readonly string[]).includes(v);

export function initMobileMenu(search: string = location.search): void {
  const main = document.querySelector("main");
  const menuToggle = document.getElementById("menuToggle");
  const viewButtons = document.querySelectorAll<HTMLButtonElement>("header .menu-item[data-view]");
  const menuItems = document.querySelectorAll<HTMLButtonElement>("header .menu-item");
  if (!main || !menuToggle) return;

  const applyView = (v: MobileView): void => {
    main.setAttribute("data-view", v);
    for (const b of viewButtons) b.classList.toggle("on", b.dataset.view === v);
  };

  const forced = new URLSearchParams(search).get("view");
  const stored = localStorage.getItem("neon-spore-director-view");
  applyView(isMobileView(forced) ? forced : isMobileView(stored) ? stored : "wave");

  for (const b of viewButtons)
    b.addEventListener("click", () => {
      const v = b.dataset.view as MobileView;
      applyView(v);
      localStorage.setItem("neon-spore-director-view", v);
    });

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

  // `?view=` is a one-load override for a session driving the page with no
  // mouse (mirrors columns.ts's `?closed=`) — it jumps straight past the
  // menu. Otherwise the phone always opens on the menu, even on a repeat
  // visit: that is the point being asked for, not a default to remember.
  if (matchMedia("(max-width: 700px)").matches && !isMobileView(forced)) {
    document.body.classList.add("menu-open");
  }
}
