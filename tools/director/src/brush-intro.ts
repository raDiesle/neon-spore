import { type Wave, waveIntroduces } from "@neon-spore/content";
import { brushArtImage } from "./brush-art.js";
import { bindBrushCard } from "./brush-tooltip.js";
import { jumpWaveIndex } from "./brush-wave.js";
import { BRUSHES, type Brush } from "./brushes.js";
import {
  CONTROL_BRUSHES,
  CONTROL_KIND,
  type ControlBrush,
  controlGestureOf,
  controlWaveId,
} from "./control-brushes.js";
import { brushOf } from "./query.js";
import { silhouette } from "./silhouette.js";
import { whenSeen } from "./when-seen.js";

/**
 * THE BRUSH A WAVE IS FIRST TO CARRY, AS ITS PICTURE.
 *
 * Asked twice: DOCUMENTATION › WAVES › EVERY WAVE draws it in its NEW column
 * (`waves-table.ts`), and the wave list draws it at the right end of a group's
 * head — the owner, 17 October 2026: *show next to each wave to the right the
 * brush icon if on the parent, if it introduces it new* (`rail-list.ts`). One
 * mapping from `waveIntroduces`'s words to a brush, so the two cannot drift.
 */

/**
 * The brush that paints a thing `waveIntroduces` names, if one does. A limpet
 * or a leech is a fault's brush; a worn mechanic — a mount, a chute — is
 * painted by none. A blister is none either: content knows it as one kind,
 * but each gesture is a brush of its own, so `freshControls` says which.
 */
export function introducedBrush(thing: string): Brush | undefined {
  const brushes = new Set<string>(BRUSHES.map((b) => b.brush));
  // Every speed of rock is the one ROCK brush (`brush-lists.ts`).
  if (/^meteor/.test(thing)) return "rock";
  if (thing === CONTROL_KIND) return undefined;
  const fault = /^(.*)Fault$/.exec(thing);
  for (const id of [fault ? `fault:${fault[1]}` : thing, `fault:${thing}`]) {
    if (brushes.has(id)) return id as Brush;
  }
  return undefined;
}

const controlsOf = (wave: Wave): ControlBrush[] =>
  wave.entries.flatMap((e) => (e.kind === CONTROL_KIND ? [brushOf(e) as ControlBrush] : []));

/**
 * The CONTROLS brushes the wave at `index` introduces: each it carries that no
 * wave before it did, and the one whose own wave it is (`controlWaveId`) —
 * THE BLISTER already sends a TAP and a SWIPE, and their own waves teach them.
 * `waveIntroduces` sees one kind, the blister, so only THE BLISTER brought
 * anything and every control's group opened with no picture: the owner,
 * 18 October 2026, *why there is no icon for parent wave introduction of
 * several "controls" waves … there is only for "swipe"*.
 */
export function freshControls(waves: readonly Wave[], index: number): ControlBrush[] {
  const wave = waves[index];
  if (!wave) return [];
  const mine = new Set(controlsOf(wave));
  for (let i = 0; i < index && mine.size; i++) {
    for (const brush of controlsOf(waves[i]!)) mine.delete(brush);
  }
  const own = CONTROL_BRUSHES.find((b) => controlWaveId(controlGestureOf(b)!) === wave.id);
  return own ? [...new Set([own, ...mine])] : [...mine];
}

/** Every brush the wave at `index` is first to carry, each once: the brushes
 * of what `waveIntroduces` names, then its fresh controls. */
export function introducedBrushes(waves: readonly Wave[], index: number): Brush[] {
  const named = waveIntroduces(waves, index).flatMap((t) => introducedBrush(t) ?? []);
  return [...new Set<Brush>([...named, ...freshControls(waves, index)])];
}

/**
 * One span per brush the wave at `index` brings, each filled when it is about
 * to be seen (`whenSeen`) the way the palette fills its own button: the
 * brush's picture, else its outline, else — a fault, which has no body — its
 * word in a box: the owner, 18 October 2026, *also do for "faul" brush type.
 * you can use the text and have in the box*. Two words that are one
 * brush — two speeds of rock — are one picture. A panel is not a brush; the ⎈
 * mark says that too.
 *
 * Hovered, a chip opens the palette's own card for its brush (`brush-tooltip.ts`)
 * rather than a `title` — the owner, 17 October 2026: *when i mouse hover the
 * icon on the "waves" section list icon of a brush, i want tooltip same as in
 * "brush" section*. The card ends "Ctrl-click to open it", so `open`, given, is
 * what a Ctrl- or ⌘-click on the chip does with the wave it names — which is
 * not always the row's own: a CONTROLS brush lands on its control's own wave.
 */
export function introArt(
  waves: readonly Wave[],
  index: number,
  px: number,
  open?: (index: number) => void,
): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const brush of introducedBrushes(waves, index)) {
    const chip = document.createElement("span");
    chip.className = "intro-art";
    bindBrushCard(chip, brush);
    if (open)
      chip.addEventListener("click", (e) => {
        const to = jumpWaveIndex(waves, brush);
        if (!(e.ctrlKey || e.metaKey) || to === undefined) return;
        e.stopPropagation();
        open(to);
      });
    whenSeen(chip, () => {
      const art = brushArtImage(brush, px);
      const look = BRUSHES.find((b) => b.brush === brush);
      if (art) chip.replaceChildren(art);
      else if (look?.subjects.length)
        chip.replaceChildren(...look.subjects.map((s) => silhouette(s, look.stroke, px)));
      else if (look) {
        chip.classList.add("intro-word");
        chip.textContent = look.label;
      } else chip.remove();
    });
    out.push(chip);
  }
  return out;
}
