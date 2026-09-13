import { el } from "./menu-parts.js";
import { NAME_EVENT, readName, syncName } from "./nickname.js";
import { onSignIn, signedIn, signInConfigured } from "./sign-in.js";

/**
 * The line at the top of the PLAY page saying who this phone is.
 *
 * The owner asked for "logged in as <nickname>" there, on 13 September 2026:
 * PLAY is where the two of you meet, and the first thing to know before
 * reading a code out is what the other phone is going to call you. Three
 * states, one line each — a name that is signed in, a name that is not
 * (which is a name a lost phone loses, said here so SETTINGS is where they
 * look), and no name yet, which draws nothing: the room screen asks.
 *
 * It repaints itself when the name or the sign-in changes rather than being
 * told to, and a sign-in is also the moment the name is reconciled with the
 * registry (`syncName`): a new phone is told its name here, before the page
 * is read.
 */
export function whoLine(): HTMLElement {
  const line = el("p", "who");
  const paint = (): void => {
    const name = readName();
    line.hidden = name === "";
    if (name === "") return;
    if (!signInConfigured()) line.textContent = `YOU ARE ${name}`;
    else if (signedIn()) line.textContent = `LOGGED IN AS ${name}`;
    else
      line.textContent = `${name} — NOT LOGGED IN, so a lost phone loses the name. See SETTINGS.`;
  };
  paint();
  document.addEventListener(NAME_EVENT, paint);
  onSignIn(() => {
    paint();
    void syncName().then(paint);
  });
  return line;
}
