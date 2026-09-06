import type { Wave } from "@neon-spore/content";
import {
  MALFUNCTION_COLORS,
  type Malfunction,
  type MalfunctionColor,
  reliefSeat,
} from "@neon-spore/sim";

/**
 * The MALFUNCTION section `rail.ts` shows under the control set: which of the
 * pair's two controls this wave has taken away from them, and what a runaway
 * cannon is loaded with.
 *
 * **Under the panel and not inside it**, which is the whole reason it is a
 * second control rather than four more entries in `CONTROL_SETS`. A set is a
 * whole panel and sets do not compose; a fault changes no button on any panel,
 * only what pressing one does, so it is a fact about the *wave* and it reads
 * the same on every set (`packages/content/src/control-fault.ts`).
 *
 * Its own file rather than a slab inside `rail.ts` because that file is
 * already near its line limit, and this piece — build two selects, read them
 * back as a `Malfunction` or as nothing — is a whole small thing on its own,
 * exactly the cut `guide-fields.ts` made.
 *
 * **The colour row is not drawn at all when the fault is a shield**, rather
 * than drawn and disabled. A dome that arms itself carries no ammunition, and
 * a greyed-out RED beside one would read as a colour it happens to be at —
 * `cell-config.ts` makes the same argument about a shell having no speed.
 */

export interface FaultFields {
  /** Repopulate the fields for the wave now on the stage. */
  render(wave: Wave | undefined): void;
  /** Called with the wave's new fault, or `undefined` when it has none. */
  onChange(handler: (fault: Malfunction | undefined) => void): void;
}

/** What the picker offers, in the order it offers it. `""` is no fault at all. */
const CHOICES = [
  ["", "NONE — the pair keeps both controls"],
  ["cannon", "CANNON — the gun fires itself, player 2 loses both colours"],
  ["shield", "SHIELD — the dome arms itself, player 1 loses the trigger"],
] as const;

const COLOUR_LABEL: Record<MalfunctionColor, string> = {
  red: "RED — every shot",
  cyan: "CYAN — every shot",
  alternating: "ALTERNATING — red, cyan, red, cyan, on the beat",
};

function select(id: string, label: string): { row: HTMLElement; field: HTMLSelectElement } {
  const row = document.createElement("div");
  const tag = document.createElement("label");
  tag.className = "field";
  tag.htmlFor = id;
  tag.textContent = label;
  const field = document.createElement("select");
  field.id = id;
  row.append(tag, field);
  return { row, field };
}

export function bindFaultFields(host: HTMLElement | null): FaultFields {
  const handlers: ((fault: Malfunction | undefined) => void)[] = [];
  if (!host) return { render: () => {}, onChange: () => {} };

  const kind = select("fFaultKind", "Malfunction");
  const colour = select("fFaultColor", "Runaway ammunition");
  const note = document.createElement("p");
  note.className = "note";
  for (const [value, text] of CHOICES) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    kind.field.appendChild(opt);
  }
  for (const value of MALFUNCTION_COLORS) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = COLOUR_LABEL[value];
    colour.field.appendChild(opt);
  }
  host.replaceChildren(kind.row, colour.row, note);

  const read = (): Malfunction | undefined => {
    if (kind.field.value === "cannon") {
      return { kind: "cannon", color: colour.field.value as MalfunctionColor };
    }
    return kind.field.value === "shield" ? { kind: "shield" } : undefined;
  };

  const paint = (fault: Malfunction | undefined): void => {
    const cannon = fault?.kind === "cannon";
    colour.row.hidden = !cannon;
    note.textContent =
      fault === undefined
        ? "This wave is played straight: both seats have every button their panel carries."
        : // The one sentence an author actually has to hold in their head while
          // composing the arrivals: which seat still has a strip to aim with,
          // and therefore which body the wave can be *about*.
          `Player ${reliefSeat(fault)} loses their buttons and gets the relief; player ${
            reliefSeat(fault) === 1 ? 2 : 1
          } still has a strip and has to point the fault somewhere harmless.`;
  };

  const fire = (): void => {
    const fault = read();
    paint(fault);
    for (const h of handlers) h(fault);
  };
  kind.field.addEventListener("change", fire);
  colour.field.addEventListener("change", fire);

  return {
    render(wave) {
      const fault = wave?.malfunction;
      kind.field.value = fault?.kind ?? "";
      colour.field.value = fault?.kind === "cannon" ? fault.color : "red";
      paint(fault);
    },
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
