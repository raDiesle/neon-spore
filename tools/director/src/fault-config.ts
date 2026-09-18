import type { Wave, WaveFault } from "@neon-spore/content";
import { DEFAULT_CONFIG, MALFUNCTION_COLORS, type MalfunctionColor } from "@neon-spore/sim";
import { choiceRow, labelled } from "./cell-config-rows.js";
import { COLOUR_LABEL, FAULT_NOTE, faultTitle, SEAT_LABEL } from "./fault-notes.js";
import { faultsAt, liftFault } from "./paint-fault.js";

/**
 * **The rows under the map that configure the faults on the selected row**:
 * how many beats each one holds, what a runaway cannon is loaded with, whose
 * screen THE FLIP turns, and the button that lifts one off again.
 *
 * It is `cell-config.ts` for a beat instead of a cell, and it is here for that
 * file's own reason. Everything a wave could say about a malfunction used to
 * be said in a picker in the WAVE column — one fault, chosen off a list,
 * hanging on the wave beside its boss. The owner took it off on 18 September
 * 2026: *malfunction should be removed as a global wave setting of the wave
 * section, and whenever I assign a brush malfunction to a row in the map
 * editor it should be active at that point in time, and I can configure for
 * how many rows the malfunction will last.* So a fault is authored in exactly
 * one place now — the row it is painted on — and this is that place.
 *
 * **A fault has no column, so these rows belong to the beat and not to the
 * cell.** Selecting any cell on a row reaches them, which is the same gesture
 * that reaches the arrival in it, and the two blocks sit one above the other
 * under the map (`cell-panel.ts`).
 *
 * Nothing here decides anything: it draws what is on the row and calls back
 * when a box is typed in. A row a fault has no answer for — an ammunition on
 * a shield, a screen on a leech — is not drawn at all rather than drawn
 * disabled, which is the rule the cell's own rows already follow.
 */
export interface FaultConfigOptions {
  /** The wave on the stage. */
  wave: Wave;
  /** The beat row the selection is on — the row whose faults these are. */
  beat: number;
  /** A fault changed: mark the wave dirty and rebuild everything, the stage
   * included. A fault is what the beat *does*, not what the wave says about
   * itself, so the world has to be stood up again around it. */
  onEdit(): void;
}

/** Nothing at all when no fault enters on this row: an empty heading reads as
 * a field somebody failed to fill. */
export function faultConfig({ wave, beat, onEdit }: FaultConfigOptions): HTMLElement | null {
  const here = faultsAt(wave, beat);
  if (here.length === 0) return null;

  const block = document.createElement("div");
  const head = document.createElement("h2");
  head.textContent = `MALFUNCTION — BEAT ${beat}`;
  block.appendChild(head);
  for (const fault of here) block.appendChild(one(wave, fault, onEdit));
  return block;
}

function one(wave: Wave, fault: WaveFault, onEdit: () => void): HTMLElement {
  const box = document.createElement("div");
  box.className = "fault-placed";

  const head = document.createElement("div");
  head.className = "fault-head";
  const title = document.createElement("span");
  title.textContent = faultTitle(fault.kind);
  const lift = document.createElement("button");
  lift.type = "button";
  lift.className = "chip";
  lift.textContent = "✕ LIFT";
  lift.title = "Take this malfunction off the row";
  lift.addEventListener("click", () => {
    liftFault(wave, fault);
    onEdit();
  });
  head.append(title, lift);
  box.append(head, heldFor(fault, onEdit));

  if (fault.kind === "cannon") {
    box.appendChild(
      choiceRow(
        "AMMUNITION",
        MALFUNCTION_COLORS,
        fault.color ?? "red",
        (c: MalfunctionColor) => COLOUR_LABEL[c],
        (color) => {
          fault.color = color;
          onEdit();
        },
      ),
    );
  }
  if (fault.kind === "flip") {
    box.appendChild(
      choiceRow(
        "TURNED SCREEN",
        [1, 2] as const,
        fault.seat ?? 1,
        (s: 1 | 2) => SEAT_LABEL[s],
        (seat) => {
          fault.seat = seat;
          onEdit();
        },
      ),
    );
  }

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = FAULT_NOTE[fault.kind];
  box.appendChild(note);
  return box;
}

/**
 * **How many rows it lasts** — the one number the owner asked for, and the
 * reason this panel exists.
 *
 * Beats, like everything else read off the map's rows, counted from the row it
 * is on: 1 is this row alone. An empty box is not a zero, it is the wave
 * saying nothing, and what nothing means is *to the end of the wave*
 * (`sim/fault-placed.ts`, `TO_THE_END`).
 *
 * **THE HANDOVER is the one kind an empty box is not offered to.** A handover
 * that never ends is two panels that change screens and never come home, which
 * is not a long fault, it is a broken one — so a box cleared on one falls back
 * to the game's own hold, the same number the pencil places it with.
 */
function heldFor(fault: WaveFault, onEdit: () => void): HTMLElement {
  const ends = fault.kind === "handover";
  const row = labelled("HELD FOR");
  const field = document.createElement("input");
  field.type = "number";
  field.min = "1";
  field.className = "fault-beats";
  field.placeholder = ends ? String(DEFAULT_CONFIG.handoverHoldBeats) : "to the end";
  field.value = fault.beats === undefined ? "" : String(fault.beats);
  field.addEventListener("change", () => {
    const typed = whole(field.value);
    if (typed === undefined && ends) fault.beats = DEFAULT_CONFIG.handoverHoldBeats;
    else if (typed === undefined) fault.beats = undefined;
    else fault.beats = typed;
    onEdit();
  });
  const unit = document.createElement("span");
  unit.className = "note";
  unit.textContent = ends ? "beat rows" : "beat rows (blank: to the end of the wave)";
  row.append(field, unit);
  return row;
}

/** A whole number an author typed, or nothing at all for an empty box. */
function whole(raw: string): number | undefined {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isFinite(n) && n >= 1 ? Math.floor(n) : undefined;
}
