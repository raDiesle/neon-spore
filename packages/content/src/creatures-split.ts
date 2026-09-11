import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings: a name that is not a `CreatureKind` collapses
 * to `never` and the key becomes a build error, so this list cannot fall
 * behind a rename in `creature-kinds.ts`.
 */
type SplitKind = Extract<CreatureKind, "dart" | "wisp" | "ghost" | "countdown">;

/**
 * The four bodies **one seat cannot see whole**, and that wear nothing to do
 * it: a dart whose next diagonal is drawn on one screen only, a wisp that
 * stands on a tile only one of them is shown, a ghost the pilot never sees at
 * all, a count only the pilot can read. What splits them is where the information is, not what is laid over
 * them — so `living-look.ts` answers for them the way it answers for a slick,
 * and there is no `wornKind` to resolve.
 *
 * Split out of `creatures-table.ts` when THE FENCE brought that file to exactly
 * its 250-line limit and the next creature would not have fitted at all. The
 * seam is the one `render/comms.ts` and the bestiary already read as a group.
 * Two more belong to it — the lure and the veil — and they stay next door in
 * `creatures-worn.ts`, because a disguise and a cloud are *how* those two are
 * split and that file is the argument for the costume.
 *
 * `CREATURES` names each of these one by one rather than spreading the object,
 * so the table next door still reads top to bottom in the order the bestiary
 * has always had it — the director's brush strip and the bestiary sheet both
 * walk it in key order.
 */
export const SPLIT_CREATURES: Record<SplitKind, CreatureDef> = {
  dart: {
    kind: "dart",
    // The cannon alone. It is answered by a shot like a slick, and everything
    // that makes it hard is *where* the shot has to be — which is aiming, not
    // warding.
    controls: ["aim"],
    // No colour of its own, and this entry does work rather than standing
    // blank. A dart arrives red or cyan, authored on the wave, and the
    // matching cannon is what kills it — so the colour is a fact about one
    // arrival, the way a lure's or a clasp's is. It is the one kind where the
    // "one kind, one colour" rule is spent the other way round on purpose:
    // the silhouette is new because the *behaviour* is new, and both colours
    // wear it because what the pair has to say about a dart — the side — is
    // the same sentence in either.
    color: null,
    // Player 1's strip, like the clasp's, and the same rule rather than an
    // exception to it: the seat that is shown where it is going is not the
    // seat that can fire. Player 2 reads the arrow and says a side out loud;
    // player 1 holds the cannon and has to be standing two columns over
    // before the beat turns.
    radar: "p1",
    // The colour is a fact about the arrival, not about the kind — see
    // `CreatureDef.authorsColor`, and the SLICK/BULB choice the director
    // offers under the map for exactly these four.
    authorsColor: true,
    blurb:
      "Never falls straight. Every other beat it takes a diagonal two rows down and two columns to one side, then hangs for a beat and picks the next side — and only the navigator is shown which.",
  },
  wisp: {
    kind: "wisp",
    // The cannon alone. It is answered by a shot like a slick, and everything
    // that makes it hard is *which tile* the shot has to be fired up — which
    // is aiming, not warding.
    controls: ["aim"],
    // No colour, and this entry is doing work rather than standing blank. The
    // throb is the precedent and the argument is the same one pointed at a
    // different axis: a throb is answered by the beat, a wisp by the tile, and
    // in neither case is the ammunition the question. Either colour kills one
    // (`wispStruck`). A colour here would put a second sentence beside the
    // only one this creature exists to make somebody say out loud.
    color: null,
    // Player 1's strip, and the same rule the clasp and the dart are on rather
    // than an exception to it: the seat that is shown one coming is never the
    // seat that can see where it went. It is the sharpest version of that
    // split in the game — player 1 gets the *only* warning and then nothing
    // at all, which is exactly the moment they have to start listening.
    radar: "p1",
    blurb:
      "It is on one of your screens and not the other, and it is never in the same tile twice: every two beats it is somewhere else on the field. It does not fall, so it never reaches the ship and never leaves — the wave stays open until it is shot, and either colour will do it. While one is out, both screens carry the lettered grid.",
  },
  ghost: {
    kind: "ghost",
    // An ordinary aim target, and the panel says so. The whole difficulty is
    // that player 1 cannot see which column to slide to, and a wave of these
    // still shows the cannon strip — because the cannon is exactly what the
    // pair is negotiating over.
    controls: ["aim"],
    // No colour *of its own*: a wave authors one per arrival, the way it does
    // for a dart. The colour is never the question here — player 2 can see
    // the body the whole way down and holds both triggers — so it is a fact
    // about one arrival rather than about the kind.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Deliberately not player
    // 1's: a strip that announced a ghost coming would be the pilot's screen
    // saying *something is on its way* without saying where, which is a
    // second, worse copy of the band they already get on the field.
    radar: "p2",
    blurb:
      "Only one of you can see it at all. The other gets a band across the row it is in and nothing about the column — and they are the one holding the cannon. Say the number.",
  },
  // THE ECHO, and the fifth worn body: a small slick or bulb that divides.
  // Next door with the other four for the reason they are all there — it is
  // drawn as the body its colour names and `wornKind` is what resolves it.
  countdown: {
    kind: "countdown",
    // The cannon alone: it is answered by a shot like a slick, and everything
    // that makes it hard is *which beat* the shot has to land on.
    controls: ["aim"],
    // The throb's arrangement: none of its own, one authored per arrival. The
    // colour is the navigator's half of the sentence and the count is the
    // pilot's, and a body that carried one fixed colour would leave the
    // navigator with nothing to be told but "now".
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target: the seat that fires is
    // the seat warned that something is coming. What that seat is *not*
    // shown is the count, and the strip says nothing about it.
    radar: "p2",
    blurb:
      "A round body with marks cut into its rim, one fewer each beat. A shot only reaches it while no marks are left; a shot on any other beat costs the hull, and the body stays. Only the pilot is drawn the marks — the navigator, who fires, sees a blank rim — so the count has to be said out loud, the way a column is.",
  },
};
