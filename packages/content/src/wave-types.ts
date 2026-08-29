import type { BossEntry, Color, PodEntry } from "@neon-spore/sim";
import type { ControlSetId } from "./control-sets.js";
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

/**
 * The help a wave carries: a concrete instruction about a control or a concept
 * the pair is about to meet for the first time.
 *
 * **An object with named parts, and that is the whole point of it being one.**
 * The owner has said plainly that a guide may one day be more than words — a
 * guidance animation, a picture, a scene stepped through — and that it will be
 * built one piece at a time. So a guide is never three loose fields on `Wave`
 * and never a bare string: motion arrives here as *another key beside these
 * three*, and no wave file has to move to make room for it. Anything added is
 * optional, so the sixteen waves that carry words today keep carrying only
 * words.
 *
 * **Every guide is split, and the split is the point.** Three lines: one both
 * screens carry, and one each. A guide that put all of it on both screens
 * would teach the pair, in the first ten seconds of the game, that they do not
 * need to talk to each other — which is the one thing this game cannot survive
 * (`docs/spec/roles.md`). So neither half is ever a restatement of the other,
 * and neither is optional: `both` says what the thing *is*, and the two halves
 * say what each player does about it. Read alone, a guide is half an
 * instruction.
 *
 * Keep the lines short. They are read on a phone, under a beat, by someone who
 * is about to have to say them out loud. The heading is the wave's own `name`,
 * so a guide never carries a title of its own.
 */
export interface WaveGuide {
  /** The line both screens carry. Never the whole of it. */
  both: string;
  /** Player 1's half: the cannon, the shield's trigger, the maw. */
  p1: string;
  /** Player 2's half: the shield itself, and the two colours. */
  p2: string;
}

export interface Wave {
  name: string;
  /** The one-sentence test. Not flavour text — the reason the wave exists. */
  sentence: string;
  /**
   * The help this wave opens on, after its introduction, or nothing.
   *
   * Written directly under `sentence` because that is where it is read: a
   * wave's three lines of prose are its name, why it exists, and what the pair
   * has to be told before it starts. A wave that introduces nothing new writes
   * no guide at all, and padding one with a guide is the same failure as
   * padding it with entries.
   *
   * The first wave to carry a creature, a pod kind, a boss or a mechanic must
   * have one — `packages/content/test/waves.test.ts` is the invariant, and
   * `.claude/skills/new-creature` is where the next session is told so.
   */
  guide?: WaveGuide;
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
  /**
   * Which panel the pair plays this wave on, if not the ordinary one.
   *
   * A **whole** panel, both players at once, and never a combination — that is
   * the entire content of `control-sets.ts` and the reason this is one name
   * rather than a list of buttons. A wave that says nothing is played on
   * `DEFAULT_CONTROL_SET_ID`, so the field stays the field unless a wave has a
   * reason to be something else.
   *
   * Beside `boss` on purpose. Both fields say the same kind of thing — this
   * wave is not the ordinary thing — and both are read before the wave starts,
   * identically on both devices, so neither costs the tick or the hash
   * anything.
   */
  controls?: ControlSetId;
}
