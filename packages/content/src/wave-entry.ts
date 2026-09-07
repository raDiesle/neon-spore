import type { Color, CrawlerSide, GhostPath, RockCross, RockSize } from "@neon-spore/sim";
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
   * same wave. **Ordinary is the kind's own width and not the number one**: a
   * torch is two tiles by default, so a torch an author narrows carries
   * `size: 1` and a torch left alone carries nothing.
   *
   * The torch has both widths for a reason the coil made unavoidable: when a
   * dome comes off, what is left is a rock at a torch's speed standing in the
   * single column the dome covered (`sim/coil.ts`), and that is a body the
   * game now draws often enough that a wave should be able to place one
   * directly. It is the same creature at either width — same speed, same tail,
   * same answer — and what changes is how much of the hull one plate covers.
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
   * How many beats a `beatbox` asks for. Absent on every other kind, and
   * absent on a box left at the default — so a wave nobody tuned serialises
   * exactly as it always did, the same arrangement `size`, `path` and `beads`
   * make above.
   *
   * **A field and not one kind per count**, and the asymmetry `beads` argues
   * for said about a rhythm: a box asking for two beats and one asking for
   * four are not two creatures — the pair says exactly the same sentence about
   * both, and the number in it is what changes. That is in fact the *point* of
   * the creature, so kinds here would be the worst version of this mistake in
   * the bestiary.
   *
   * The clamp is `beatboxOnSpawn`'s and is never re-derived here, because the
   * field's own height has a say in it: a box cannot ask for more beats than
   * its fall is long.
   */
  beats?: number;
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
  /**
   * How many rows a `balloon` climbs a beat, and how many lanes it takes to
   * the side on the same beat — one number, because the path is a diagonal and
   * a diagonal is the two being equal. Absent on every other kind, and absent
   * on a balloon left at the shipped speed, so a wave that authors nothing
   * serialises exactly as it always did.
   *
   * **A field and not a kind per speed**, the asymmetry `size` argues for said
   * about a clock: a slow balloon and a fast one are not two creatures — the
   * pair says exactly the same sentence about both, *which one, now* — and
   * what changes is how long they have to say it in. Five kinds in the
   * bestiary would teach five words for one thing, which is the mistake the
   * five meteor tiers were already the argument against.
   *
   * The default is `balloonRiseRows`' and is never re-derived here.
   */
  rise?: number;
  /**
   * Which columns THE FENCE is open in, authored in the same seven columns
   * every wave is written in and remapped by `queueFromWave`. Absent on every
   * other kind, and absent on a wall with **one** gap — which is the cell the
   * author painted it in, so a wall placed in column three has its way through
   * at column three and the map reads the way it looks.
   *
   * **A list on the entry and a bitmask on the body** (`Creature.fenceGaps`).
   * An author names places, in the order they were painted; the field asks
   * *is this column open* of one column on every beat, and `fenceMask` is the
   * one crossing between the two shapes.
   *
   * **A field and not a kind per shape of wall**, the asymmetry `size` argues
   * for said about a hole: a wall with one gap and a wall with two are not two
   * creatures — the pair says exactly the same sentence about both, a number
   * out loud — and what changes is how much being wrong costs. Two kinds in
   * the bestiary would teach two words for one thing, and it would double
   * again with every gap.
   */
  gaps?: number[];
  /**
   * Where this wall is **cracked**, one list of authored columns per colour a
   * cannon can load. A crack is the only column a bolt opens, and the colour
   * naming the list is the only bolt that opens it (`sim/fence-crack.ts`).
   *
   * Absent on every other kind, and absent on a wall the author left
   * uncracked — except a wall with **no gaps at all**, which `queueFromWave`
   * gives one red crack in the cell it was painted in, exactly as it gives an
   * ungapped wall one gap there. A wall nobody can pass and nobody can cut is
   * a price with a picture on it rather than a creature.
   *
   * **Two lists rather than one list of pairs**, and the reason is the file
   * the director writes: an entry is serialised on one line, and
   * `{ col: 3, color: "red" }` inside it puts a fence past the formatter's
   * width and out of the round trip `serialize.test.ts` holds. Two lists read
   * exactly like `gaps` — a row of columns — which is also how the brush
   * offers them: one chip per column, cycling dark, red, cyan.
   */
  cracksRed?: number[];
  cracksCyan?: number[];
  /**
   * Which way this **rock** crosses the field instead of falling down its
   * lane: `-1` to the left, `1` to the right, absent for a rock that holds the
   * column it was painted in. Meaningless on every kind that already moves by
   * a rule of its own, and `rockMayCross` is the list of kinds that may take
   * one.
   *
   * **A field and not a kind per route**, the asymmetry `size` argues for said
   * about where a rock goes: a rock crossing row four and a rock coming
   * straight down are not two creatures — the pair says exactly the same
   * sentence about both, a column out loud, and the shield stands in it — and
   * what changes is how long that column stays the right one. Five tiers
   * crossed with three routes would be fifteen entries in the bestiary to
   * express one fact (`sim/rock-cross.ts`).
   */
  cross?: RockCross;
  /**
   * The row a crossing rock walks along, which is also the row it falls to
   * before it starts. Absent means the top of the field, and it says nothing
   * about a rock that does not cross.
   *
   * The one coordinate the director's map cannot show — that map is beats down
   * and columns across — so it is asked for in the panel above the map, beside
   * the same two fields a pod has had since THE CLAW (`PodEntry.row`).
   */
  row?: number;
}
