import { brushArtImage } from "./brush-art.js";
import { readClosedCategories, writeClosedCategories } from "./brush-category.js";
import { bindBrushCard } from "./brush-tooltip.js";
import type { Held } from "./held.js";
import type { Selection } from "./selection.js";
import { silhouette } from "./silhouette.js";
import { BRUSH_GROUPS, BRUSHES, type Brush } from "./state.js";

export interface Palette {
  render(): void;
}

export interface PaletteOptions {
  /** Which cell a brush click paints. */
  selection: Selection;
  /** The armed brush — what a click on this palette leaves behind, and what
   * the map spends on the next cell it is given (`held.ts`). */
  held: Held;
  /** Brushes the current wave has no use for — a boss wave has no use for the
   * three that place a living creature or a rock. Hiding the button is the
   * visible half of the guard; `paint` in state.ts holds the other half, so a
   * selection carried over from another wave cannot place one either. */
  hidden(): ReadonlySet<Brush>;
  /** Paint the selected cell with a brush and settle everything an edit
   * touches — a wave rebuild, the status line, the stage. A no-op when
   * nothing is selected: a brush has nowhere to land until a tile does. */
  onPaint(brush: Brush): void;
  /** Whether a Ctrl-click on this brush lands anywhere — whether the wave
   * that first puts it on the field is one this director's copy still has
   * (`jumpWaveIndex` in `brush-wave.ts`). The button lights while the key is
   * held only if it does; a brush no wave carries says so by staying dark
   * rather than by refusing a press nobody could have predicted. */
  canJump(brush: Brush): boolean;
  /** Open that wave and play it. */
  onJump(brush: Brush): void;
}

/**
 * A click that means "show me this" rather than "put this here". Ctrl is what
 * the owner asked for; ⌘ answers too, because on a Mac Ctrl-click is the
 * context menu and a shortcut the platform has already spent is no shortcut.
 */
function isJumpClick(e: MouseEvent): boolean {
  return e.ctrlKey || e.metaKey;
}

/**
 * The palette says, while the key is down, what the key would do — the
 * brushes that lead somewhere light up and the rest go dim, so the modifier
 * is discovered by holding it rather than by reading about it. `blur` clears
 * the cue because a window switched away with Ctrl held never sees the keyup.
 */
function bindJumpCue(brushBar: HTMLElement): void {
  const set = (on: boolean): void => {
    brushBar.classList.toggle("jump", on);
  };
  window.addEventListener("keydown", (e) => {
    if (e.key === "Control" || e.key === "Meta") set(true);
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Control" || e.key === "Meta") set(false);
  });
  window.addEventListener("blur", () => set(false));
}

/**
 * The palette: an accordion of categories, each with its own brushes directly
 * under it in the same column.
 *
 * It used to be a rail of tabs beside a wide grid of options — one category
 * on screen at a time, the buttons stretched across a track with room to
 * spare. That cost two things the author actually wanted: seeing SHIELD and
 * MIXED at once, and a palette narrow enough to sit *beside* the map rather
 * than above it. Every category opens by default and folds on its own click;
 * the buttons are as small as a 26px picture and a name allow, so the whole
 * column is content-width.
 *
 * **A brush is held now, and that is a change the owner asked for.** It used
 * not to be: clicking one painted the tile already selected on the map and
 * stopped there, the button never stayed lit, and the order was always *tile
 * first, brush second*. That order still works and is still the way to reach a
 * cell's own options — click the cell, and the panel above the map is already
 * showing what is in it. What is new is the other order. **A click arms the
 * brush and lights the button**, because the next click is on the map: the
 * cells it lands on take that brush, and a drag across them takes a stroke of
 * it (`grid-gestures.ts`). Clicking the lit brush again puts it down.
 *
 * **And a brush can be dragged onto a cell**, which is the same sentence said
 * with the pointer held. Nothing is armed by a drag: it lands where it was
 * dropped and the palette goes back to whatever it was holding, so a single
 * arrival is one gesture rather than arm-place-disarm.
 */
export function bindPalette({
  selection,
  held,
  hidden,
  onPaint,
  canJump,
  onJump,
}: PaletteOptions): Palette {
  const brushBar = document.getElementById("brushes");
  if (brushBar) bindJumpCue(brushBar);
  const closed = readClosedCategories();

  // ERASE is a tool action rather than a creature, so its button is static
  // markup outside the list `render()` rebuilds — it reads the same wherever
  // the categories above it have been folded to, and it is bound once.
  const erase = document.getElementById("brushErase");
  if (erase) {
    erase.title = BRUSHES.find((b) => b.brush === "erase")?.note ?? "";
    // Armed like any other brush, so a run of corrections is a stroke rather
    // than a trip to the palette each time — and painted straight away where a
    // cell is already selected, which is what the button has always done.
    erase.addEventListener("click", () => press("erase"));
    bindBrushDrag(erase, "erase", held);
  }

  /**
   * What a click on a brush means. Two things at once, in this order: whatever
   * cell is already selected takes the brush, and the brush stays lit for the
   * cells that come next. The lit brush clicked again is put down instead —
   * one gesture out of the mode, and the only one there could be.
   */
  const press = (brush: Brush): void => {
    if (held.brush() === brush) {
      held.hold(null);
      return;
    }
    held.hold(brush);
    if (selection.at()) onPaint(brush);
  };

  const brushButton = (b: (typeof BRUSHES)[number]): HTMLElement => {
    const button = document.createElement("button");
    button.type = "button";
    const classes = ["brush"];
    if (canJump(b.brush)) classes.push("can-jump");
    if (held.brush() === b.brush) classes.push("on");
    button.className = classes.join(" ");
    bindBrushDrag(button, b.brush, held);
    // The picture at a size worth looking at, the wave it first arrives in
    // and the brush's own sentence — on a card that opens under the pointer
    // (`brush-tooltip.ts`), so hovering says all three whether or not SHOW
    // DESCRIPTIONS is on. It replaces a `title` attribute, which could carry
    // two of the three and never the one that matters most.
    bindBrushCard(button, b.brush);

    // The button's own picture — a settled frame of the real renderer where
    // this module has one (`brush-art.ts`), the plain contour otherwise.
    const art = brushArtImage(b.brush, 26);
    if (art) {
      button.appendChild(art);
    } else {
      for (const subject of b.subjects) button.appendChild(silhouette(subject, b.stroke, 26));
    }

    const text = document.createElement("div");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = b.label;
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = b.note;
    text.append(name, hint);
    button.appendChild(text);

    button.addEventListener("click", (e) => {
      // The modifier is checked before the selection: seeing a brush in
      // action is a question about the campaign, and it has an answer whether
      // or not a tile on this wave's map happens to be pointed at.
      if (isJumpClick(e)) {
        if (canJump(b.brush)) onJump(b.brush);
        return;
      }
      press(b.brush);
    });
    return button;
  };

  const render = (): void => {
    // ERASE is static markup outside the list below, so its lit state is set
    // here rather than built with it — it is armed like any other brush and
    // has to say so the same way.
    erase?.classList.toggle("on", held.brush() === "erase");
    if (!brushBar) return;
    const hide = hidden();

    // A group every brush of which the current wave hides — the boss-panel
    // creature groups on a boss wave — drops out entirely, header and all,
    // rather than leaving an empty one to fold.
    const visibleGroups = BRUSH_GROUPS.map((group) => ({
      group,
      brushes: group.brushes.filter((b) => !hide.has(b)),
    })).filter((g) => g.brushes.length > 0);

    brushBar.replaceChildren();
    const byBrush = new Map(BRUSHES.map((b) => [b.brush, b] as const));

    for (const { group, brushes } of visibleGroups) {
      const section = document.createElement("div");
      section.className = closed.has(group.label) ? "brush-group closed" : "brush-group";

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "brush-category";
      tab.textContent = group.label;
      tab.addEventListener("click", () => {
        if (closed.has(group.label)) closed.delete(group.label);
        else closed.add(group.label);
        writeClosedCategories(closed);
        render();
      });
      section.appendChild(tab);

      const list = document.createElement("div");
      list.className = "brush-list";
      for (const brushKind of brushes) {
        const b = byBrush.get(brushKind);
        if (b) list.appendChild(brushButton(b));
      }
      section.appendChild(list);
      brushBar.appendChild(section);
    }
  };

  render();
  return { render };
}

/**
 * A brush that can be dragged onto the map. The payload is a value in `held`
 * rather than in `DataTransfer` for the reason that module gives: a drop target
 * has to decide during `dragover` whether it wants the thing, and `getData` is
 * unreadable there. The `setData` below is only so the pointer shows a drag at
 * all.
 */
function bindBrushDrag(button: HTMLElement, brush: Brush, held: Held): void {
  button.draggable = true;
  button.addEventListener("dragstart", (e) => {
    held.drag({ kind: "brush", brush });
    e.dataTransfer?.setData("text/plain", brush);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
  });
  button.addEventListener("dragend", () => held.drag(null));
}
