import { guideScene, type SceneId } from "@neon-spore/content";

/**
 * **What the pair actually meets, on a wave whose guide plays a rehearsal.**
 *
 * A filmed guide carries no words (`content/wave-types.ts`), so on a wave that
 * names a `scene` this note is the whole GUIDE section. It says the rehearsal's name, how many pages it is, and each page's
 * caption with the seat it is written to. A picker over the catalogue is the
 * larger version of this and wants the owner's word on whether a scene should
 * be choosable at all; what a reader needs first is to stop being told the
 * wrong thing.
 *
 * **Every page is a button, and pressing it opens the stage on that page.** The
 * owner's ask of 18 September 2026: a boss's rehearsal is eight or nine pages,
 * and reading the seventh used to mean `↺ WAVE`, briefings on, and six presses
 * of NEXT on the field. `onPage` is handed the page's index and the stage does
 * the rest (`stage.ts` `openPage`); without it the list is the read-only note
 * it was.

 */

export interface SceneNote {
  /** Say what this wave rehearses, or take the note away when it rehearses nothing. */
  render(scene: SceneId | undefined): void;
}

export function bindSceneNote(
  mount: HTMLElement | null,
  onPage?: (page: number) => void,
): SceneNote {
  if (!mount) return { render: () => {} };

  const box = document.createElement("div");
  box.className = "guide-scene";
  box.id = "guideScene";
  box.hidden = true;
  const head = document.createElement("p");
  head.className = "note";
  const pages = document.createElement("ol");
  pages.className = "guide-pages";
  box.append(head, pages);
  mount.appendChild(box);

  return {
    render(scene) {
      if (scene === undefined) {
        // Emptied as well as hidden. A hidden box still holding the last
        // wave's sentence is one `hidden = false` away from telling a reader
        // about a rehearsal on a wave that has none, which is this note's own
        // fault one wave along.
        box.hidden = true;
        head.textContent = "";
        pages.replaceChildren();
        return;
      }
      // `guideScene` throws on a name no scene answers to, which on a draft is
      // a typo in the act file rather than a reason to take the panel down.
      const found = safely(scene);
      box.hidden = false;
      if (!found) {
        head.textContent = `REHEARSAL ${scene} — no scene of that name`;
        pages.replaceChildren();
        return;
      }
      const count = found.length;
      head.textContent = `REHEARSAL ${scene} — ${count} ${count === 1 ? "page" : "pages"} of film`;
      pages.replaceChildren(
        ...found.map((step, i) => {
          const li = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.className = "guide-page";
          button.title = `Open the stage on page ${i + 1}`;
          button.textContent = `P${step.seat} · ${step.text}`;
          button.addEventListener("click", () => onPage?.(i));
          li.appendChild(button);
          return li;
        }),
      );
    },
  };
}

/** The scene's steps, or `null` when nothing answers to that name. */
function safely(scene: SceneId): { seat: 1 | 2; text: string }[] | null {
  try {
    return guideScene(scene).steps.map((s) => ({ seat: s.seat, text: s.text }));
  } catch {
    return null;
  }
}
