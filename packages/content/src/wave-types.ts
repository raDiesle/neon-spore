import type { BossEntry, Color, PodEntry } from "@neon-spore/sim";
import type { WaveKind } from "./mechanics.js";

/**
 * What a wave is made of.
 *
 * Its own file, and not the head of `waves.ts`, because that file is a *list*
 * and the list is the thing that grows — every wave anybody adds costs it a
 * dozen lines, and it went over 250 the day two lanes added one each. The
 * shapes here were the first thing scrolled past and the last thing to change,
 * which makes them the right half to move. The director rebuilds only the
 * array and keeps everything above it byte for byte (`serialize.ts`), so what
 * stands above the array is free to be short.
 *
 * Waves are data, never code. Columns are authored against a 7-column field
 * and remapped by `buildQueue`; `beat` is the offset from the start of the wave.
 *
 * Every wave must pass the one-sentence test (docs/spec/wave-design.md):
 * if `sentence` cannot be written, the wave is padding and gets cut.
 */
export interface WaveEntry {
  beat: number;
  col: number;
  /**
   * Named here only for a kind that carries no colour — a rock, or one of the
   * two kinds that carry none on purpose (`runt`, `throb`). A living creature
   * that *has* a colour never names its kind here: it follows from the colour
   * instead (`kindForColor`), so a wave with `color` set never also writes
   * `kind` — naming both would be naming the same thing twice and inviting
   * them to disagree.
   *
   * `WaveKind` is derived from the `waveNames` flags in `mechanics.ts` rather
   * than written out here. It used to be `RockKind | "runt" | "throb"`, by
   * hand, so a third colourless creature needed this line extended too — and
   * the failure of forgetting was silent: the director's cast would produce an
   * entry naming a kind no wave could carry.
   */
  kind?: WaveKind;
  /** A fixed colour, or null for a kind that carries none. */
  color: Color | null;
}

export interface Wave {
  name: string;
  /** The one-sentence test. Not flavour text — the reason the wave exists. */
  sentence: string;
  /** Shown to both players on first play. */
  hint: string;
  entries: WaveEntry[];
  /**
   * Pods left hanging in the field. Their own list, because a pod is not an
   * enemy: it is never cleared and it never blocks the end of the wave. Columns
   * are authored against the same 7-column field as `entries`; the row is
   * absolute, and a pod never hangs on the hull row.
   */
  pods?: PodEntry[];
  /**
   * Which boss the wave carries, if any. Three of the four are the whole
   * encounter and their waves are otherwise empty; THE VANE only bends what
   * the wave sends, so its wave is the one that has to have entries in it too
   * (`bossFillsWave`).
   */
  boss?: BossEntry;
}
