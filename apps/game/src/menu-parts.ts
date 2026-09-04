import { BULB, blobPath } from "@neon-spore/content";

/**
 * The pieces every menu page is made of: the element helper, the way back, and
 * the wordmark's spore.
 *
 * Split out of `menu-view.ts` when the menu became the game's front door
 * rather than a flag — that file is now the shell and the root page, this is
 * the furniture, and `menu-pages.ts` is the three lists. CLAUDE.md says split
 * rather than grow.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

export type MenuPage = "root" | "testing" | "waves" | "demos" | "keys" | "how" | "settings";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

/**
 * The way back, and where back *is*.
 *
 * It went to the front page and nowhere else for as long as every page hung
 * off the front page. Two of them no longer do — the three testing lists sit
 * behind TESTING and CONTROLS sits inside SETTINGS — and a back button that
 * skipped the page it was opened from would drop the reader a floor below
 * where they came in.
 */
export function backButton(
  show: (page: MenuPage) => void,
  to: MenuPage = "root",
): HTMLButtonElement {
  const button = el("button", "back", "← BACK");
  button.type = "button";
  button.addEventListener("click", () => show(to));
  return button;
}

/**
 * The wordmark's spore: a bulb, through the same `blobPath` the renderer calls
 * with the same `BULB` parameters. A shape drawn twice is a shape that ends up
 * meaning two things, and the one on the title screen should be the creature
 * the game is named after rather than an impression of it.
 */
export function sporeSvg(): { svg: SVGSVGElement; animate: (on: boolean) => void } {
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
