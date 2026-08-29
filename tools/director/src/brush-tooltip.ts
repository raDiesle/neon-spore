import { type MechanicId, mechanicsInWave, WAVES } from "@neon-spore/content";
import { BRUSH_KIND, BRUSHES, type Brush } from "./brushes.js";

/**
 * The mechanic id a brush paints, for every brush that paints one at all —
 * `BRUSH_KIND` (`brushes.ts`) widened to include the three pod kinds it
 * leaves out, since its only consumer there (`categoryOf`) takes a
 * `CreatureKind` and a pod is not one. `ERASE` paints nothing and carries no
 * entry.
 */
const BRUSH_MECHANIC: Partial<Record<Brush, MechanicId>> = {
  ...BRUSH_KIND,
  mend: "mend",
  purge: "purge",
  ward: "ward",
};

/**
 * The wave that first puts a mechanic on the field, read off the exact
 * derivation `packages/content/test/waves.test.ts` asserts against — `WAVES`
 * walked in order, `mechanicsInWave` asked of each — rather than a second
 * table that could drift from it. `undefined` means no wave carries it yet,
 * which is a real answer and not a missing one.
 */
function firstWave(id: MechanicId): { number: number; name: string } | undefined {
  for (const [i, wave] of WAVES.entries()) {
    if (mechanicsInWave(wave).has(id)) return { number: i + 1, name: wave.name };
  }
  return undefined;
}

/**
 * The hover text for a brush: the wave that first introduces what it paints,
 * named by number and by name since a number alone is hard to hold, or the
 * plain fact that no wave carries it yet. `undefined` for a brush that paints
 * nothing (`ERASE`), which has no such answer to give.
 */
export function brushTooltip(brush: Brush): string | undefined {
  const kind = BRUSH_MECHANIC[brush];
  if (!kind) return undefined;
  const wave = firstWave(kind);
  return wave ? `First in WAVE ${wave.number} · ${wave.name}` : "No wave carries this yet";
}

/**
 * Wires `brushTooltip` onto the palette's buttons as the native `title`
 * attribute — the same mechanism `index.html` already uses for
 * `#briefToggle` and `#keyHelpOpen`, so hovering a brush behaves exactly like
 * hovering either of those. `palette.ts` builds the buttons and gives each
 * one no id or data attribute naming the brush it paints — but it does give
 * each one a `.name` span holding the brush's label, and every label in
 * `BRUSHES` is unique, so that is what this reads. A `MutationObserver`
 * rather than a single pass over the DOM at start-up because the palette
 * rebuilds its buttons from scratch on every wave switch.
 */
export function attachBrushTooltips(container: HTMLElement): void {
  const byLabel = new Map(BRUSHES.map((b) => [b.label, brushTooltip(b.brush)] as const));
  const apply = (): void => {
    for (const button of container.querySelectorAll<HTMLButtonElement>("button.brush")) {
      const label = button.querySelector(".name")?.textContent ?? "";
      const tooltip = byLabel.get(label);
      if (tooltip) button.title = tooltip;
      else button.removeAttribute("title");
    }
  };
  apply();
  new MutationObserver(apply).observe(container, { childList: true, subtree: true });
}
