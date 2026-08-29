import type { Wave, WaveGuide } from "@neon-spore/content";

/**
 * The GUIDE section `rail.ts` shows directly under SENTENCE: the three lines a
 * wave's guide is made of, edited where the wave is edited.
 *
 * This replaces a dropdown that picked which *catalogue card* a wave raised.
 * There is no catalogue any more — the owner asked for the words themselves to
 * live in the wave, under `sentence`, in a section called Guide — so what used
 * to be a choice among prewritten subjects is now three fields of prose.
 *
 * Its own file rather than a slab inside `rail.ts` because that file is
 * already at the line limit, and this piece — build the fields, read them back
 * as a `WaveGuide` or as nothing — is a whole small thing on its own.
 *
 * **Shaped for what comes next.** A guide is an object with named parts
 * precisely so a picture or an animation can arrive as another key
 * (`packages/content/src/wave-types.ts`). When it does, it gets its own
 * control here beside these three and `readBack` grows one line; no wave and
 * no other panel has to move.
 */

export interface GuideFields {
  /** Repopulate the three fields for the wave now on the stage. */
  render(wave: Wave | undefined): void;
  /** Called with the wave's new guide, or `undefined` when all three are blank. */
  onChange(handler: (guide: WaveGuide | undefined) => void): void;
}

const PARTS = [
  ["both", "BOTH SCREENS — what the thing is, never the whole instruction"],
  ["p1", "PLAYER ONE — the cannon, the shield's trigger, the maw"],
  ["p2", "PLAYER TWO — the shield itself, and the two colours"],
] as const;

/**
 * Built and inserted into `#guideFields` rather than declared field by field
 * in `index.html`: three labels and three textareas that always move together
 * are one thing, and the markup only has to say where it goes.
 */
export function bindGuideFields(mount: HTMLElement | null): GuideFields {
  const fields = new Map<keyof WaveGuide, HTMLTextAreaElement>();
  const listeners: ((guide: WaveGuide | undefined) => void)[] = [];

  /**
   * All three or none. A guide with one half written is half an instruction on
   * a screen, which is exactly the failure the split exists to prevent — so a
   * partly filled section still produces a guide (the author is mid-sentence)
   * and an entirely empty one produces nothing at all.
   */
  const readBack = (): WaveGuide | undefined => {
    const both = fields.get("both")?.value ?? "";
    const p1 = fields.get("p1")?.value ?? "";
    const p2 = fields.get("p2")?.value ?? "";
    if (!both && !p1 && !p2) return undefined;
    return { both, p1, p2 };
  };

  if (mount) {
    const head = document.createElement("h2");
    head.textContent = "GUIDE";
    mount.appendChild(head);

    const why = document.createElement("p");
    why.className = "note";
    why.textContent =
      "What the pair is told after this wave's introduction and before it starts. " +
      "Leave all three blank for a wave that introduces nothing new — padding a " +
      "wave with a guide is the same failure as padding it with entries.";
    mount.appendChild(why);

    for (const [key, label] of PARTS) {
      const l = document.createElement("label");
      l.className = "field";
      l.setAttribute("for", `fGuide-${key}`);
      l.textContent = label;
      const field = document.createElement("textarea");
      field.id = `fGuide-${key}`;
      field.rows = 2;
      field.addEventListener("input", () => {
        const guide = readBack();
        for (const listen of listeners) listen(guide);
      });
      fields.set(key, field);
      mount.append(l, field);
    }
  }

  return {
    render(wave) {
      for (const [key] of PARTS) {
        const field = fields.get(key);
        if (field) field.value = wave?.guide?.[key] ?? "";
      }
    },
    onChange(handler) {
      listeners.push(handler);
    },
  };
}
