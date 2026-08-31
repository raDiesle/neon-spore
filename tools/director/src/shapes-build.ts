/**
 * BUILD — a live composer over `grown()`, for trying a recipe before it is
 * one.
 *
 * `grown-bodies.ts` and `jelly-bodies.ts` are both a base blob and a short
 * list of attachments, written by hand and judged afterwards on the static
 * sheet or the OVERVIEW walk. This is the same machinery run the other way:
 * pick a base, click parts onto it, watch it move, and only write the recipe
 * down once it already looks like something. It changes nothing in
 * `packages/content` and nothing any of the other views draw — see this
 * file's own copy in the DRAFTS/FREE/TAKEN sense: everything built here is a
 * fourth, unsaved state that exists only in this tab, in memory, until it is
 * copied out.
 *
 * The state itself — the base, the attachments, the recipe text — is
 * `shapes-build-state.ts`'s. This file rebuilds the whole tab on every
 * change, the same full-rebuild idiom `shapes-controls.ts` and
 * `shapes-pair.ts` already use for exactly the same reason: a card's skin,
 * fill and clip are decided when it is constructed, and patching them in
 * place would be a second copy of `grown()` that has to agree with the first.
 */

import {
  type Attachment,
  CATEGORIES,
  type CatalogueEntry,
  grown,
  PARTS,
} from "@neon-spore/shape-sheet";
import { shapeFigure } from "./shape-figure.js";
import {
  addPart,
  attachments,
  base,
  flipAt,
  JET,
  nudge,
  recipeText,
  removeAt,
  resetAttachments,
  SIZES,
  setSizeName,
  sizeName,
} from "./shapes-build-state.js";
import { button, group } from "./shapes-widgets.js";

function currentEntry(): CatalogueEntry {
  return {
    subject: grown("BUILD", "", {
      rx: base.rx,
      ry: base.ry,
      lobes: base.lobes,
      bell: base.bell ? 0.34 : undefined,
      pulse: base.swims ? {} : undefined,
      parts: attachments,
    }),
    status: "free",
    slot: "creature",
    owner: "",
    motion: base.swims ? JET : undefined,
  };
}

/** One line of an attachment, with the controls that move only that one. */
function attachmentRow(host: HTMLElement, a: Attachment, i: number): void {
  const row = document.createElement("div");
  row.className = "build-row";
  const label = document.createElement("span");
  const deg = ((a.at * 180) / Math.PI).toFixed(0);
  label.textContent = `${i + 1}. ${a.part.toUpperCase()} @ ${deg}°${a.flip ? " (flipped)" : ""}`;
  row.appendChild(label);
  const nudgeBtn = (text: string, hint: string, run: () => void) =>
    button(row, text, false, hint, () => {
      run();
      renderShapesBuild();
    });
  nudgeBtn("↺", "rotate 15° back", () => nudge(i, "at", -0.26));
  nudgeBtn("↻", "rotate 15° forward", () => nudge(i, "at", 0.26));
  nudgeBtn("−", "smaller", () => nudge(i, "size", -0.15, 0.2));
  nudgeBtn("+", "bigger", () => nudge(i, "size", 0.15));
  nudgeBtn("⇋", "mirror along the rim", () => flipAt(i));
  nudgeBtn("×", "remove", () => removeAt(i));
  host.appendChild(row);
}

function baseGroup(controls: HTMLElement): void {
  group(
    controls,
    "BASE",
    `The blob everything else attaches to. Now: ${base.lobes} lobes, ` +
      `${sizeName.toLowerCase()}${base.bell ? ", a bell" : ""}${base.swims ? ", swimming" : ""}.`,
    (row) => {
      for (const n of [1, 2, 3, 4, 5])
        button(row, `${n} LOBES`, base.lobes === n, `${n}-lobed base`, () => {
          base.lobes = n;
          renderShapesBuild();
        });
      for (const name of Object.keys(SIZES))
        button(row, name, sizeName === name, `${SIZES[name]?.rx}×${SIZES[name]?.ry}`, () => {
          setSizeName(name);
          const s = SIZES[name];
          if (s) {
            base.rx = s.rx;
            base.ry = s.ry;
          }
          renderShapesBuild();
        });
      button(row, "BELL", base.bell, "cuts the underside flat — see docs/parts.md", () => {
        base.bell = !base.bell;
        renderShapesBuild();
      });
      button(row, "SWIMS", base.swims, "the bell squeezes on the beat and JET lifts it", () => {
        base.swims = !base.swims;
        renderShapesBuild();
      });
    },
  );
}

function attachmentsGroup(controls: HTMLElement): void {
  const list = document.createElement("div");
  list.className = "control-group";
  const heading = document.createElement("h3");
  heading.className = "control-heading";
  heading.textContent = "ATTACHMENTS";
  list.appendChild(heading);
  if (attachments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "control-desc";
    empty.textContent = "Nothing yet — click a part above to attach it.";
    list.appendChild(empty);
  } else {
    attachments.forEach((a, i) => {
      attachmentRow(list, a, i);
    });
    const clear = document.createElement("div");
    clear.className = "build-row";
    button(clear, "CLEAR ALL", false, "remove every attachment", () => {
      resetAttachments();
      renderShapesBuild();
    });
    list.appendChild(clear);
  }
  controls.appendChild(list);
}

function recipeGroup(controls: HTMLElement): void {
  const recipe = document.createElement("div");
  recipe.className = "control-group";
  const rHeading = document.createElement("h3");
  rHeading.className = "control-heading";
  rHeading.textContent = "RECIPE";
  recipe.appendChild(rHeading);
  const rDesc = document.createElement("p");
  rDesc.className = "control-desc";
  rDesc.textContent =
    "Paste this into grown-bodies.ts or jelly-bodies.ts, inside RECIPES, and give it a real name and note.";
  recipe.appendChild(rDesc);
  const box = document.createElement("textarea");
  box.className = "build-recipe";
  box.readOnly = true;
  box.value = recipeText();
  box.addEventListener("focus", () => box.select());
  recipe.appendChild(box);
  const copyRow = document.createElement("div");
  copyRow.className = "build-row";
  button(copyRow, "COPY", false, "copy the recipe to the clipboard", () => {
    navigator.clipboard?.writeText(box.value).catch(() => box.select());
  });
  recipe.appendChild(copyRow);
  controls.appendChild(recipe);
}

export function renderShapesBuild(): void {
  const host = document.getElementById("shapesBuild");
  if (!host) return;
  host.replaceChildren();

  const preview = document.createElement("div");
  preview.className = "bodybar";
  preview.appendChild(
    shapeFigure(currentEntry(), { box: 220, stroke: "#2FE0F0", skin: "membrane", lit: true }),
  );
  host.appendChild(preview);

  const controls = document.createElement("div");
  // Both classes, not just `control-bar`: the group/button styling in
  // `index.html` is written `.skinbar.control-bar …`, matching the one place
  // it was needed before this file existed — `shapesAxes`, which carries
  // `skinbar` in markup and gets `control-bar` from `controlBar()`. A plain
  // `control-bar` here would build the right elements in the wrong colours.
  controls.className = "skinbar control-bar";
  host.appendChild(controls);

  baseGroup(controls);

  for (const cat of CATEGORIES) {
    group(controls, `ADD — ${cat.label}`, cat.blurb, (row) => {
      for (const p of PARTS.filter((p) => p.category === cat.id))
        button(row, p.label, false, p.hint, () => {
          addPart(p.id);
          renderShapesBuild();
        });
    });
  }

  attachmentsGroup(controls);
  recipeGroup(controls);
}
