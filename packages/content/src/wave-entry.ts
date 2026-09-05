import type { Color, CrawlerSide, GhostPath, RockSize } from "@neon-spore/sim";
import type { WaveKind } from "./mechanics.js";

/**
 * **What one arrival is**, and the half of a wave that grows.
 *
 * Cut out of `wave-types.ts` when THE CRAWLER's two fields took that file past
 * its 250-line limit, and along the seam that file's own header already draws
 * between a list and its shapes — said one level down. Next door is what a
 * *wave* is: a name, a sentence, a guide, a panel, a boss. That shape has not
 * changed in a long time. This one has gained a field for nearly every
 * creature added since THE LURE, and each of them arrives with a paragraph
 * arguing why it is a field rather than another kind in the bestiary.
 *
 * Columns are authored against a 7-column field and remapped by `buildQueue`;
 * `beat` is the offset from the start of the wave. `wave-types.ts` re-exports
 * this, so nothing that already reached for a `WaveEntry` had to move.
 */
export interface WaveEntry {
  beat: number;
  col: number;
  /**
   * Named here for a kind the colour cannot name on its own. That used to be
   * one case — a rock, or a kind that carries no colour at all (`wisp`) —
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
  /**
   * How many beads a `strand` arrives with: `2`..`5`. Absent on every other
   * kind, and absent on a strand left at the default — so a thread nobody
   * lengthened serialises exactly as it always did, the same arrangement
   * `size` and `path` make above.
   *
   * **A field and not five kinds**, and the asymmetry `size` argues for said
   * about a count instead of a width: a thread of two and a thread of five are
   * not two creatures — the pair says exactly the same two sentences about
   * both, and what changes is how many times they have to say them. Five kinds
   * in the bestiary would teach five words for one thing.
   *
   * The clamp is `strandBeadCount`'s and is never re-derived here, because the
   * field's own width has a say in it.
   */
  beads?: number;
  /**
   * How many segments a `crawler` arrives with between its two ends: `2`..`7`.
   * Absent on every other kind, and absent on a worm left at the default.
   *
   * **A field and not six kinds**, the asymmetry `size` argues for said about
   * a body's length: a worm of two segments and a worm of seven are not two
   * creatures — the pair reads the same order off both and does the same two
   * things about it — and what changes is how many times they have to change
   * control before the far wall. The clamp is `crawlerSegmentCount`'s.
   */
  segments?: number;
  /**
   * Which wall a `crawler` comes over: `"left"`, `"right"`, or absent for *the
   * wall its own column is nearest*, which is what `crawlerSide` answers.
   * Absent on every other kind.
   *
   * The default reads the map — a worm placed on the left of the director's
   * grid comes over the left edge — and the field is there for when the two
   * facts must differ, because the column is also what the radar strip
   * announces.
   */
  side?: CrawlerSide;
}
