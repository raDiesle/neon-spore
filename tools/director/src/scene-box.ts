import { SCENES } from "@neon-spore/shape-sheet";
import { sceneFigure } from "./scene-panel.js";

/**
 * `⌖ ON THE FIELD`, beside a backlog entry: the idea drawn where it happens.
 *
 * The frame above a row answers *what does it look like*. This answers the
 * question that decides whether an idea survives, which is what it looks like
 * **from the seat** — at a lane's width, above a hull, beside the creatures
 * the game already draws. The two are not the same question and one picture
 * cannot ask both: a card fits a shape into its frame, and fitting is exactly
 * what the field refuses to do.
 *
 * Shut, and built the first time it is opened. A scene runs a real simulation
 * forward and draws a whole phone with the shipping renderer; a bestiary tab
 * that did thirteen of those on the way in would stall for a second on a page
 * most of whose readers came to read a paragraph.
 */

/** Every scene drawn at this concept, or nothing. The join, spelled as the spec does. */
function scenesFor(name: string) {
  return name ? SCENES.filter((s) => s.suggests === name) : [];
}

export function onTheField(name: string): HTMLElement | null {
  const scenes = scenesFor(name);
  if (scenes.length === 0) return null;

  const box = document.createElement("details");
  box.className = "more";
  const summary = document.createElement("summary");
  summary.textContent =
    scenes.length === 1
      ? "⌖ ON THE FIELD — the mechanic, at the size a phone draws it"
      : `⌖ ON THE FIELD — ${scenes.length} pictures, at the size a phone draws them`;
  box.appendChild(summary);

  const body = document.createElement("div");
  body.className = "scenes";
  box.appendChild(body);

  let built = false;
  box.addEventListener("toggle", () => {
    if (built || !box.open) return;
    built = true;
    for (const scene of scenes) body.appendChild(sceneFigure(scene));
  });
  return box;
}
