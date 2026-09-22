/**
 * WHICH PAGE OF THE MENU A PICTURE IS OF, WHAT IS TYPED INTO IT AND WHICH BACK
 * GESTURES GOT THERE, read off three flags.
 *
 * The menu is a stack of pages in one element and only one of them is `on` at a
 * time (`apps/game/src/menu-view.ts`). Every page but the front one is reached
 * by pressing something, and what is pressed is always a button with words on
 * it — a row on a list, or one of SETTINGS' switches. So the flag is the words,
 * in the order somebody's thumb would say them:
 *
 *   --page SETTINGS                  the settings page
 *   --page "SETTINGS > CONTROLS"     the keys, which SETTINGS is the only way to
 *   --page TESTING                   the rig, which no row reaches at all
 *   --page "PLAY > NEW GAME > CREATE"  the room screen, which NEW GAME opens
 *
 * A page is not always all of its own state. A screen whose look turns on what
 * has been typed — the first meeting's press is dark until its field holds a
 * name it could keep — has two pictures and the trail can only take one of
 * them, because a trail is presses and a field is characters. So the second
 * flag is the characters:
 *
 *   --type "#helloName=DAVID"        a field, and what is in it
 *
 * And one screen is opened by no press at all — the card the phone's back
 * gesture puts over the field. That is `--back`, below.
 *
 * The labels are the page's own, so a flag that has gone stale fails by naming
 * what *is* on the page rather than by photographing the wrong one — which is
 * the whole reason the trail is words and not a `MenuPage` name. The one page
 * with no words to press is the rig: it is opened by three presses on the spore
 * over the wordmark, and `TESTING` in a trail means those presses.
 *
 * Nothing here opens a browser. The walking and the filling are
 * `menu-shot.ts`'s.
 */

/** One press on the way to the page being photographed. */
export type MenuStep =
  | { kind: "spore" }
  /** A button on whichever page is `on`, by the words on it. */
  | { kind: "press"; label: string }
  /** The phone's back gesture — see `backSteps` below. */
  | { kind: "back" };

/** The one page no button reaches — see `RIG_TAPS` in `menu-view.ts`. */
export const RIG_LABEL = "TESTING";

/**
 * **`--back` is the one screen no button opens**, and it is a flag rather than
 * a word in the trail because `BACK` is a word the menu's own rows use.
 *
 * The card that asks whether to go back to the menu or quit is opened by the
 * phone's back gesture and by nothing else (`apps/game/src/back-ask.ts`), so
 * the picture of it for the owner was taken by a throwaway Playwright script —
 * the friction `menu-shot.ts` exists to stop being paid.
 *
 * **It is repeatable, and off the front page it takes two.** A pop means one
 * step out, so the first one with the menu up closes the menu the way its own ✕
 * does; only a pop with nothing over the field asks. That rule is `back-ask.ts`'s
 * and this flag does not second-guess it — counting the presses here so the tool
 * could arrive in one would be a second copy of it, to go stale on the day the
 * rule changes. So the card is two, and both are written:
 *
 *   --back --back --screen "#backAsk.on" --element "#backAsk"
 *
 * They are walked after `--page`, which is the order that composes: a trail
 * opens a screen and the gesture is asked what it means with that screen up.
 */
export function backSteps(argv: readonly string[]): MenuStep[] {
  return argv.flatMap((a) => (a === "--back" ? [{ kind: "back" } as const] : []));
}

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

/** One field filled before the shot: what to put it in, and what goes in it. */
export type MenuFill = { selector: string; value: string };

/**
 * `--type "#helloName=DAVID"` into the fields it means. Repeatable, and kept in
 * the order it was given: a screen whose look turns on two fields is a screen
 * where the second one is typed after the first.
 *
 * Split on the *first* `=` and no other, so a value may carry as many as it
 * likes and an attribute selector may carry none: `[name=nick]` is not a way
 * to name a field here, and `#helloName` or `.field` is. That is the trade the
 * flag is worth making — every field the menu has is reachable by id, and a
 * value with an `=` in it is a name somebody will one day want to photograph.
 *
 * An argument with no `=` at all is refused by name rather than read as a
 * field with nothing to put in it — a flag that names a field and says nothing
 * is a caller who meant something, the same argument `parseTrail` makes about
 * an empty trail. An empty selector is refused for the harder reason:
 * `page.locator("")` fails inside the browser half, where the message is about
 * a selector engine rather than about the flag that was typed.
 */
export function parseTyping(values: readonly string[]): MenuFill[] {
  return values.map((value) => {
    const at = value.indexOf("=");
    if (at < 0) throw new Error(`--type ${JSON.stringify(value)}: no "=" in it, so no field named`);
    const selector = value.slice(0, at).trim();
    if (selector === "")
      throw new Error(`--type ${JSON.stringify(value)}: no field before the "="`);
    return { selector, value: value.slice(at + 1) };
  });
}

/**
 * What a `--type` that found no field says. The same shape as `noSuchButton`
 * and for the same reason: the caller cannot see the page they are standing on,
 * so the trail that got them there is named back to them.
 */
export function noSuchField(selector: string, page: string): string {
  return `--type: nothing on ${page} matches ${JSON.stringify(selector)}`;
}
