/**
 * The strips of the screen the phone keeps for itself, in numbers.
 *
 * `index.html` asks for `viewport-fit=cover`, so the page is laid out under
 * the notch, the status bar and the home indicator rather than beside them —
 * which is right for the background and wrong for anything a thumb has to
 * reach. The CSS furniture around the game already keeps out of those strips;
 * the picture the game is *played* on did not, because it is a canvas covering
 * the whole window and nothing in `packages/render` may ask a document
 * anything. So the four numbers are read here and handed to `computeStage` as
 * an inset (`render/layout-stage.ts`).
 *
 * **Read off a probe element rather than a custom property.** `env()` inside a
 * `--var` is not resolved until something uses it, so `getPropertyValue` hands
 * back the text `env(safe-area-inset-top, 0px)` on more than one browser. A
 * real `padding` on a real element is resolved by the time `getComputedStyle`
 * answers, in pixels, everywhere.
 *
 * Every path here fails to zero. A browser with no `env()` support, a desktop
 * with no furniture and a headless runner with no document all give the same
 * answer, which is the stage the game has always had.
 */

import { type Insets, NO_INSET } from "@neon-spore/render";

const SIDES = ["top", "right", "bottom", "left"] as const;

/** Built once and left in the document: the values change on a rotation, and
 * the next read has to see the new ones. Nothing is drawn — it has no size.
 * Kept only while it is still in the document: one that has been taken out
 * resolves nothing, and answers every side zero without saying so. */
let probe: HTMLElement | null = null;

/** The four strips, right now. */
export function safeArea(): Insets {
  const el = probeElement();
  if (!el) return NO_INSET;
  const style = getComputedStyle(el);
  return {
    top: px(style.paddingTop),
    right: px(style.paddingRight),
    bottom: px(style.paddingBottom),
    left: px(style.paddingLeft),
  };
}

/** `"44px"` as 44. Anything a browser cannot resolve is no furniture at all. */
function px(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function probeElement(): HTMLElement | null {
  if (probe?.isConnected) return probe;
  if (typeof document === "undefined") return null;
  const host = document.body ?? document.documentElement;
  if (!host) return null;
  const el = document.createElement("div");
  // Out of the way of everything: no size, no paint, no press. The padding is
  // the whole point of it and is the only thing anybody reads.
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "0";
  el.style.height = "0";
  el.style.visibility = "hidden";
  el.style.pointerEvents = "none";
  for (const side of SIDES) {
    el.style.setProperty(`padding-${side}`, `env(safe-area-inset-${side}, 0px)`);
  }
  host.appendChild(el);
  probe = el;
  return el;
}

/**
 * **The shortest the window gets with the browser's own bars shown**, in CSS
 * pixels, or 0 where the browser cannot say.
 *
 * The address bar is furniture too, and the one piece that comes and goes: a
 * run freezes the height it opened at (`viewport.ts`), so a wave opened with
 * the bar tucked away is laid out under the strip the bar comes back to, and
 * the lobes sit behind it for the rest of the wave. The owner's report, 20
 * September 2026: *the bottom of control set is often cutted.* `100svh` is the
 * height with every bar out, and the stage is never taller than it.
 */
let small: HTMLElement | null = null;

export function smallHeight(): number {
  if (!small?.isConnected) {
    if (typeof document === "undefined" || !document.body) return 0;
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.width = "0";
    // A browser that has no `svh` drops the line and the box stays empty,
    // which answers 0: no cap, the stage it has always had.
    el.style.height = "100svh";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    small = el;
  }
  return Math.round(small.getBoundingClientRect().height);
}
