import { stepHex, stepLabel } from "@neon-spore/render";
import { MIRROR_STEPS, type MirrorEntry } from "@neon-spore/sim";

/**
 * THE MIRROR's rounds, edited as what they are: a list of lists of controls.
 *
 * The whole boss is this data — how many rounds it takes to break it follows
 * from how many are written here, and so does how long the fight is. There is
 * no difficulty knob beside it on purpose: an author who wants a harder mirror
 * writes a longer sequence, which is a thing they can read back.
 */

function button(label: string, hex: string | null, onClick: () => void): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  if (hex) el.style.borderColor = hex;
  if (hex) el.style.color = hex;
  el.addEventListener("click", onClick);
  return el;
}

/** One round: the steps it holds, then the six buttons that add another. */
function roundRow(boss: MirrorEntry, index: number, onEdit: () => void): HTMLElement {
  const steps = boss.rounds[index] ?? [];
  const row = document.createElement("div");
  row.className = "simon-round";

  const head = document.createElement("div");
  head.className = "simon-head";
  const title = document.createElement("b");
  title.textContent = `ROUND ${index + 1}`;
  head.append(
    title,
    button("− ROUND", null, () => {
      boss.rounds.splice(index, 1);
      onEdit();
    }),
  );
  row.appendChild(head);

  const chips = document.createElement("div");
  chips.className = "simon-chips";
  for (const [i, step] of steps.entries()) {
    // A chip is its own eraser: correcting a sequence is one click, the same
    // bargain the grid's brushes make.
    chips.appendChild(
      button(stepLabel(step), stepHex(step), () => {
        steps.splice(i, 1);
        onEdit();
      }),
    );
  }
  if (steps.length === 0) {
    const empty = document.createElement("span");
    empty.className = "note";
    empty.textContent = "empty — a round with no steps is answered by doing nothing";
    chips.appendChild(empty);
  }
  row.appendChild(chips);

  const add = document.createElement("div");
  add.className = "simon-add";
  for (const step of MIRROR_STEPS) {
    add.appendChild(
      button(`+ ${stepLabel(step)}`, null, () => {
        steps.push(step);
        boss.rounds[index] = steps;
        onEdit();
      }),
    );
  }
  row.appendChild(add);
  return row;
}

/** The whole editor, appended to the boss panel. */
export function renderSimonEditor(panel: HTMLElement, boss: MirrorEntry, onEdit: () => void): void {
  const rule = document.createElement("p");
  rule.className = "note";
  rule.textContent =
    "It performs a round at its own ship, then the pair performs it back. " +
    "A wrong step throws a rock into the cannon's column and asks the same " +
    "round again; a full answer breaks the mirror by one round's share, so " +
    "the last round written here is the one that brings it down.";
  panel.appendChild(rule);

  const list = document.createElement("div");
  list.className = "simon-rounds";
  for (let i = 0; i < boss.rounds.length; i++) {
    list.appendChild(roundRow(boss, i, onEdit));
  }
  panel.appendChild(list);

  panel.appendChild(
    button("+ ROUND", null, () => {
      boss.rounds.push([]);
      onEdit();
    }),
  );

  const trap = document.createElement("p");
  trap.className = "note";
  trap.textContent =
    "A pod placed on this wave is bait: taking it in is a SUCK, and a SUCK " +
    "the sequence did not ask for is a wrong step.";
  panel.appendChild(trap);
}
