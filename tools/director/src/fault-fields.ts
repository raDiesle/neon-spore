import type { Wave } from "@neon-spore/content";
import {
  MALFUNCTION_COLORS,
  type Malfunction,
  type MalfunctionColor,
  type MalfunctionKind,
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
 *
 * **Every kind is offered.** It named three while the simulation had four: THE
 * CODEX shipped without a row here, so the only way to put one on a wave was to
 * write the field by hand in `waves/act-8.ts` — an editor that cannot reach a
 * rule the game has. The note is a total map over `MalfunctionKind` now, so a
 * sixth fault is a build error in this file rather than a kind nobody can pick.
 */

/** A whole number an author typed, or nothing at all for an empty box. */
function whole(raw: string): number | undefined {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isFinite(n) && n >= 1 ? Math.floor(n) : undefined;
}

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
  ["steer", "STEER — the cannon walks itself, player 1 loses the strip"],
  ["codex", "CODEX — the two colours do each other's job and nothing says so"],
  ["handover", "HANDOVER — the two panels change screens for a window mid-wave"],
  ["leak", "LEAK — the cannon lobe fills nothing, so the wave has no lance in it"],
] as const;

/**
 * The one sentence an author has to hold in their head while composing the
 * arrivals: for the three faults that take a control, which seat still has a
 * strip to aim with and therefore which body the wave can be *about*; for the
 * three that take none, what the pair is left having to say.
 */
const NOTE: Record<MalfunctionKind, string> = {
  cannon:
    "Player 2 loses both colours and gets nothing back; player 1 still has a strip and has to point the fault somewhere harmless.",
  shield:
    "Player 1 loses the trigger and gets nothing back; player 2 still has a strip and has to park the dome somewhere harmless.",
  steer:
    "Player 1 loses the cannon strip and gets nothing back; the cannon walks a column a beat, wall to wall, and player 2 fires from wherever it is.",
  codex:
    "Both seats keep every button. While the key is over, a bolt fired red kills what cyan kills — and the bands that say which way round it is are drawn on the pilot's screen alone.",
  leak: "Both seats keep every button and every tap fires. The hold is what is gone: the lobe fills nothing all wave, so there is no lance — a column with three of one colour standing in it is three shots and three beats, which is the arrival worth composing against.",
  handover:
    "Both seats keep every button, and the two panels change screens: each phone draws and answers the other seat's half for the window below. Leave the three boxes empty and it plays the game's own numbers. Nobody changes seats on the wire, so a wave with a hand on the field — a grip, a pull, a tap — is the wrong wave for it.",
};

/** The three boxes THE HANDOVER's window is authored in, and what each one is
 * for. Beats, like everything else an author reads off the map's rows. */
const WINDOW_FIELDS = [
  ["fFaultAt", "at", "Trades on beat"],
  ["fFaultBeats", "beats", "Held for beats"],
  ["fFaultEvery", "every", "And again every (blank: once)"],
] as const;

const COLOUR_LABEL: Record<MalfunctionColor, string> = {
  red: "RED — every shot",
  cyan: "CYAN — every shot",
  alternating: "ALTERNATING — red, cyan, red, cyan, on the beat",
};

/** A number an author may leave empty, which is what "the game's own" means
 * here — the arm carries no field at all and `handover.ts` falls back. */
function number(id: string, label: string): { row: HTMLElement; field: HTMLInputElement } {
  const row = document.createElement("div");
  const tag = document.createElement("label");
  tag.className = "field";
  tag.htmlFor = id;
  tag.textContent = label;
  const field = document.createElement("input");
  field.id = id;
  field.type = "number";
  field.min = "1";
  row.append(tag, field);
  return { row, field };
}

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
  const window = WINDOW_FIELDS.map(([id, key, label]) => ({ key, ...number(id, label) }));
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
  host.replaceChildren(kind.row, colour.row, ...window.map((w) => w.row), note);

  const read = (): Malfunction | undefined => {
    const k = kind.field.value;
    if (k === "cannon") return { kind: "cannon", color: colour.field.value as MalfunctionColor };
    if (k === "handover") {
      // An empty box is not a zero: it is the wave saying nothing, so the game's
      // own number stands (`sim/handover.ts`).
      const at = whole(window[0]?.field.value ?? "");
      const beats = whole(window[1]?.field.value ?? "");
      const every = whole(window[2]?.field.value ?? "");
      return {
        kind: "handover",
        ...(at === undefined ? {} : { at }),
        ...(beats === undefined ? {} : { beats }),
        ...(every === undefined ? {} : { every }),
      };
    }
    if (k === "shield" || k === "steer" || k === "codex" || k === "leak") return { kind: k };
    return undefined;
  };

  const paint = (fault: Malfunction | undefined): void => {
    colour.row.hidden = fault?.kind !== "cannon";
    for (const w of window) w.row.hidden = fault?.kind !== "handover";
    note.textContent =
      fault === undefined
        ? "This wave is played straight: both seats have every button their panel carries."
        : NOTE[fault.kind];
  };

  const fire = (): void => {
    const fault = read();
    paint(fault);
    for (const h of handlers) h(fault);
  };
  kind.field.addEventListener("change", fire);
  colour.field.addEventListener("change", fire);
  for (const w of window) w.field.addEventListener("change", fire);

  return {
    render(wave) {
      const fault = wave?.malfunction;
      kind.field.value = fault?.kind ?? "";
      colour.field.value = fault?.kind === "cannon" ? fault.color : "red";
      for (const w of window) {
        const had = fault?.kind === "handover" ? fault[w.key] : undefined;
        w.field.value = had === undefined ? "" : String(had);
      }
      paint(fault);
    },
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
