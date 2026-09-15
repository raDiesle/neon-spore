import { hasName, readName, takeName } from "./nickname.js";

/**
 * "What are you called?", asked once, on the room screen.
 *
 * The other phone has to be able to say who is in the other seat — that is the
 * whole of why a name is asked for — so this screen does not continue without
 * one. Once it is set it is shown rather than asked for again; *changing* it
 * belongs on the settings page, where the rest of "things about me" lives,
 * which keeps this screen down to asking a first-timer.
 *
 * A name is also **unique**, which needs a server (`apps/server/src/names.ts`)
 * — so the field talks to the registry before it stores anything, and a name
 * somebody else holds is refused here rather than discovered in a room. A
 * name that is already yours, on a phone that does not know it, comes back
 * by signing in on the settings page (`sign-in.ts`) — not here: this screen
 * asks a first-timer one thing.
 *
 * **It is the fallback now, not the front door.** Since 14 September 2026 a
 * device with no name is asked for one right after the intro, with the sign-in
 * under it (`hello.ts`); what still reaches this field is a device that never
 * passed the menu — a link straight into a room — and a device whose stored
 * name has gone. Both halves claim through the same `takeName`, so a name
 * means one thing wherever it was given.
 *
 * Its own file because `join.ts` is the room and this is not: the room screen
 * reached its 250-line ceiling the day this arrived, and the seam was already
 * obvious — nothing here knows what a room is.
 */
export interface NameField {
  /** Whether the screen is still waiting for a name. */
  asking: () => boolean;
  /** Redraw. Cheap, so it is redone rather than tracked. */
  paint: () => void;
}

export function bindNameField(onNamed: () => void): NameField {
  const block = document.getElementById("joinName");
  const input = document.getElementById("joinNameInput") as HTMLInputElement | null;
  const why = document.getElementById("joinNameWhy");
  const keep = document.getElementById("joinNameKeep");
  const button = document.getElementById("joinNameGo") as HTMLButtonElement | null;

  const asking = (): boolean => !hasName();

  const paint = (): void => {
    const wanted = asking();
    // Everything past the name is out of reach until there is one, so nobody
    // ends up halfway into a room under no name at all. That is the step rule's
    // job now (`join-steps.ts`) and not a class over the whole sheet: this only
    // takes its own field off the page once the name is given.
    if (block) block.hidden = !wanted;
    if (input && !wanted && input.value === "") input.value = readName();
  };

  const submit = async (): Promise<void> => {
    if (button) button.disabled = true;
    try {
      const said = await takeName(input?.value ?? "");
      if (said !== "") {
        // Said rather than silently refused: a button that does nothing is a
        // button a player presses harder. `takeName` carries the registry's
        // own sentence, because a name that is taken and a name that is
        // somebody else's must read the same — otherwise this field is a way
        // to ask which names exist.
        if (why) why.textContent = said;
        return;
      }
      if (why) why.textContent = "";
      // Said once, here, where the name was just given: what keeps it past
      // this phone is a sign-in, and where that is. A device that met the
      // first meeting was offered one there instead (`hello.ts`), and this
      // screen is what a device that skipped it sees.
      if (keep) {
        keep.textContent = `${readName()} is yours. Log in on SETTINGS to keep it if this phone is lost.`;
      }
      paint();
      onNamed();
    } finally {
      if (button) button.disabled = false;
    }
  };

  document.getElementById("joinNameGo")?.addEventListener("click", () => void submit());
  // A name is one field, and one field with a keyboard up wants Enter to mean
  // the button next to it.
  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void submit();
  });

  paint();
  return { asking, paint };
}
