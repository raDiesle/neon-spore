import { BRIEFINGS, mechanicsInWave, type Wave } from "@neon-spore/content";
import { BRIEFING_SUBJECTS, type BriefingId } from "@neon-spore/sim";
import { cardFirstWave } from "./card-waves.js";

/**
 * The dropdown `rail.ts` shows beside CONTROL SET: which card a wave raises
 * when it first teaches something, overriding `openBriefings`'s own
 * derivation (`docs/queue.md`, "a wave may name the card it teaches"). Its
 * own file rather than a slab inside `rail.ts` because that file is already
 * at the line limit, and this piece — build the element, list what a wave
 * may claim, read back what was picked — is a whole small thing on its own.
 */

/**
 * What this wave could plausibly claim the card for: a subject it actually
 * contains (`mechanicsInWave`, the same translation `openBriefings` derives
 * from), that no *other* wave already raises first over the shipped list
 * (`cardFirstWave`). Its own subject stays offered even if it is the one
 * holding it, so picking it does not make it vanish from its own dropdown.
 *
 * Reads the shipped `WAVES`, not the caller's draft — the same asymmetry
 * `rail.ts`'s boss and control-set marks already accept: this is one editing
 * session's unsaved draft, and "taken" is a question about the wave order
 * that ships.
 */
function availableCards(wave: Wave, waveIndex: number): BriefingId[] {
  const contains = mechanicsInWave(wave);
  const taken = cardFirstWave();
  const options: BriefingId[] = [];
  for (const id of BRIEFING_SUBJECTS) {
    if (id === "opening") continue;
    if (!contains.has(id)) continue;
    const owner = taken.get(id);
    if (owner !== undefined && owner !== waveIndex) continue;
    options.push(id);
  }
  return options;
}

export interface CardPicker {
  /** Repopulate the options and the selected value for the current wave. */
  render(wave: Wave | undefined, waveIndex: number): void;
  /** Called with the newly picked card (or `undefined`, for "derive it"). */
  onChange(handler: (card: Exclude<BriefingId, "opening"> | undefined) => void): void;
}

/**
 * Built and inserted here rather than declared in `index.html` — that file
 * belongs to another lane running alongside this one — right after `anchor`,
 * which `rail.ts` passes as the CONTROL SET "why" line: the other field that
 * says "this wave is not the ordinary thing" and is resolved through one
 * name rather than a combination.
 */
export function bindCardPicker(anchor: HTMLElement | null): CardPicker {
  let field: HTMLSelectElement | null = null;
  let why: HTMLElement | null = null;
  if (anchor) {
    const wrap = document.createElement("div");
    const label = document.createElement("label");
    label.className = "field";
    label.setAttribute("for", "fCard");
    label.textContent = "CARD — opens on first hit, or derive it";
    field = document.createElement("select");
    field.id = "fCard";
    why = document.createElement("p");
    why.className = "note";
    wrap.append(label, field, why);
    anchor.insertAdjacentElement("afterend", wrap);
  }

  const listeners: ((card: Exclude<BriefingId, "opening"> | undefined) => void)[] = [];
  field?.addEventListener("change", () => {
    const picked = field?.value ?? "";
    const card = picked === "" ? undefined : (picked as Exclude<BriefingId, "opening">);
    for (const listen of listeners) listen(card);
  });

  return {
    render(wave, waveIndex) {
      if (field) {
        field.replaceChildren();
        const none = document.createElement("option");
        none.value = "";
        none.textContent = "— derive it —";
        field.appendChild(none);
        for (const id of wave ? availableCards(wave, waveIndex) : []) {
          const opt = document.createElement("option");
          opt.value = id;
          opt.textContent = BRIEFINGS[id].title;
          field.appendChild(opt);
        }
        field.value = wave?.card ?? "";
      }
      if (why) {
        why.textContent = wave?.card
          ? `Opens on "${BRIEFINGS[wave.card].title}" instead of whatever this wave would otherwise first teach.`
          : "Raises whatever this wave first introduces — the default for every wave that names nothing.";
      }
    },
    onChange(handler) {
      listeners.push(handler);
    },
  };
}
