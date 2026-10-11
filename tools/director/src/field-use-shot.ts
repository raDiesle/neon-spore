import type { FieldControlDef } from "./field-control-def.js";
import type { TouchArea } from "./field-focus.js";
import { cardArea, focusArt } from "./field-focus-art.js";
import { stillsStrip } from "./field-stills-art.js";
import { LEAST_TARGET, narrowest } from "./field-touch-paint.js";
import { openTry } from "./field-try.js";
import { text } from "./gestures-page.js";
import { openZoom, type ZoomView, zoomable } from "./picture-zoom.js";
import type { Pose } from "./pose-kit.js";
import { whenSeen } from "./when-seen.js";

/**
 * One picture on a use card of CONTROLS › ON THE FIELD
 * (`field-action-cards.ts`): the posed frame cut to the control, enlarged on a
 * click, the narrowest touch patch under it, and TRY IT and STILLS. Out of
 * that file on 11 October 2026, when holding the picture until it is near the
 * screen (`when-seen.ts`) took it over its length.
 */

/** Two pictures side by side fit the sheet's column. */
const SHOT_WIDTH = 240;
/** Tallest a card's picture is drawn; a click draws it again as tall as the
 * window (`picture-zoom.ts`). */
const SHOT_CAP = 300;

/** Under a card's picture: how wide its narrowest touch patch is, in red
 * under the platforms' least target (`field-touch-paint.ts`). */
function touchLine(area: TouchArea): HTMLElement {
  const least = narrowest(area);
  if (least === null) return text("p", "TOUCH AREA · not found on this frame", "touch-size");
  const line = text("p", `TOUCH AREA · narrowest ${Math.round(least)} pt`, "touch-size");
  if (least < LEAST_TARGET) line.classList.add("small");
  return line;
}

/** `user`'s rows on one pose, as one picture and its buttons. */
export function useShot(user: string, pose: Pose, own: readonly FieldControlDef[]): HTMLElement {
  const title = `${user} · ${own.map((r) => r.name).join(" · ")}`;
  const views: ZoomView[] = [
    { label: "THE CONTROL", draw: (w, h) => focusArt(pose, own, w, h) },
    { label: "TOUCH AREA", draw: (w, h) => focusArt(pose, own, w, h, "touch") },
    { label: "WHOLE PHONE", draw: (w, h) => focusArt(pose, own, w, h, "whole") },
    {
      label: "STILLS",
      draw: (w, h) => stillsStrip(pose, own, Math.floor(w / 3) - 8, (h - 60) / 2),
    },
  ];
  const shot = document.createElement("div");
  // The picture and its touch line are a world posed and drawn — held until
  // the card comes near the screen, in a box about its size.
  const art = document.createElement("div");
  art.className = "field-shot-wait";
  shot.appendChild(art);
  whenSeen(art, () => {
    art.replaceWith(
      zoomable(focusArt(pose, own, SHOT_WIDTH, SHOT_CAP), title, views),
      touchLine(cardArea(pose, own)),
    );
  });
  // The same frame, live and under the mouse (`field-try.ts`), and its
  // moments before, under and after AUTO's thumb (`field-stills-art.ts`).
  const play = text("button", "▶ TRY IT", "field-try");
  play.addEventListener("click", () => openTry(title, pose, own));
  const stills = text("button", "▤ STILLS", "field-try");
  stills.addEventListener("click", () => openZoom(title, views, views.length - 1));
  const buttons = document.createElement("div");
  buttons.className = "field-try-row";
  buttons.append(play, stills);
  shot.appendChild(buttons);
  return shot;
}
