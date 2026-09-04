import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings: a name that is not a `CreatureKind` collapses
 * to `never` and the key becomes a build error, so this list cannot fall
 * behind a rename in `creature-kinds.ts`.
 */
type WornKind = Extract<
  CreatureKind,
  "lure" | "shell" | "clasp" | "veil" | "echo" | "rind" | "recoil" | "mount" | "carom"
>;

/**
 * The nine bodies that are drawn as something else: a slick or a bulb with a
 * disguise, plating, a membrane, weather, a sprung cage, a rock crust, a wheel
 * under it, or a size that is not the usual one — smaller for THE ECHO and
 * larger by however much is left for THE RIND.
 *
 * Split out of `creatures-table.ts` when THE ECHO took that file past its
 * 250-line limit, along the seam the game already reads on — these are exactly
 * the kinds `living-look.ts` answers `null` for and `wornKind` resolves, so
 * the group is a fact about the field rather than a convenient cut. Four of
 * the five are also the reason `authorsColor` exists: the colour is the
 * *arrival's* and not the kind's, which is what the director offers a
 * SLICK/BULB choice for under the map.
 *
 * `CREATURES` names each of these one by one rather than spreading the object,
 * so the table next door still reads top to bottom in the order the bestiary
 * has always had it — the director's brush strip and the bestiary sheet both
 * walk it in key order, and a group spread in one place would have moved the
 * throb and the dart to the end of both.
 */
export const WORN_CREATURES: Record<WornKind, CreatureDef> = {
  carom: {
    kind: "carom",
    // **Both**, and it is the first *arrival* that carries both — the queen
    // and the warden do, and each of those is a whole encounter. The cannon
    // cracks the crust and the shield takes the rock that falls out, so a wave
    // with one on it must show every button both halves need: a shield-less
    // panel is a body nobody can answer, which `test/waves.test.ts` stops.
    controls: ["aim", "guard"],
    // No colour of its own: a wave authors one per arrival, the way it does
    // for a clasp (`CreatureDef.authorsColor`). It is the body sealed inside
    // the crust, and both screens can read it the whole way down — what is
    // hard here is never *which* trigger, it is being in the lane at all.
    color: null,
    // Player 2's strip, like every other aim target, for all that player 1
    // holds the trigger the second half wants: a rock announces itself.
    radar: "p2",
    authorsColor: true,
    blurb:
      "A slick or a bulb sealed inside a rock crust, thrown in on a diagonal and bouncing off the side walls twice before it reaches the ship. It never falls, and the shield cannot turn it — only the matching cannon cracks it open, and what drops out is a plain meteor that now has to be warded.",
  },
  lure: {
    kind: "lure",
    // Same job as any other aim target — the cannon in its column, player 2
    // choosing whether to fire — so a wave of nothing but lures still shows
    // the controls that make not-firing a restraint rather than an absence.
    controls: ["aim"],
    // No colour *of its own*: what a lure carries is the disguise's, authored
    // on the wave entry, and that is a fact about one arrival rather than
    // about the kind. A colour here would be this creature claiming a body of
    // its own — the one thing it does not have.
    color: null,
    // Player 2's strip, like every other aim target, and this is where the
    // alarm matters most. Player 1's carries `guard` kinds only, so the
    // disguise cannot leak by that door at all; player 2's carries the
    // exclamation and the name, so a hit stays haste and not surprise.
    radar: "p2",
    // The colour is a fact about the arrival, not about the kind — see
    // `CreatureDef.authorsColor`, and the SLICK/BULB choice the director
    // offers under the map for exactly these four.
    authorsColor: true,
    blurb:
      "A slick or a bulb, full size, in its real colour — and only one of you can see that it is neither. Do not shoot it: any shot that lands costs the hull. Left alone it goes on its own, two rows short of the ship.",
  },
  shell: {
    kind: "shell",
    // Only ever the cannon. Both phases are answered by a shot — what changes
    // is whether the colour is part of the question, and control visibility
    // has nothing to say about that.
    controls: ["aim"],
    // No colour, and that is the entry doing work rather than a blank — the
    // same work it does on the clasp. The body inside the plating has one, and
    // it is visible from the moment it arrives, but it belongs to the slick or
    // the bulb this arrival *is*: red plates a slick, cyan plates a bulb, and
    // `shellBecomes` is what pairs them. A colour here would make the armour a
    // body in its own right, which is the one thing it is not.
    color: null,
    radar: "p2",
    // The colour is a fact about the arrival, not about the kind — see
    // `CreatureDef.authorsColor`, and the SLICK/BULB choice the director
    // offers under the map for exactly these four.
    authorsColor: true,
    blurb:
      "Plating a size too big for the slick or the bulb inside it, split down the middle: one piece in front of each of its two columns, and the body's own colour shining out through the cracks the whole way down. Any colour chips a piece off. A shot up a column already bared does nothing — and only once both pieces are gone does that colour finish it.",
  },
  clasp: {
    kind: "clasp",
    // Both, and this is the first kind that needs both for *one* body rather
    // than for two halves of an encounter. The queen and THE WARDEN carry
    // `guard` because something else on the field has to be warded; a clasp
    // carries it because the shield is what opens the clasp itself.
    controls: ["aim", "guard"],
    // No colour of its own, and this is the entry doing work rather than a
    // blank. The body inside has one — it is visible through the shield the
    // whole way down, which is what lets player 2 load the trigger before the
    // shield is anywhere near it — but it belongs to the slick or the bulb
    // this arrival *becomes*, and `livingKindForColor` is what pairs them.
    // A colour here would make the clasp a body in its own right, which is the
    // one thing it is not.
    color: null,
    // Player 1's strip, and the first aim-answerable body on it. It is not an
    // exception to the rule that the radar crosses the controls — it is that
    // rule applied to a body whose *first* answer is a guard answer. The one
    // who sees it coming holds the trigger and cannot fire; the one who can
    // fire cannot open it. Whichever way round the pair work it out, somebody
    // has to say a column out loud.
    radar: "p1",
    // The colour is a fact about the arrival, not about the kind — see
    // `CreatureDef.authorsColor`, and the SLICK/BULB choice the director
    // offers under the map for exactly these four.
    authorsColor: true,
    blurb:
      "A slick or a bulb inside a shield of its own, and shots simply bounce. Shield in its column, triggered at the right moment — and it does not die, it becomes the body you could see the whole time.",
  },
  veil: {
    kind: "veil",
    // The cannon alone. A cloud is opened by a shot in the right colour at the
    // right moment, and nothing about the shield has anything to say to it.
    controls: ["aim"],
    // No colour of its own, and this entry does the most work of any blank in
    // this table. A veil *has* a colour at every instant — it is the body
    // inside the cloud — and it is neither the kind's nor the wave's: it is
    // rolled when the arrival enters the field and turned over every few beats
    // after that (`veilOnSpawn`, `veilMorph`). A colour here would be a body
    // this creature does not have; an authored one would fix the one thing
    // docs/spec/structure.md 7.3 puts on the random side of its table.
    color: null,
    // **Not** `authorsColor`. The other four blanks in this table are colours a
    // wave writes down, which is why the director offers a SLICK/BULB choice
    // under the map for exactly those. This one nobody may write down — see
    // above — so the cell panel has nothing to offer and correctly offers it.
    //
    // Player 2's strip, with the aim kinds, and the rule crossing the controls
    // for the third time rather than an exception to it. What the strip says
    // is that something is coming and in which column; what it cannot say is
    // *what*, so it says so — a target lock rather than a colour
    // (`render/veil-marks.ts`, and docs/spec/systems.md 5.2, which asked for
    // exactly that before any of this was built). The half player 2 is missing
    // is on player 1's screen, in the field, where the cloud is see-through.
    radar: "p2",
    blurb:
      "A thundercloud with a slick or a bulb inside it, and only the pilot can see which. It turns over from one to the other every few beats, so the colour you were told expires — and a shot in the wrong one shuts the cloud for two seconds rather than merely missing.",
  },
  echo: {
    kind: "echo",
    // The cannon alone, and the panel says so. Everything hard about this one
    // is *when* and *which of the four* — an order the pair has to agree out
    // loud — and both of those are aiming rather than warding.
    controls: ["aim"],
    // No colour of its own, the way a dart has none: an echo arrives red or
    // cyan, authored on the wave, and the matching cannon is what kills it. It
    // is the fifth blank in this table and the plainest of them, because
    // nothing is laid over the body at all — an echo simply *is* a small slick
    // or a small bulb, so a colour here would be the kind claiming one of the
    // two bodies it can be.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Deliberately not player
    // 1's: both players see an echo whole and neither is missing anything
    // about it, so the strip is doing its ordinary job — saying that something
    // is coming and where — for a body whose difficulty is entirely in what
    // the pair does about it next.
    radar: "p2",
    blurb:
      "A small slick or bulb with a seam down it, coming half as fast as anything else. It strains and parts in two — sideways, then up and down, then both at once — and each wait is longer than the last. Nothing on the field is less urgent, and nothing costs so much to leave.",
  },
  rind: {
    kind: "rind",
    // The cannon alone, three times over. Nothing about the shield, the beat
    // or the column changes — what changes is that one call is not enough, and
    // control visibility has nothing to say about a repeat.
    controls: ["aim"],
    // No colour of its own, the way an echo has none: a rind arrives red or
    // cyan, authored on the wave, and the matching cannon is what sheds it and
    // then kills it. It is the sixth blank in this table and the one with the
    // least laid over the body — a rind simply *is* an outsized slick or bulb,
    // so a colour here would be the kind claiming one of the two it can be.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Both players see the
    // whole thing, including how big it still is, and that is deliberate:
    // the count is the one number in this game neither seat has to be told,
    // so what the pair has to agree on is whether to spend three beats of one
    // column on it now or after the small things.
    radar: "p2",
    blurb:
      "A slick or a bulb three times the size of one. The matching colour does not kill it — it takes a layer off and the body underneath is a size smaller, twice, and only then does a shot finish it. How much is left is how big it is; there is no other read-out.",
  },
  recoil: {
    kind: "recoil",
    // The cannon alone, four times over. Nothing about the shield, the beat or
    // the maw has anything to say to it — what a bounce changes is *which*
    // column and *which* colour, and both of those are aiming.
    controls: ["aim"],
    // No colour of its own, the way a rind has none: a recoil arrives red or
    // cyan, authored on the wave, and the matching cannon is what bounces it
    // and then kills it. It is the seventh blank in this table and the one
    // whose blank does the most work — the colour is not merely a fact about
    // the arrival, it is a fact about *this instant*, because every bounce
    // turns it over (`recoilStruck`). A colour here would be the kind claiming
    // one of the two bodies it spends the whole fall alternating between.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Both players see the
    // whole thing — the cage, the damage on it and the colour inside — and
    // that is deliberate: nothing about this creature is withheld, and what
    // the pair has to do is say the same three things again, faster, on the
    // beat their own shot landed.
    radar: "p2",
    blurb:
      "A slick or a bulb in a sprung cage. The matching colour does not kill it — it throws it two rows back up the field and a lane to one side you cannot predict, and the body inside turns over to the other colour on the way. Three times, and the cage is more broken each time. Only the fourth shot finishes it.",
  },
  mount: {
    kind: "mount",
    // Nothing at all, and it is the tether's answer rather than a new one: a
    // mount is installed by its wheel and never authored, so a wave containing
    // one already contains the `gyre` that put it there and already shows the
    // cannon that entry asks for. A control group here would be the same panel
    // named twice, and it would put a brush in the director for a body no
    // author may place (`LIVING_BRUSH_KINDS`, tools/director/src/brushes.ts).
    controls: [],
    // No colour of its own — but not because a wave authors one. A mount's
    // colour comes from *where on the rim it is* (`mountColor`), which is the
    // whole creature: the alternation is what makes a column's colour a thing
    // that changes on the beat. So there is deliberately no `authorsColor`
    // either; a director offering red or cyan here would be offering to switch
    // the mechanic off.
    color: null,
    // Nobody's strip, for the tether's reason: it does not arrive, the wheel
    // does. Six more rows for six bodies that came in on one announcement
    // would be noise on a strip that exists to say what is coming.
    radar: "none",
    blurb:
      "One of the six on a wheel's rim: an ordinary slick or bulb that does not fall, because the wheel carries it. It is answered exactly like a body in a lane — the right colour, in the right column — except that both of those are only true for a beat at a time.",
  },
};
