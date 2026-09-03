import { hasName, nameProblem, readName, writeName } from "./nickname.js";

/**
 * "What are you called?", asked once, on the room screen.
 *
 * The other phone has to be able to say who is in the other seat — that is the
 * whole of why a name is asked for — so this screen does not continue without
 * one. Once it is set it is shown rather than asked for again; *changing* it
 * belongs on the settings page, where the rest of "things about me" lives,
 * which keeps this screen down to asking a first-timer.
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
  const sheet = document.getElementById("joinSheet");

  const asking = (): boolean => !hasName();

  const paint = (): void => {
    const wanted = asking();
    if (block) block.hidden = !wanted;
    // Everything past the name goes out of reach until there is one, so nobody
    // ends up halfway into a room under no name at all.
    sheet?.classList.toggle("unnamed", wanted);
    if (input && !wanted && input.value === "") input.value = readName();
  };

  const submit = (): void => {
    const typed = input?.value ?? "";
    if (writeName(typed)) {
      if (why) why.textContent = "";
      paint();
      onNamed();
      return;
    }
    // Said rather than silently refused: a button that does nothing is a
    // button a player presses harder.
    if (why) why.textContent = nameProblem(typed);
  };

  document.getElementById("joinNameGo")?.addEventListener("click", submit);
  // A name is one field, and one field with a keyboard up wants Enter to mean
  // the button next to it.
  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submit();
  });

  paint();
  return { asking, paint };
}
