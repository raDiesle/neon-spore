import type { BossEntry, Color, GhostPath, PodEntry, RockSize } from "@neon-spore/sim";
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
   * Named here for a kind the colour cannot name on its own. That used to be
   * one case — a rock, or a kind that carries no colour at all (`throb`) —
   * and this comment used to say that a kind and a colour never appear
   * together, because naming both would be naming the same thing twice and
   * inviting them to disagree.
   *
   * **THE LURE broke that, and it broke it on purpose.** A lure carries a
   * colour and it is not the colour's own kind: the colour is the *disguise's*
   * — what player 1 is shown, and what player 2 would have fired at if they
   * had not looked — while the kind is what the body actually is. Two facts,
   * not one said twice, and neither can be worked out from the other. So a
   * lure entry names `kind`, `color` and `wears` together, and `queueFromWave`
   * lets an explicit `kind` win over the colour rather than the reverse.
   *
   * `WaveKind` is derived from the `waveNames` flags in `mechanics.ts` rather
   * than written out here. It used to be `RockKind | "runt" | "throb"`, by
   * hand, so a third colourless creature needed this line extended too — and
   * the failure of forgetting was silent: the director's cast would produce an
   * entry naming a kind no wave could carry.
   */
  kind?: WaveKind;
  /**
   * A fixed colour, or null for a kind that carries none.
   *
   * On a lure this is the disguise's colour and never the body's — see `kind`
   * above, and `wears` below, which are the other two thirds of the same
   * authored trap.
   */
  color: Color | null;
  /**
   * Which body a `lure` wears: `"slick"` or `"bulb"`. Absent on everything
   * else.
   *
   * Authored and never rolled. Random would be a second place where the trap
   * is decided, and a wave cannot be composed against a shape its author does
   * not know — the whole cost of this creature is the seconds player 1 spends
   * standing in its column, and those are only expensive if the author knows
   * what else is arriving and when.
   */
  wears?: "slick" | "bulb";
  /**
   * How many tiles wide this rock arrives: `1`, or `2` for one that fills a
   * 2x2 square. Absent on every other kind, and absent on a rock the author
   * left at its ordinary width — a wave written before sizes existed is the
   * same wave.
   *
   * **Speed is the kind and size is a field, and the asymmetry is deliberate.**
   * The five tiers `meteor`…`meteorFastest` already exist, are named in the
   * bestiary and are what a wave says out loud; crossing them with two widths
   * would be ten entries in `CREATURES` to express one new fact. So the width
   * is the fact — see `RockSize` in `packages/sim/src/kinds.ts`, and `spanOf`,
   * which is what everything downstream asks instead of `colSpan`.
   */
  size?: RockSize;
  /**
   * How a `ghost` travels: `"down"`, which is what absent means, or
   * `"across"` for one that prowls a row sideways and dives at the ship when
   * its temper runs out. Absent on every other kind.
   *
   * **The same asymmetry `size` argues for, and for the same reason.** A
   * crossing ghost is not a second creature: the pair does exactly what it
   * does about the plain one — one of them says a column, the other stands in
   * it — and what changes is how long that number stays true. Two kinds in the
   * bestiary would teach the pair two words for one sentence, and would double
   * again the first time a third path existed. So the path is a field.
   */
  path?: GhostPath;
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
