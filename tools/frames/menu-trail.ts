/**
 * WHICH PAGE OF THE MENU A PICTURE IS OF, read off one flag.
 *
 * The menu is a stack of pages in one element and only one of them is `on` at a
 * time (`apps/game/src/menu-view.ts`). Every page but the front one is reached
 * by pressing something, and what is pressed is always a button with words on
 * it — a row on a list, or one of SETTINGS' switches. So the flag is the words,
 * in the order somebody's thumb would say them:
 *
 *   --page SETTINGS                  the settings page
 *   --page "SETTINGS > CONTROLS"     the keys, which SETTINGS is the only way to
 *   --page "PLAY > DIFFICULTY"       the three levels, behind PLAY's own row
 *   --page TESTING                   the rig, which no row reaches at all
 *
 * The labels are the page's own, so a flag that has gone stale fails by naming
 * what *is* on the page rather than by photographing the wrong one — which is
 * the whole reason the trail is words and not a `MenuPage` name. The one page
 * with no words to press is the rig: it is opened by three presses on the spore
 * over the wordmark, and `TESTING` in a trail means those presses.
 *
 * Nothing here opens a browser. The walking is `menu-shot.ts`'s.
 */

/** One press on the way to the page being photographed. */
export type MenuStep =
  | { kind: "spore" }
  /** A button on whichever page is `on`, by the words on it. */
  | { kind: "press"; label: string };

/** The one page no button reaches — see `RIG_TAPS` in `menu-view.ts`. */
export const RIG_LABEL = "TESTING";

/**
 * `--page` into the presses it means. An absent flag is the front page, which
 * is no presses at all rather than an error: a picture of the menu with no
 * further word said is the commonest one anybody wants.
 */
export function parseTrail(value: string | undefined): MenuStep[] {
  if (value === undefined) return [];
  const labels = value
    .split(">")
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (labels.length === 0) throw new Error(`--page ${JSON.stringify(value)}: no page named`);
  return labels.map((label) =>
    label.toUpperCase() === RIG_LABEL ? { kind: "spore" } : { kind: "press", label },
  );
}

/**
 * What a step that found nothing says.
 *
 * The labels actually on the page go in the message, because the one thing the
 * caller cannot see from here is the page they are standing on — and a shot
 * that fails by saying *no button reads CONTROLS; this page offers WHAT THIS
 * IS, CONTROLS ON …* is a shot somebody fixes in one go rather than by opening
 * a browser of their own.
 */
export function noSuchButton(label: string, offered: readonly string[]): string {
  const said = offered.length === 0 ? "nothing on it can be pressed" : offered.join(", ");
  return `--page: no button on the open page reads ${JSON.stringify(label)} — ${said}`;
}
