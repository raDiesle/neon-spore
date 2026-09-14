/**
 * **Whether the person holding this is at a desk**, asked in one place.
 *
 * `pointer: fine` is the difference between a mouse and a thumb, and it is the
 * signal this app already used twice — the keyboard hint over the field
 * (`key-hint.ts`) and the splash trail (`trail.ts`) both gate on it, each with
 * its own copy of the query and its own guard against a runner with no
 * `matchMedia`. The owner asked on 14 September 2026 for a third caller: the
 * menu's CONTROLS row, which teaches keys, and which a phone should not be
 * offered at all. Three copies of a media query is three places for one of
 * them to be written `(pointer:fine)` and quietly never match, so it is one
 * function now.
 *
 * **It is a question about the device, never about the game.** Nothing here
 * may reach the simulation: two phones in a room have to agree about the
 * world, and a world that differed by what kind of pointer each player had
 * would be two different games. What it decides is what a *page* offers.
 *
 * `typeof window.matchMedia !== "function"` rather than a `try`: the runner
 * has no DOM at all, and a page that asked anyway would throw before anything
 * was drawn. Absent is answered as *not a desk*, which is the safe way round —
 * a phone offered a keyboard page reads as a bug, a desk not offered one reads
 * as a page that is not there yet.
 */
export function atADesk(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
