/**
 * The topbar's page doors, made to behave like tabs over the full-width pages
 * they open rather than like buttons that throw a modal over everything.
 *
 * The owner asked on 10 October 2026 for DOCUMENTATION and NOT BUILT YET to be
 * easier to get back out of: the only way out was a small ✕ CLOSE at the far
 * right edge, and the page covered the topbar that had opened it. Now, on a
 * wide screen, every page opens *under* the topbar (`director-sheet-doors.css`),
 * so the row of doors stays in reach, and this file makes that row mean
 * something while a page is open:
 *
 * - **the open page's door is lit**, the way a tab is;
 * - **pressing the lit door again goes back** to the editor;
 * - **pressing another door goes straight there**, closing this one first —
 *   at most one page is open at a time (`session.ts`), and two stacked pages
 *   would be a back button that reveals the wrong thing.
 *
 * Every page keeps its own open and close wiring, which is not the same in
 * all six (`mountSheet` for four, a hand-rolled `show` for RELEASE NOTES and
 * ORPHANS). So this never closes a page itself: it presses that page's own
 * BACK button, and whatever closing means there — clearing the URL, hushing
 * a player — runs exactly as if a person had pressed it.
 */

/** A door in the topbar, the page it opens, and that page's own BACK. */
interface Door {
  door: string;
  sheet: string;
  back: string;
}

/** Every page the topbar opens. The ids predate the pages' current names. */
export const DOORS: readonly Door[] = [
  { door: "notesOpen", sheet: "notes", back: "notesClose" },
  { door: "orphansOpen", sheet: "orphans", back: "orphansClose" },
  { door: "backlogOpen", sheet: "backlog", back: "backlogClose" },
  { door: "statesOpen", sheet: "states", back: "statesClose" },
  { door: "tuningOpen", sheet: "tuning", back: "tuningClose" },
  { door: "soundOpen", sheet: "soundboard", back: "soundClose" },
];

interface Bound {
  door: HTMLElement;
  sheet: HTMLElement;
  back: HTMLElement;
}

export function bindSheetDoors(): void {
  const bound: Bound[] = [];
  for (const d of DOORS) {
    const door = document.getElementById(d.door);
    const sheet = document.getElementById(d.sheet);
    const back = document.getElementById(d.back);
    if (door && sheet && back) bound.push({ door, sheet, back });
  }

  // Lit off the page's own class, never kept beside it: every page opens and
  // closes through its own wiring, and Escape and the URL's restore never
  // pass through here, so a flag of this file's would go stale at once.
  for (const { door, sheet } of bound) {
    const paint = (): void => {
      const open = sheet.classList.contains("on");
      door.classList.toggle("on", open);
      door.setAttribute("aria-pressed", String(open));
    };
    paint();
    new MutationObserver(paint).observe(sheet, { attributes: true, attributeFilter: ["class"] });
  }

  // Capture, on the document: this runs before the door's own listener, which
  // is what lets a press on the lit door close its page instead of opening it
  // a second time.
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const pressed = bound.find(({ door }) => target && door.contains(target));
      if (!pressed) return;
      const open = bound.find(({ sheet }) => sheet.classList.contains("on"));
      if (!open) return;
      open.back.click();
      if (open !== pressed) return;
      e.stopPropagation();
      // Stopping the click also stops the phone menu's own listener on the
      // door, the one that folds the menu away (`mobile-menu.ts`), so it is
      // folded here: a press on the lit door goes back to the editor.
      document.body.classList.remove("menu-open");
    },
    { capture: true },
  );
}
