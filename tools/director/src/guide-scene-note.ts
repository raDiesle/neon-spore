import { guideScene, type SceneId } from "@neon-spore/content";

/**
 * **What the pair actually meets, on a wave whose guide plays a rehearsal.**
 *
 * The three GUIDE textareas are the whole of the panel, and on the sixty-odd
 * waves that name a `scene` they are the wrong half of it: a guide with a
 * rehearsal plays the film and never draws the words (`render/briefing.ts`
 * returns as soon as a scene is up), so the panel showed prose nobody reads
 * and said nothing at all about the pages they do. FIRST STEP is the plainest
 * case — three paragraphs written, and what opens is four pages of film.
 *
 * So this says it: the rehearsal's name, how many pages it is, and each page's
 * caption with the seat it is written to. Read-only on purpose. A picker over
 * the catalogue is the larger version of this and wants the owner's word on
 * whether a scene should be choosable at all; what a reader needs first is to
 * stop being told the wrong thing.
 *
 * **The words are dimmed and not disabled.** They are unread by the game and
 * still required by `packages/content/test/waves.test.ts`, which holds that a
 * wave carrying a guide writes all three halves — so they are not dead text an
 * author may leave wrong, and a field nobody can fix is worse than a field
 * nobody reads.
 */

export interface SceneNote {
  /** Say what this wave rehearses, or take the note away when it rehearses nothing. */
  render(scene: SceneId | undefined): void;
}

export function bindSceneNote(mount: HTMLElement | null): SceneNote {
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
      head.textContent = `REHEARSAL ${scene} — ${count} ${count === 1 ? "page" : "pages"} of film, played instead of the words below`;
      pages.replaceChildren(
        ...found.map((step) => {
          const li = document.createElement("li");
          li.textContent = `P${step.seat} · ${step.text}`;
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
