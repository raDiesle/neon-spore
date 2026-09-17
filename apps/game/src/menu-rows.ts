import { el } from "./menu-parts.js";

/**
 * The rows an entry list on the menu is drawn as, and the one map that finds
 * a row again by its key afterwards. `menu-view.ts` builds the pages and hands
 * each list to `draw`; `menu.ts` reaches a row through `set` and `root` on the
 * `MenuDom` it is given, so nothing here knows which page a row is on.
 */

export interface MenuEntry {
  /** How `set` names it afterwards. Stable, and not the label. */
  key: string;
  label: string;
  desc: string;
  run: () => void;
}

export interface MenuRows {
  /** Draws `list` as buttons on `page`, in order, and remembers each by key. */
  draw(list: MenuEntry[], page: HTMLElement): void;
  /** Rewrites a row's text, or greys it out, by key. An unknown key is nothing. */
  set(key: string, next: { label?: string; desc?: string; on?: boolean }): void;
  /** The button a key was drawn as, for focus and for the tests. */
  root(key: string): HTMLElement | undefined;
}

export function entryRows(): MenuRows {
  // One map over all three lists: a key is a key wherever its row is drawn, so
  // `setEntry("leave", …)` reaches LEAVE ROOM without saying which page it is
  // on. No key is on two lists, and `menu-entries.ts` is where that is kept
  // true — the rig's first row is `single` because `play` is the front page's.
  // `off` is the row itself. It was the row *and* whatever stood beside it
  // while a partner's row carried a gear, and that came off on 15 September
  // 2026 with the rest of the pair tempo — a game's tempo is settled once, on
  // the room screen (`menu-entries.ts`).
  const entries = new Map<
    string,
    { root: HTMLElement; label: HTMLElement; desc: HTMLElement; off: HTMLElement }
  >();
  const draw = (list: MenuEntry[], page: HTMLElement): void => {
    list.forEach((entry, i) => {
      const button = el("button", "entry");
      button.type = "button";
      button.style.setProperty("--i", String(i));
      const mark = el("span", "mark", "▸");
      // Decoration. Without this it is read out in front of the entry's name.
      mark.ariaHidden = "true";
      const label = el("span", "label", entry.label);
      const desc = el("span", "desc", entry.desc);
      button.append(mark, label, desc);
      button.addEventListener("click", entry.run);
      page.append(button);
      entries.set(entry.key, { root: button, label, desc, off: button });
    });
  };
  const set = (key: string, next: { label?: string; desc?: string; on?: boolean }): void => {
    const found = entries.get(key);
    if (!found) return;
    if (next.label !== undefined) found.label.textContent = next.label;
    if (next.desc !== undefined) found.desc.textContent = next.desc;
    if (next.on !== undefined) found.off.classList.toggle("off", !next.on);
  };
  const root = (key: string): HTMLElement | undefined => entries.get(key)?.root;
  return { draw, set, root };
}
