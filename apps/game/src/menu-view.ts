import type { MechanicId } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import type { DemoRow } from "./demo-menu.js";
import { buildDemos, buildKeys, buildWaves } from "./menu-pages.js";
import { el, type MenuPage, sporeSvg } from "./menu-parts.js";

/**
 * The menu's markup, built here rather than written into index.html.
 *
 * It is the front door now: a plain address lands here, and the field is one
 * press away rather than the other way round. So the root page has to answer
 * three questions at a glance — what happens if I press the top button, who am
 * I at this table, and is the other phone here — and the seat is a card with
 * the job written on it rather than two letters in a row of three.
 */

export interface MenuEntry {
  /** How `setEntry` names it afterwards. Stable, and not the label. */
  key: string;
  label: string;
  desc: string;
  run: () => void;
}

export interface MenuHandlers {
  entries: MenuEntry[];
  /** One row per mechanic — see `demo-menu.ts`. */
  demos: DemoRow[];
  /** A wave was picked out of the list. */
  onWave: (wave: number) => void;
  /** A demonstration was picked out of the list. */
  onDemo: (id: MechanicId) => void;
  onSeat: (role: ViewRole) => void;
}

export interface MenuDom {
  root: HTMLElement;
  show: (page: MenuPage) => void;
  /** The seat is the view switch's, so the menu is told rather than deciding. */
  paintSeat: (role: ViewRole) => void;
  /**
   * A room hands the seat out, and a device showing the other player's band is
   * a device whose touches go nowhere — so while there is one, the cards say
   * which seat this is instead of offering a choice that cannot be taken.
   */
  lockSeats: (locked: boolean, why: string) => void;
  /** Re-label an entry, or take it off the page. Named by `key`. */
  setEntry: (key: string, next: { label?: string; desc?: string; on?: boolean }) => void;
  /** The spore breathes only while the menu is up. */
  animate: (on: boolean) => void;
}

const SEATS: { role: ViewRole; tag: string; name: string; what: string }[] = [
  {
    role: "p1",
    tag: "P1",
    name: "PILOT",
    what: "Slides the cannon, opens the maw, triggers the guard.",
  },
  { role: "p2", tag: "P2", name: "NAVIGATOR", what: "Slides the shield, fires red and cyan." },
  {
    role: "test",
    tag: "BOTH",
    name: "ONE SCREEN",
    what: "Both bands and the test rig, for one person at a desk.",
  },
];

export function buildMenu(h: MenuHandlers): MenuDom {
  const root = el("div");
  root.id = "menu";
  const scroll = el("div", "scroll");
  const inner = el("div", "inner");
  root.append(el("div", "sky"), scroll);
  scroll.append(inner);

  const spore = sporeSvg();
  const title = el("h1", undefined, "NEON SPORE");
  title.dataset.text = "NEON SPORE";
  inner.append(
    spore.svg,
    title,
    el("p", "tag", "TWO PEOPLE · TWO DEVICES · TALKING IS THE CONTROL SCHEME"),
  );

  const rootPage = el("div", "page on");
  const pages: Record<MenuPage, HTMLElement> = {
    root: rootPage,
    waves: buildWaves((p) => show(p), h.onWave),
    demos: buildDemos((p) => show(p), h.demos, h.onDemo),
    keys: buildKeys((p) => show(p)),
  };
  const show = (page: MenuPage): void => {
    for (const [name, node] of Object.entries(pages)) node.classList.toggle("on", name === page);
    scroll.scrollTop = 0;
  };

  const entries = new Map<string, { root: HTMLElement; label: HTMLElement; desc: HTMLElement }>();
  h.entries.forEach((entry, i) => {
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
    rootPage.append(button);
    entries.set(entry.key, { root: button, label, desc });
  });

  const { seatBlock, paintSeat, lockSeats } = buildSeats(h.onSeat);
  rootPage.append(seatBlock);

  inner.append(pages.root, pages.waves, pages.demos, pages.keys);
  document.body.append(root);

  return {
    root,
    show,
    paintSeat,
    lockSeats,
    setEntry: (key, next) => {
      const found = entries.get(key);
      if (!found) return;
      if (next.label !== undefined) found.label.textContent = next.label;
      if (next.desc !== undefined) found.desc.textContent = next.desc;
      if (next.on !== undefined) found.root.classList.toggle("off", !next.on);
    },
    animate: spore.animate,
  };
}

/**
 * The seat, as three cards with the job written on each.
 *
 * It was a row of three buttons labelled P1, P2 and TEST, which is the shortest
 * thing that could be written and says nothing at all to the person holding the
 * phone: the whole point of two devices is that the two of you do different
 * jobs, and the choice is which job. So the card carries the name of the job
 * and the sentence that describes it, and the letters stay only as the tag the
 * rest of the game already uses.
 */
function buildSeats(onSeat: (role: ViewRole) => void): {
  seatBlock: HTMLElement;
  paintSeat: (role: ViewRole) => void;
  lockSeats: (locked: boolean, why: string) => void;
} {
  const block = el("div", "seats");
  block.append(el("h2", undefined, "SEAT"));
  const note = el("p", "seat-note");
  const buttons = SEATS.map((s) => {
    const button = el("button", "seat-card");
    button.type = "button";
    button.append(el("span", "tag", s.tag));
    button.append(el("span", "name", s.name), el("span", "what", s.what));
    button.addEventListener("click", () => {
      if (button.disabled) return;
      onSeat(s.role);
    });
    block.append(button);
    return { role: s.role, el: button };
  });
  block.append(note);

  return {
    seatBlock: block,
    paintSeat: (role) => {
      for (const b of buttons) b.el.classList.toggle("on", b.role === role);
    },
    lockSeats: (locked, why) => {
      for (const b of buttons) {
        b.el.disabled = locked;
        b.el.classList.toggle("locked", locked);
      }
      note.textContent = why;
      block.classList.toggle("held", locked);
    },
  };
}
