import { el } from "./menu-parts.js";
import { readName } from "./nickname.js";
import {
  finishEmailLink,
  linkPending,
  onSignIn,
  sendEmailLink,
  signedIn,
  signedInAs,
  signInConfigured,
  signInWithGoogle,
  signOut,
} from "./sign-in.js";

/**
 * The settings row that makes a name survive the phone.
 *
 * Under YOUR NAME, because that is what it is about: a name claimed by this
 * device alone is lost with it, and logging in is how it is not. Two ways
 * in, both from our own buttons — Google's chooser in a popup, or a link
 * sent to an address typed here — and one line saying which is standing.
 * Absent entirely on a build with no project (`sign-in-config.ts`): a button
 * that cannot do its thing is worse than no button.
 *
 * A link opened on a phone that did not ask for it needs the address again;
 * that is the one time the field is asked to finish rather than to send.
 */
export function signInRow(): HTMLElement {
  const block = el("div", "setting");
  if (!signInConfigured()) {
    block.hidden = true;
    return block;
  }
  const label = el("label", "sub", "LOG IN");
  const google = el("button", "switch", "LOG IN WITH GOOGLE");
  google.type = "button";
  const email = el("input");
  email.type = "email";
  email.autocomplete = "email";
  email.spellcheck = false;
  email.placeholder = "EMAIL";
  const send = el("button", "switch", "EMAIL ME A LINK");
  send.type = "button";
  const out = el("button", "switch", "LOG OUT");
  out.type = "button";
  const said = el("span", "s");

  const paint = (): void => {
    const on = signedIn();
    google.hidden = on;
    email.hidden = on;
    send.hidden = on;
    out.hidden = !on;
    if (on) {
      said.textContent = `Logged in as ${signedInAs()}. ${readName() || "Your name"} is yours on any phone you log in on.`;
    } else if (linkPending()) {
      send.textContent = "FINISH LOGGING IN";
      said.textContent = "Type the email the link was sent to.";
    } else {
      send.textContent = "EMAIL ME A LINK";
      said.textContent =
        "Not logged in. Log in and your name comes with you to a new phone — or back to this one.";
    }
  };

  google.addEventListener("click", () => {
    void signInWithGoogle().then((why) => {
      if (why) said.textContent = why;
    });
  });
  send.addEventListener("click", () => {
    const finish = linkPending();
    void (finish ? finishEmailLink(undefined, email.value) : sendEmailLink(email.value)).then(
      (why) => {
        if (why) said.textContent = why;
        else if (!finish)
          said.textContent = `A link is on its way to ${email.value.trim()}. Open it on this phone.`;
      },
    );
  });
  out.addEventListener("click", () => void signOut());

  paint();
  onSignIn(paint);
  block.append(label, google, email, send, out, said);
  return block;
}
