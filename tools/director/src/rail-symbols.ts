import { isRegularWave, type Wave, waveMarksOn } from "@neon-spore/content";
import { MARKS, type MarkId } from "./rail-marks.js";
import { readRemembered, writeRemembered } from "./remembered.js";

/**
 * **THE ROW OF SYMBOLS OVER THE FILTER**: the rail's own four marks, made
 * pressable, so the list can be narrowed to the waves carrying any of them.
 *
 * The owner asked for it on 14 September 2026, with the fault mark that made a
 * fourth: *a compact filter of the wave list by its symbols — either or is
 * enough.* The compactness is the whole constraint. WAVES is a 270 px track
 * and `rail-filter.ts` argues at length that a rail of category buttons, a
 * dropdown or a row of chips is out on its face — every one of them spends
 * width the wave *names* need. Four glyphs at a glyph's own width is about
 * sixty pixels, which is the one shape that fits, and it needs no legend
 * because each glyph is already standing in front of the waves it means.
 *
 * **ORed with each other, ANDed with the field.** Press ♛ and the list is the
 * boss waves; press ⎈ as well and it is both, not the ones that are both. That
 * is the owner's *either or is enough*, and it is also the only reading that
 * makes a second press useful — two marks ANDed is almost always the empty
 * list. Whatever is typed still narrows further, so `♛ + queen` is the boss
 * waves that say queen.
 *
 * Which marks are pressed is remembered across a reload, with the field's
 * text and for the same request (`remembered.ts`).
 *
 * **A fifth press, ≡, for the regular waves** — the owner, 14 October 2026:
 * *a filter in the waves list for regular waves, which do not introduce
 * anything special*. It is the one press that marks the *absence* of the other
 * four, so no row draws it in front of a name: a wave with no glyph is
 * nearly always a regular one, and the press is how to see only those.
 * Whether a wave is regular is content's question (`isRegularWave`), the same
 * rule the curriculum counts with (`docs/spec/wave-curriculum.md`). ORed like
 * the rest — ≡ with ♛ is the regular waves and the boss waves.
 */

/** The press for the regular waves, beside the four marks. */
const REGULAR = ["regular", "≡", "regular"] as const;

/** A press in the row: one of the four marks, or the regular waves. */
export type PressId = MarkId | "regular";

export interface RailSymbols {
  /** Whether this wave carries at least one of the pressed marks. Every wave
   * passes while none is pressed — no marks is not a filter. */
  passes(waves: readonly Wave[], index: number): boolean;
  /** Whether any mark is pressed at all, for the count under the field. */
  active(): boolean;
}

/**
 * Pure: whether a wave answers a set of pressed marks.
 *
 * Its own function so the rule is testable without a document, which is the
 * shape `waveMatches` beside it already has.
 */
export function marksMatch(
  waves: readonly Wave[],
  index: number,
  pressed: ReadonlySet<PressId>,
): boolean {
  if (pressed.size === 0) return true;
  if (pressed.has("regular") && isRegularWave(waves, index)) return true;
  return waveMarksOn(waves, index).some((id) => pressed.has(id));
}

/** Where the pressed marks are kept between loads (`remembered.ts`). */
const MARKS_KEY = "wave-marks";

/**
 * Pure: the pressed marks a stored value names. An id no mark has any more —
 * a stored value outlives the code that wrote it — is dropped, not kept.
 */
export function parsePressed(raw: string | null): Set<PressId> {
  const known = new Set<string>([...MARKS.map(([id]) => id), REGULAR[0]]);
  const pressed = new Set<PressId>();
  for (const id of (raw ?? "").split(",")) if (known.has(id)) pressed.add(id as PressId);
  return pressed;
}

/** Binds the row into `host`. `onChange` is the list's own redraw, the same one
 * the field is given. */
export function bindRailSymbols(host: HTMLElement | null, onChange: () => void): RailSymbols {
  const pressed = parsePressed(readRemembered(MARKS_KEY));
  if (!host) return { passes: () => true, active: () => false };

  for (const [id, glyph, word] of [...MARKS, REGULAR]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mark-toggle";
    button.textContent = glyph;
    // The word the field would have taken for the same thing, so the row
    // teaches the vocabulary rather than replacing it (`rail-filter.ts`).
    button.title =
      id === "regular"
        ? "Only regular waves — nothing new, no guide, no boss"
        : `Only waves with a ${word}`;
    button.classList.toggle("on", pressed.has(id));
    button.addEventListener("click", () => {
      if (pressed.has(id)) pressed.delete(id);
      else pressed.add(id);
      button.classList.toggle("on", pressed.has(id));
      writeRemembered(MARKS_KEY, [...pressed].join(","));
      onChange();
    });
    host.appendChild(button);
  }

  return {
    passes: (waves, index) => marksMatch(waves, index, pressed),
    active: () => pressed.size > 0,
  };
}
