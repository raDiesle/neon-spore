import type { Wave, WaveGuide, WordedGuide } from "@neon-spore/content";
import { bindSceneNote, type SceneNote } from "./guide-scene-note.js";

/**
 * The GUIDE section `rail.ts` shows directly under NAME: what a wave opens on,
 * edited where the wave is edited.
 *
 * **A film or words, and the panel shows the one the wave has.** The owner,
 * 25 September 2026: a wave is either a plain wave that shows its name, or a
 * guide that explains in the game, step by step — *not both*
 * (`packages/content/src/wave-types.ts`). So:
 *
 * - a wave whose guide names a `scene` shows the film's pages, each a button
 *   that opens the stage there (`guide-scene-note.ts`), and no text fields —
 *   there are no words behind a film to edit any more;
 * - a wave whose guide is still words shows its three fields, labelled with
 *   the blocks the game draws them under. Every one of those is a film owed,
 *   and `docs/queue.md` has an entry for each;
 * - a wave with no guide shows nothing, and there is no ADD GUIDE any more: a
 *   new guide is a rehearsal, written in `packages/content/src/scenes/`
 *   (`.claude/skills/new-tutorial`), not three paragraphs typed here.
 *
 * Its own file rather than a slab inside `rail.ts` because that file is
 * already near the line limit, and this piece — build the fields, read them
 * back as a guide — is a whole small thing on its own.
 */

export interface GuideFields {
  /** Repopulate the section for the wave now on the stage. */
  render(wave: Wave | undefined): void;
  /** Called with the wave's new guide when one of its words is edited. */
  onChange(handler: (guide: WaveGuide | undefined) => void): void;
}

/** The three blocks, by the heading the game's prose page draws over each. */
const PARTS = [
  ["both", "BOTH OF YOU"],
  ["p1", "PLAYER 1"],
  ["p2", "PLAYER 2"],
] as const;

/**
 * A textarea that grows to fit what is typed into it: no scrollbar inside the
 * field, no corner to drag. The owner asked for the behaviour in general, not
 * field by field, so it lives here once and every caller gets it by
 * construction.
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
 * in `index.html`: a heading, a film note and three fields that always move
 * together are one thing, and the markup only has to say where it goes.
 */
export function bindGuideFields(
  mount: HTMLElement | null,
  onPage?: (page: number) => void,
): GuideFields {
  const fields = new Map<keyof WordedGuide, HTMLTextAreaElement>();
  const listeners: ((guide: WaveGuide | undefined) => void)[] = [];
  let heading: HTMLElement | null = null;
  let fieldsWrap: HTMLElement | null = null;
  let sceneNote: SceneNote = { render: () => {} };

  /**
   * All three or none. A guide with one half written is half an instruction
   * on a screen, which is exactly the failure the split exists to prevent — so
   * a partly filled section still produces a guide (the author is
   * mid-sentence) and an entirely empty one produces nothing at all.
   */
  const readBack = (): WaveGuide | undefined => {
    const both = fields.get("both")?.value ?? "";
    const p1 = fields.get("p1")?.value ?? "";
    const p2 = fields.get("p2")?.value ?? "";
    if (!both && !p1 && !p2) return undefined;
    return { both, p1, p2 };
  };

  if (mount) {
    heading = document.createElement("h2");
    heading.textContent = "GUIDE";
    mount.appendChild(heading);

    sceneNote = bindSceneNote(mount, onPage);

    fieldsWrap = document.createElement("div");
    const owed = document.createElement("p");
    owed.className = "note";
    owed.textContent = "Words, drawn until this wave has a film of its own.";
    fieldsWrap.appendChild(owed);
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
      const guide = wave?.guide;
      const scene = guide?.scene;
      const words = guide !== undefined && scene === undefined ? guide : undefined;
      if (heading) heading.hidden = !guide;
      if (fieldsWrap) fieldsWrap.hidden = !words;
      sceneNote.render(scene);
      for (const [key] of PARTS) {
        const field = fields.get(key);
        if (field) setGrownValue(field, words?.[key] ?? "");
      }
    },
    onChange(handler) {
      listeners.push(handler);
    },
  };
}
