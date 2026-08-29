import { KEY_BINDINGS, type KeyBinding, type KeySeat } from "./keys.js";

/**
 * The keybindings, shown rather than remembered — "for the time being," in
 * the owner's own words, so a modal listing them rather than a settings page.
 *
 * It renders `KEY_BINDINGS` from `keys.ts`, the one place the director's key
 * map lives, rather than typing the list a second time here: a hand-kept copy
 * in this file would go stale the moment a key is added to the switch in
 * `keys.ts` and not to a markup list beside it.
 *
 * Grouped by seat because the owner's confusion was a seat confusion — "the
 * warden … it says pull … nothing happens" was them not knowing which hand a
 * gesture spoke for, and a list that says *player 2 — grab the creature
 * nearest the hull* answers that the moment it opens.
 */
export function bindKeyHelp(): void {
  const button = document.getElementById("keyHelpOpen");
  const modal = document.getElementById("keyHelpModal");
  const body = document.getElementById("keyHelpBody");
  if (!button || !modal || !body) return;

  body.innerHTML = renderGroups(KEY_BINDINGS);

  const close = (): void => modal.classList.remove("on");
  button.addEventListener("click", () => modal.classList.add("on"));
  modal.querySelector("[data-close]")?.addEventListener("click", close);
  // Click on the backdrop, not on the sheet it holds, is the way out — the
  // same contract every full-screen sheet in this app already uses.
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
}

const SEAT_LABEL: Record<KeySeat, string> = {
  1: "PLAYER 1",
  2: "PLAYER 2",
  both: "BOTH — ONE KEY, ONE PRESS",
};

/** In this order: each seat's own keys first, the shared ones last. */
const SEAT_ORDER: readonly KeySeat[] = [1, 2, "both"];

function renderGroups(bindings: readonly KeyBinding[]): string {
  return SEAT_ORDER.map((seat) => renderGroup(seat, bindings)).join("");
}

function renderGroup(seat: KeySeat, bindings: readonly KeyBinding[]): string {
  const rows = bindings.filter((b) => b.seat === seat);
  if (rows.length === 0) return "";
  const items = rows.map((b) => `<li><span class="key">${b.key}</span> ${b.does}</li>`).join("");
  return `<section><h3>${SEAT_LABEL[seat]}</h3><ul>${items}</ul></section>`;
}
