import { claimName, hasName, readName, writeName } from "./nickname.js";

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
 * device that has lost its token proves the name is theirs with the recovery
 * code minted when they first claimed it; that is the second field, and it is
 * needed only then.
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
  const code = document.getElementById("joinCodeInput") as HTMLInputElement | null;
  const button = document.getElementById("joinNameGo") as HTMLButtonElement | null;
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

  const submit = async (): Promise<void> => {
    const typed = input?.value ?? "";
    if (button) button.disabled = true;
    try {
      const answer = await claimName(typed, code?.value ?? "");
      if (!answer.ok) {
        // Said rather than silently refused: a button that does nothing is a
        // button a player presses harder. The registry's own sentence, because
        // a name that is taken and a code that is wrong must read the same —
        // otherwise this field is a way to ask which names exist.
        if (why) why.textContent = answer.why ?? "That name cannot be used.";
        return;
      }
      writeName(answer.name ?? typed);
      if (why) why.textContent = "";
      // Shown once and only once, because it is only minted once. A player who
      // does not write it down has not lost their name — they have lost the
      // way to move it to another device.
      if (keep && answer.code) {
        keep.textContent = `${answer.name} is yours. Write down ${answer.code} — it is how you take that name to another phone.`;
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
