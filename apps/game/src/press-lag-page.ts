import type { InputBuffer } from "./input-buffer.js";
import { lagText, PressLag } from "./press-lag.js";

/**
 * `?lag=1`: the wait between a thumb and the field answering it, in the corner.
 *
 * The perf page (`perf-page.ts`) sweeps the waves with nobody pressing
 * anything, so the figure cannot live on it: this one only exists while a
 * person is playing. It is a line of text over the rig, readable in a
 * photograph, redrawn twice a second.
 *
 * The listeners are on the window and in the capture phase, so they hear the
 * touch before whichever listener turns it into a press — which is the order
 * `PressLag.stamp` needs. Passive: they read a time and prevent nothing.
 */
export const LAG_PARAM = "lag";

export function lagRequested(url: string): boolean {
  const value = new URL(url, "http://game.invalid/").searchParams.get(LAG_PARAM);
  return value !== null && value !== "0";
}

const STYLE = [
  "position:fixed",
  "left:8px",
  "bottom:calc(8px + env(safe-area-inset-bottom, 0px))",
  "z-index:50",
  "pointer-events:none",
  "padding:2px 6px",
  "background:rgba(5,4,12,0.8)",
  "color:#cfe6ff",
  "font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace",
].join(";");

/** Builds the counter onto the buffer and shows it, if the URL asked. */
export function bindPressLag(href: string, buffer: InputBuffer): PressLag | null {
  if (!lagRequested(href)) return null;
  const lag = new PressLag();
  buffer.lag = lag;
  const heard = (e: Event): void => lag.touch(e.timeStamp);
  const opts = { capture: true, passive: true };
  window.addEventListener("pointerdown", heard, opts);
  window.addEventListener("keydown", heard, opts);

  const line = document.createElement("div");
  line.id = "pressLag";
  line.setAttribute("style", STYLE);
  document.body.append(line);
  const show = (): void => {
    line.textContent = lagText(lag.figures());
  };
  show();
  setInterval(show, 500);
  return lag;
}
