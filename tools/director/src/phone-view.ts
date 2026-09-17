/**
 * WHICH OF THE THREE VIEWS THE PHONE IS SHOWING, AS ONE OWNER.
 *
 * Below 700px the director is three views — WAVE, GAME, MAP — and switching
 * between them was a closure inside `initMobileMenu`, reachable only from the
 * header's own buttons. That was enough while the menu was the only way to
 * move, and it stopped being enough the moment a row in the wave list needed
 * to open a wave *in* a view (`rail-open.ts`): the owner, 17 September 2026,
 * asking to reach a wave's details or its map directly from the list rather
 * than through the menu.
 *
 * So the switch lives here, with the two things that have to travel with it —
 * the header buttons' own lit state, and the remembered view — and the menu
 * calls it like any other caller.
 */

export const PHONE_VIEWS = ["wave", "game", "map"] as const;
export type PhoneView = (typeof PHONE_VIEWS)[number];

const REMEMBERED = "neon-spore-director-view";

export function isPhoneView(v: string | null | undefined): v is PhoneView {
  return v !== null && v !== undefined && (PHONE_VIEWS as readonly string[]).includes(v);
}

/** Whether the screen is narrow enough for the views to be views at all. On a
 * desktop all four columns are on screen and there is nothing to switch. */
export function onPhone(): boolean {
  return matchMedia("(max-width: 700px)").matches;
}

/** The view last shown, or nothing if this device has not chosen one. */
export function rememberedView(): PhoneView | null {
  const stored = localStorage.getItem(REMEMBERED);
  return isPhoneView(stored) ? stored : null;
}

/**
 * Show a view. `remember` is false for the one-load `?view=` override, which
 * is a session's way past the menu rather than a choice to keep.
 *
 * The menu is closed as a matter of course: every way of choosing a view is
 * either the menu itself or something with the menu shut already, and a view
 * shown under an open menu is a view nobody can see.
 */
export function showPhoneView(v: PhoneView, remember = true): void {
  const main = document.querySelector("main");
  if (main) main.setAttribute("data-view", v);
  for (const b of document.querySelectorAll<HTMLButtonElement>("header .menu-item[data-view]"))
    b.classList.toggle("on", b.dataset.view === v);
  if (remember) localStorage.setItem(REMEMBERED, v);
  document.body.classList.remove("menu-open");
}
