import { type ControlSet, layoutSet, setControls, setHas } from "@neon-spore/content";

/**
 * The roster under the wave editor's control-set picker: every button on the
 * panel, seat by seat, with the ones this set holds back struck through.
 *
 * A name in a dropdown does not say what the pair will have in their hands.
 * PANELS over in the sheet answers that in full — a real frame of the real
 * band, drawn — but it is three clicks away from the rail, and the whole point
 * of the standard ladder is that the four rungs differ from each other by one
 * button. So the difference is put where the choice is made: the owner asked
 * to be able to see what each variant does *in the editor*, and this is the
 * shortest honest answer to that.
 *
 * **A reduced set is listed against the panel it reduces**, not against
 * itself, for `bandLobes`' reason: the held-back buttons still have places,
 * and a list that simply omitted them would say a rung is a smaller panel
 * rather than the same panel with gaps in it.
 *
 * Its own file rather than the tail of `rail.ts`, which was already at its
 * length limit — and the seam is the honest one: next door is the wave's
 * fields and what editing one does, and this only reads a set.
 */
export function renderControlSetNote(host: HTMLElement | null, set: ControlSet): void {
  if (!host) return;
  host.replaceChildren();
  host.className = "set-roster";
  const base = layoutSet(set);
  for (const player of [1, 2] as const) {
    const col = document.createElement("div");
    col.className = "set-roster-col";
    const h = document.createElement("h4");
    h.textContent = `PLAYER ${player}`;
    col.appendChild(h);
    for (const c of setControls(base, player)) {
      const row = document.createElement("div");
      const on = setHas(set, c.id);
      row.className = on ? "set-roster-row" : "set-roster-row off";
      const mark = document.createElement("span");
      mark.className = "set-roster-mark";
      // A tick and a cross rather than presence and absence: a row that was
      // simply missing would read as a shorter panel, and the one thing the
      // ladder promises is that nothing moves when a button arrives.
      mark.textContent = on ? "●" : "○";
      const label = document.createElement("span");
      label.className = "set-roster-name";
      label.textContent = c.label;
      row.append(mark, label);
      col.appendChild(row);
    }
    host.appendChild(col);
  }
}
