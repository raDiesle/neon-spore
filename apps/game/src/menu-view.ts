import { BULB, blobPath, WAVES } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";

/**
 * The menu's markup, built here rather than written into index.html.
 *
 * Two of its three pages are lists that already exist — the authored waves and
 * the keys `input.ts` binds — and a hand-typed copy of either in markup is a
 * copy that drifts. The third is five entries, which follow the same builder
 * so that the whole screen has one shape.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

export type MenuPage = "root" | "waves" | "keys";

export interface MenuEntry {
  label: string;
  desc: string;
  run: () => void;
}

export interface MenuHandlers {
  entries: MenuEntry[];
  /** A wave was picked out of the list. */
  onWave: (wave: number) => void;
  onSeat: (role: ViewRole) => void;
}

export interface MenuDom {
  root: HTMLElement;
  show: (page: MenuPage) => void;
  /** The seat is the view switch's, so the menu is told rather than deciding. */
  paintSeat: (role: ViewRole) => void;
  /** The spore breathes only while the menu is up. */
  animate: (on: boolean) => void;
}

const SEATS: { role: ViewRole; label: string }[] = [
  { role: "p1", label: "P1" },
  { role: "p2", label: "P2" },
  { role: "test", label: "TEST" },
];

/** Read off `bindControls`. One row per key a tester actually presses. */
const KEYS: [string, string][] = [
  ["A / D", "The cannon, and the shield along with it."],
  ["J / L", "The shield on its own."],
  ["I", "The guard trigger."],
  ["S", "The maw, to take a loose pod in."],
  ["F", "Hold the lance. Three beats with the cannon still, then one shot goes through three."],
  ["W", "Fire red — and guard in the same press."],
  ["E", "Fire cyan."],
  ["G", "Hold the nearest creature — the grip, as the other player."],
  ["← / →", "The previous and the next wave."],
  ["P", "Pause."],
  ["ESC", "This menu."],
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

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

  const pages: Record<MenuPage, HTMLElement> = {
    root: el("div", "page on"),
    waves: el("div", "page"),
    keys: el("div", "page"),
  };
  const show = (page: MenuPage): void => {
    for (const [name, node] of Object.entries(pages)) node.classList.toggle("on", name === page);
  };

  h.entries.forEach((entry, i) => {
    const button = el("button", "entry");
    button.type = "button";
    button.style.setProperty("--i", String(i));
    const mark = el("span", "mark", "▸");
    // Decoration. Without this it is read out in front of the entry's name.
    mark.ariaHidden = "true";
    button.append(mark, el("span", "label", entry.label));
    button.append(el("span", "desc", entry.desc));
    button.addEventListener("click", entry.run);
    pages.root.append(button);
  });

  const seatRow = el("div", "seat");
  seatRow.append(el("span", "cap", "SEAT"));
  const seatButtons = SEATS.map((s) => {
    const button = el("button", undefined, s.label);
    button.type = "button";
    button.addEventListener("click", () => h.onSeat(s.role));
    seatRow.append(button);
    return { role: s.role, el: button };
  });
  pages.root.append(seatRow);
  pages.root.append(
    el(
      "p",
      "foot",
      "This screen is off unless the address asks for it — the game a tester opens goes straight to the field.",
    ),
  );

  pages.waves.append(backButton(show), el("h2", undefined, "WAVES"));
  WAVES.forEach((wave, i) => {
    const button = el("button", "wave");
    button.type = "button";
    button.append(el("span", "n", String(i + 1).padStart(2, "0")));
    const name = el("span", "label", wave.name);
    if (wave.boss) name.append(el("span", "boss", " ✦"));
    button.append(name, el("span", "s", wave.sentence));
    button.addEventListener("click", () => h.onWave(i));
    pages.waves.append(button);
  });

  pages.keys.append(backButton(show), el("h2", undefined, "CONTROLS AT A DESK"));
  const table = el("table", "keys");
  for (const [key, what] of KEYS) {
    const row = el("tr");
    row.append(el("td", undefined, key), el("td", undefined, what));
    table.append(row);
  }
  pages.keys.append(table);
  pages.keys.append(
    el(
      "p",
      "foot",
      "On a phone the two strips answer separate thumbs — the keys are for one person at a desk playing both seats.",
    ),
    // The one control that is on neither strip, so a list of the strips
    // would never mention it.
    el(
      "p",
      "foot",
      "Either of you can press and hold anything falling: it drags at it and slows it, for as long as the finger stays. Both screens are told whose hand it is.",
    ),
  );

  inner.append(pages.root, pages.waves, pages.keys);
  document.body.append(root);

  return {
    root,
    show,
    paintSeat: (role) => {
      for (const s of seatButtons) s.el.classList.toggle("on", s.role === role);
    },
    animate: spore.animate,
  };
}

function backButton(show: (page: MenuPage) => void): HTMLButtonElement {
  const button = el("button", "back", "← BACK");
  button.type = "button";
  button.addEventListener("click", () => show("root"));
  return button;
}

/**
 * The wordmark's spore: a bulb, through the same `blobPath` the renderer calls
 * with the same `BULB` parameters. A shape drawn twice is a shape that ends up
 * meaning two things, and the one on the title screen should be the creature
 * the game is named after rather than an impression of it.
 */
function sporeSvg(): { svg: SVGSVGElement; animate: (on: boolean) => void } {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "spore");

  const halo = document.createElementNS(SVG_NS, "path");
  halo.setAttribute("fill", "rgba(47, 224, 240, 0.09)");
  const body = document.createElementNS(SVG_NS, "path");
  body.setAttribute("fill", "rgba(10, 7, 26, 0.85)");
  body.setAttribute("stroke", "#2fe0f0");
  body.setAttribute("stroke-width", "2.4");
  svg.append(halo, body);

  const draw = (t: number): void => {
    const { lobes, depth, wobble, seed } = BULB;
    halo.setAttribute("d", blobPath(50, 50, 41, 41, lobes, depth, wobble, t * 0.7, seed));
    body.setAttribute("d", blobPath(50, 50, 33, 33, lobes, depth, wobble, t, seed));
  };
  draw(0);

  let frame = 0;
  const animate = (on: boolean): void => {
    if (!on) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    if (frame) return;
    const step = (ms: number): void => {
      draw(ms / 1000);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };
  return { svg, animate };
}
