import { NAME_MAX } from "@neon-spore/net";
import { el } from "./menu-parts.js";
import { signInRow } from "./menu-sign-in.js";
import { hasName, nameProblem, readName, syncName, takeName } from "./nickname.js";
import { onSignIn, signInConfigured } from "./sign-in.js";

/**
 * THE FIRST THING A DEVICE IS ASKED, ONCE THE SCENE HAS PLAYED.
 *
 * *What are you called?* — and under it, optional, a way to get back a name
 * this phone has never held. The owner asked for it on 14 September 2026, and
 * what was wrong was not that either half was missing but *when* they were
 * met. A name was asked for on the room screen (`join-name.ts`), which a
 * first-timer reaches only once they are already opening a room; the sign-in
 * was a row on SETTINGS (`menu-sign-in.ts`), which is a page nobody opens on
 * the way to play. So a pair's first minute had neither, and their second
 * phone had no way to say it was the same person.
 *
 * Both are met here instead: after the intro closes, before the menu comes up,
 * on a device with no name stored. **A device that has one never sees it**, and
 * the room screen keeps its own field as the fallback for a device that got
 * past this one — a link straight into a room is still a way in that never
 * passes the menu.
 *
 * **A DOM sheet and not a canvas scene**, unlike the intro it follows: the
 * optional half is Google's popup and an email field, and those are elements.
 * It borrows the menu's own furniture — the sky, the scroll, the `.setting`
 * block — rather than growing a second house style for one screen; `menu.css`
 * says which selectors the two share.
 *
 * Nothing about *changing* a name is here. That is SETTINGS, where the rest of
 * "things about me" lives, and this screen stays one question long.
 */

/**
 * Whether the first meeting opens, given the name this device has stored.
 *
 * Pure, and separate from the reading, so the rule holds in a runner with no
 * DOM — the shape `intro.ts` and `progress.ts` both take.
 *
 * It opens only where the menu itself would have, for the intro's reason:
 * `?play=1` is the tester's door and the camera's, and a screen in front of
 * either is exactly the press neither asked for.
 */
export function opensHello(name: string, opensOnMenu: boolean): boolean {
  return opensOnMenu && name === "";
}

/**
 * Ask, then hand the screen on to `after` — or hand it on at once, which is
 * every visit but the first.
 *
 * `hold` is the same one the menu and the intro take: somebody typing their
 * name is not somebody who wants a wave arriving underneath them, and this
 * screen is the one that waits on a person rather than on a clock
 * (`run-state.ts`). Without it the field ran behind the sheet for as long as
 * they took to think of a name.
 *
 * The screen is built here and taken out of the document when it closes: it is
 * seen once per device and there is nothing to keep warm for a second showing.
 */
export function openHello(hold: (on: boolean) => void, after: () => void): void {
  if (!opensHello(readName(), true)) {
    after();
    return;
  }

  const root = el("div", "on");
  root.id = "hello";
  const scroll = el("div", "scroll");
  const inner = el("div", "inner");
  root.append(el("div", "sky"), scroll);
  scroll.append(inner);

  const block = el("div", "setting");
  const label = el("label", "sub", "YOUR NAME");
  label.htmlFor = "helloName";
  const input = el("input");
  input.id = "helloName";
  input.type = "text";
  // The room screen's field says the same in its markup: a browser that offers
  // to fill a nickname in should offer it here, where one is actually asked for.
  input.setAttribute("autocomplete", "nickname");
  input.spellcheck = false;
  input.maxLength = NAME_MAX;
  // The field's own sentence for a field with nothing in it, so the reason a
  // name is wanted at all is standing there before anybody is refused
  // anything. A registry's refusal replaces it in the same place.
  const why = el("p", "s", nameProblem(""));
  const go = el("button", "go", "THAT IS ME");
  go.type = "button";
  go.disabled = true;
  block.append(label, input, why, go);
  inner.append(el("h2", undefined, "WHAT ARE YOU CALLED?"), block);

  /** The one press on this screen, lit only by a name it could actually keep. */
  const paint = (): void => {
    go.disabled = nameProblem(input.value) !== "";
  };

  const close = (): void => {
    root.remove();
    // The chrome comes back with the screen going, and the world with it. Both
    // in `close` rather than beside it: every way off this screen is this one.
    document.body.dataset.hello = "off";
    hold(false);
    after();
  };

  const submit = async (): Promise<void> => {
    go.disabled = true;
    const said = await takeName(input.value);
    if (said !== "") {
      why.textContent = said;
      paint();
      return;
    }
    close();
  };

  input.addEventListener("input", paint);
  // One field with a keyboard up wants Enter to mean the button next to it —
  // the room screen's field says the same (`join-name.ts`).
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!go.disabled) void submit();
  });
  go.addEventListener("click", () => void submit());

  // **The optional half**, and only where there is a project to sign in to: a
  // build with none hides it and leaves the name, because a button that cannot
  // do its thing is worse than no button (`sign-in-config.ts`).
  if (signInConfigured()) {
    inner.append(el("p", "foot", "Already played? Log in to get your name back."), signInRow());
    // A sign-in is the moment the name is reconciled with the registry, and on
    // this screen the point of reconciling it is to fill the field in front of
    // them — they signed in *to be told* what they are called. The press is
    // still theirs: the name arrives in the field, not past it.
    onSignIn(() => {
      void syncName().then(() => {
        if (hasName()) input.value = readName();
        paint();
      });
    });
  }

  document.body.append(root);
  // The chrome steps aside the way it does for the intro — the ☰ is above this
  // sheet and a menu opened from it would stand in front of the one question
  // this device has been asked (`game.css`) — and the world stops behind it.
  document.body.dataset.hello = "on";
  hold(true);
  // Not focused on arrival. The keyboard would come up over the half of the
  // screen that says a name can be got back instead of typed, which is the
  // half a returning player is here for.
}
