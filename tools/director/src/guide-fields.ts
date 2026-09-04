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
 * **Shaped for what comes next, and the first of it has arrived.** A guide is
 * an object with named parts precisely so a picture or an animation can turn
 * up as another key (`packages/content/src/wave-types.ts`), and `scene` is
 * that key: the name of the rehearsal the guide plays above its words. It has
 * no control here yet — a scene is chosen by watching it, and the page that
 * would let somebody do that is not built — so what this file owes it is that
 * editing the prose does not throw it away. See `readBack`.
 */

export interface GuideFields {
  /** Repopulate the three fields for the wave now on the stage. */
  render(wave: Wave | undefined): void;
  /** Called with the wave's new guide, or `undefined` when all three are blank. */
  onChange(handler: (guide: WaveGuide | undefined) => void): void;
}

const PARTS = [
  ["both", "Player 1 & Player 2"],
  ["p1", "Player 1"],
  ["p2", "Player 2"],
] as const;

/**
 * A textarea that grows to fit what is typed into it: no scrollbar inside the
 * field, no corner to drag. There are four textareas in this panel — this one
 * plus SENTENCE, bound the same way from `rail.ts` — and the owner asked for
 * the behaviour in general, not field by field, so it lives here once and
 * every caller gets it by construction.
 */
export function autoGrowTextarea(el: HTMLTextAreaElement): void {
  const fit = (): void => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  el.addEventListener("input", fit);
  fit();
}

/**
 * Setting `.value` in JavaScript fires no `input` event, so a field repainted
 * from a newly selected wave would keep whatever height its *previous* wave's
 * text left it at. Every programmatic write goes through this instead of a
 * bare assignment.
 */
export function setGrownValue(el: HTMLTextAreaElement, value: string): void {
  el.value = value;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/**
 * Built and inserted into `#guideFields` rather than declared field by field
 * in `index.html`: three labels and three textareas that always move together
 * are one thing, and the markup only has to say where it goes.
 */
export function bindGuideFields(mount: HTMLElement | null): GuideFields {
  const fields = new Map<keyof WaveGuide, HTMLTextAreaElement>();
  const listeners: ((guide: WaveGuide | undefined) => void)[] = [];
  let addBtn: HTMLButtonElement | null = null;
  let fieldsWrap: HTMLElement | null = null;
  /** The scene the wave on the stage names, held so `readBack` can give it back. */
  let scene: WaveGuide["scene"];

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
    // The rehearsal the guide names is carried through untouched. There is no
    // control for it yet — a scene is chosen by looking at it, and the page
    // that would let somebody do that is not built — but a guide read back
    // *without* it would silently re-author the wave the first time anybody
    // corrected a typo, which is the failure `serializeEntry` next door
    // already learned once with `wears`.
    return scene === undefined ? { both, p1, p2 } : { both, p1, p2, scene };
  };

  if (mount) {
    const head = document.createElement("h2");
    head.textContent = "GUIDE";
    mount.appendChild(head);

    // Shown for a wave that carries no guide yet, in place of three empty
    // boxes. Pressing it only reveals the fields — it writes nothing to the
    // wave, so a click that is never followed by typing leaves no trace: the
    // three fields stay blank, `readBack` stays `undefined`, and the wave
    // never carries a guide it does not want
    // (`packages/content/test/waves.test.ts`).
    addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.id = "guideAdd";
    addBtn.textContent = "ADD GUIDE";
    addBtn.addEventListener("click", () => {
      if (addBtn) addBtn.hidden = true;
      if (fieldsWrap) fieldsWrap.hidden = false;
    });
    mount.appendChild(addBtn);

    fieldsWrap = document.createElement("div");
    mount.appendChild(fieldsWrap);

    for (const [key, label] of PARTS) {
      const l = document.createElement("label");
      l.className = "field";
      l.setAttribute("for", `fGuide-${key}`);
      l.textContent = label;
      const field = document.createElement("textarea");
      field.id = `fGuide-${key}`;
      field.rows = 2;
      autoGrowTextarea(field);
      field.addEventListener("input", () => {
        const guide = readBack();
        for (const listen of listeners) listen(guide);
      });
      fields.set(key, field);
      fieldsWrap.append(l, field);
    }
  }

  return {
    render(wave) {
      const hasGuide = Boolean(wave?.guide);
      scene = wave?.guide?.scene;
      // Reset to the button every time a different wave is selected — only a
      // wave that already carries a guide opens straight on the fields. The
      // button click above is the only other way the fields show, and it
      // only affects the wave on the stage at the time.
      if (addBtn) addBtn.hidden = !wave || hasGuide;
      if (fieldsWrap) fieldsWrap.hidden = !hasGuide;
      for (const [key] of PARTS) {
        const field = fields.get(key);
        if (field) setGrownValue(field, wave?.guide?.[key] ?? "");
      }
    },
    onChange(handler) {
      listeners.push(handler);
    },
  };
}
