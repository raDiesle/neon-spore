/**
 * The colour half of the STYLE page: every swatch in `PALETTE`, filed under
 * the rule it belongs to, and the hue dial that says where the next one goes.
 *
 * The filing is `tools/style-guide/src/families.ts` — the same list the
 * generated sheet is drawn from, and the one `style-guide.test.ts` fails on
 * when a palette entry has no home. Reading it here rather than writing a
 * second list is the whole reason this page can be trusted: a colour added to
 * the game appears here without anyone remembering to add it.
 */

import { PALETTE } from "@neon-spore/render";
import { DIAL_RADIUS, dialMarks } from "@neon-spore/style-guide/colour.js";
import { FAMILIES, hsl } from "@neon-spore/style-guide/families.js";

type Swatches = Record<string, string>;

/**
 * A swatch copies its hex when clicked. That is the one thing this page can do
 * that the SVG sheet cannot: the reason anybody opens a palette is to put one
 * of its values into a file, and reading six characters off a picture by eye is
 * how a `#7c4dff` becomes a `#7c4fdd`.
 */
function swatch(key: string, hex: string): HTMLElement {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "swatch";
  cell.title = "click to copy";

  const block = document.createElement("span");
  block.className = "chip";
  block.style.background = hex;
  cell.appendChild(block);

  const name = document.createElement("span");
  name.className = "key";
  name.textContent = key;
  cell.appendChild(name);

  const value = document.createElement("span");
  value.className = "hex";
  value.textContent = `${hex} · ${Math.round(hsl(hex).h)}°`;
  cell.appendChild(value);

  cell.addEventListener("click", () => {
    void navigator.clipboard?.writeText(hex);
    const was = value.textContent;
    value.textContent = "copied";
    cell.classList.add("is-copied");
    setTimeout(() => {
      value.textContent = was;
      cell.classList.remove("is-copied");
    }, 900);
  });
  return cell;
}

export function colourSection(): HTMLElement {
  const all = PALETTE as unknown as Swatches;
  const section = document.createElement("section");
  section.className = "sg-section";

  const h2 = document.createElement("h2");
  h2.textContent = "COLOUR";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Every colour the game draws with, in the group it belongs to. A body hue ships as three: the body itself, a paler rim and a darker deep. Click a swatch to copy its hex.";
  section.appendChild(note);

  for (const family of FAMILIES) {
    const group = document.createElement("div");
    group.className = "sg-family";

    const name = document.createElement("h3");
    name.textContent = family.name;
    group.appendChild(name);

    const rule = document.createElement("p");
    rule.className = "sg-rule";
    rule.textContent = family.rule.replace(/`/g, "");
    group.appendChild(rule);

    const row = document.createElement("div");
    row.className = "sg-swatches";
    for (const key of family.keys) {
      const hex = all[key];
      if (hex) row.appendChild(swatch(key, hex));
    }
    group.appendChild(row);
    section.appendChild(group);
  }
  return section;
}

const DIAL_W = 620;
const DIAL_H = 470;

export function dialSection(): HTMLElement {
  const section = document.createElement("section");
  section.className = "sg-section";

  const h2 = document.createElement("h2");
  h2.textContent = "WHERE THE NEXT COLOUR GOES";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "The twelve body hues at the angle each one actually sits at. Look for the gaps: a new colour goes in one of those. A hue drawn on top of a neighbour is a hue the pair says the wrong word for, so the two labels pushed out on a leader line are the crowded ones.";
  section.appendChild(note);

  const art = document.createElement("div");
  art.className = "sg-dial";
  art.innerHTML = `<svg viewBox="0 0 ${DIAL_W} ${DIAL_H}" width="${DIAL_W}" height="${DIAL_H}" aria-label="the body hues on a wheel">
${dialMarks(DIAL_W / 2, DIAL_H / 2, DIAL_RADIUS)}
</svg>`;
  section.appendChild(art);
  return section;
}
