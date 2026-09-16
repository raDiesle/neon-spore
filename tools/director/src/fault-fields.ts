import type { Wave, WaveFault } from "@neon-spore/content";
import {
  DEFAULT_CONFIG,
  MALFUNCTION_COLORS,
  MALFUNCTION_KINDS,
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
  onChange(handler: (fault: WaveFault | undefined) => void): void;
}

/** What the picker offers, in the order it offers it. `""` is no fault at all. */
const CHOICES = [
  ["", "NONE — the pair keeps both controls"],
  ["cannon", "CANNON — the gun fires itself, player 2 loses both colours"],
  ["shield", "SHIELD — the dome arms itself, player 1 loses the trigger"],
  ["steer", "STEER — the cannon walks itself, player 1 loses the strip"],
  ["codex", "CODEX — the two colours do each other's job and nothing says so"],
  ["handover", "HANDOVER — the two panels change screens for a window mid-wave"],
  ["flip", "FLIP — one screen's field is drawn mirrored; everything is in the other column"],
  ["leech", "LEECH — a body on the cannon; keep the cannon moving or lose the round"],
  ["limpet", "LIMPET — a body on the plate; keep the shield moving or lose the round"],
] as const;

/**
 * The one sentence an author has to hold in their head while composing the
 * arrivals: for the three faults that take a control, which seat still has a
 * strip to aim with and therefore which body the wave can be *about*; for the
 * two that take none, what the pair is left having to say.
 *
 * **LEAK was a seventh choice here until 15 September 2026.** A wave with no
 * lance in it is picked on the control-set row now — STANDARD 5 — because it is
 * a panel and not a fault: nothing hangs over the field, and a gesture the
 * ladder has not handed out is nothing for a seat to aim away from
 * (`content/control-sets-table.ts`).
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
  handover:
    "Both seats keep every button, and the two panels change screens: each phone draws and answers the other seat's half for the window below. Leave the three boxes empty and it plays the game's own numbers. Nobody changes seats on the wire, so a wave with a hand on the field — a grip, a pull, a tap — is the wrong wave for it.",
  flip: "One seat's field is drawn about its own middle: a body on their left wall is really on the right one, at the same row and the same speed. Every button on both panels works and neither strip is mirrored — so that seat has to count from the other wall, and the seat with the true picture has to say every column out loud. Pick whose screen is turned below; the other one is told nothing about it.",
  leech:
    "A body is fired at the cannon and sticks there for as long as the pencil is long. Both seats keep every button; what is gone is standing still. A cannon that has not moved for harpoonStillBeats loses the round, and player 2 — who can see the count and cannot move it — is the one who has to keep saying so.",
  limpet:
    "The leech's wave with the seats swapped: the body is fired at the plate, the shield is what has to keep moving, and player 1 is the seat that can see the count and cannot move it.",
};

/**
 * The two boxes a fault's **rows** are authored in, and what each one is for.
 * Beats, like everything else an author reads off the map's rows.
 *
 * They were THE HANDOVER's alone, because it was the only fault that could say
 * when. Every fault is placed on rows since 15 September 2026, so every fault
 * gets them — and `every` went with the change: a wave that wants the panels
 * traded three times places THE HANDOVER three times (`sim/fault-placed.ts`).
 */
const WINDOW_FIELDS = [
  ["fFaultAt", "at", "Enters on beat (blank: the first)"],
  ["fFaultBeats", "beats", "Held for beats (blank: to the end)"],
] as const;

/** Whose screen THE FLIP turns. One or the other, never both: a wave with two
 * turned screens is one where the pair agrees with itself again (`sim/flip.ts`). */
const SEAT_LABEL = [
  ["1", "PLAYER 1 — the pilot's screen is the mirror"],
  ["2", "PLAYER 2 — the navigator's screen is the mirror"],
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
  const handlers: ((fault: WaveFault | undefined) => void)[] = [];
  if (!host) return { render: () => {}, onChange: () => {} };

  const kind = select("fFaultKind", "Malfunction");
  const colour = select("fFaultColor", "Runaway ammunition");
  const seat = select("fFaultSeat", "Turned screen");
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
  for (const [value, text] of SEAT_LABEL) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    seat.field.appendChild(opt);
  }
  host.replaceChildren(kind.row, colour.row, seat.row, ...window.map((w) => w.row), note);

  const read = (): WaveFault | undefined => {
    const k = kind.field.value;
    // `leak` was here until 15 September 2026 and is a panel now, so it is
    // picked on the wave's control-set row rather than brushed on as a
    // fault: STANDARD 5 (`content/control-sets-table.ts`).
    if (!(MALFUNCTION_KINDS as readonly string[]).includes(k)) return undefined;
    // An empty box is not a zero: it is the wave saying nothing, so the first
    // beat and the end of the wave stand (`content/wave-faults.ts`).
    //
    // **Except for a handover placed with no rows**, which would be a wave the
    // panels never come home in. The game's own two numbers stand in for it,
    // which is the job they have left now that the simulation reads neither
    // (`sim/config-malfunction.ts`).
    const fresh = k === "handover";
    const at =
      whole(window[0]?.field.value ?? "") ?? (fresh ? DEFAULT_CONFIG.handoverAtBeat : undefined);
    const beats =
      whole(window[1]?.field.value ?? "") ?? (fresh ? DEFAULT_CONFIG.handoverHoldBeats : undefined);
    return {
      kind: k as MalfunctionKind,
      ...(k === "cannon" ? { color: colour.field.value as MalfunctionColor } : {}),
      ...(k === "flip" ? { seat: seat.field.value === "2" ? (2 as const) : (1 as const) } : {}),
      ...(at === undefined ? {} : { at }),
      ...(beats === undefined ? {} : { beats }),
    };
  };

  const paint = (fault: WaveFault | undefined): void => {
    colour.row.hidden = fault?.kind !== "cannon";
    seat.row.hidden = fault?.kind !== "flip";
    // Every kind is placed on rows now, so the two boxes are hidden only when
    // there is no fault at all to place.
    for (const w of window) w.row.hidden = fault === undefined;
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
  seat.field.addEventListener("change", fire);
  for (const w of window) w.field.addEventListener("change", fire);

  return {
    render(wave) {
      // The first placement, which is what this panel edits — a wave with
      // several is painted on the map (`docs/queue.md`).
      const fault = wave?.faults?.[0];
      kind.field.value = fault?.kind ?? "";
      colour.field.value = fault?.kind === "cannon" ? (fault.color ?? "red") : "red";
      seat.field.value = fault?.kind === "flip" ? String(fault.seat ?? 1) : "1";
      for (const w of window) {
        const had = fault?.[w.key];
        w.field.value = had === undefined ? "" : String(had);
      }
      paint(fault);
    },
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
