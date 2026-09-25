import { DEFAULT_CONFIG, type RepriseEntry } from "@neon-spore/sim";
import { numberField } from "./boss-cycles.js";
import { el } from "./dom.js";

/**
 * THE REPRISE's panel, which is one number.
 *
 * The shortest editor in the director after THE SPLICE's, and short for the
 * same kind of reason: every body this boss puts on the field is a body the
 * wave's own author already wrote, read back out of the queue and sent again
 * with nothing drawn (`sim/reprise.ts`). So there is no board to paint, no
 * column to place and no health to set — what an author decides is how long a
 * stretch of the wave runs in plain sight before the whole of it comes down
 * again unseen, and everything else about the fight is the wave underneath it.
 *
 * Its own file rather than a branch in `boss.ts`, which is where the cairn's
 * one number still is: that file stood five lines under its limit when this
 * boss arrived, and the rule is to split rather than grow. The note under the
 * field is the part worth having — the number is meaningless without the
 * sentence that says a *stretch* is what gets sent again, and an author
 * reading a bare "beats" spinner would reasonably guess the opposite.
 */
export function renderRepriseEditor(
  panel: HTMLElement,
  boss: RepriseEntry,
  onEdit: () => void,
): void {
  const stack = document.createElement("div");
  stack.className = "boss-fields";
  stack.append(
    numberField(
      "beats before it is sent again",
      4,
      48,
      boss.beat ?? DEFAULT_CONFIG.repriseBeats,
      (v) => {
        boss.beat = v;
        onEdit();
      },
    ),
  );
  panel.appendChild(stack);
  panel.appendChild(
    el(
      "p",
      "note",
      "Everything that arrives in that many beats is then sent down again from " +
        "the top — same bodies, same columns, same spacing — with nothing drawn " +
        "on either screen. The wave's own arrivals wait until it has finished, " +
        "so a longer stretch is a longer thing to remember rather than a " +
        "busier field. The map marks the row each echo falls after.",
    ),
  );
}
