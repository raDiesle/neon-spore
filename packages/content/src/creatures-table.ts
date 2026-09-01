import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * Adding a creature means adding one entry here. Waves are not touched —
 * a wave shows the union of its creatures' control groups, nothing else.
 *
 * **One kind, one colour, one shape.** The pair plays across a voice channel
 * with a delay on it, so what one of them says has to be the same word every
 * time: a round cyan thing is a bulb and a bulb is a round cyan thing. A new
 * silhouette is spent on a new *behaviour*, never on recolouring an existing
 * one — the shapes still free (dart, veil, strand, crystal, …) are reserved for
 * creatures that do something the standard ones do not, and one of those has to
 * look clearly different, not merely differently tinted. See docs/spec/bestiary.md.
 */
export const CREATURES: Record<CreatureKind, CreatureDef> = {
  slick: {
    kind: "slick",
    controls: ["aim"],
    color: "red",
    radar: "p2",
    blurb: "Flat and wide, and always red. Glides, tilts and ripples. Holds its lane.",
  },
  bulb: {
    kind: "bulb",
    controls: ["aim"],
    color: "cyan",
    radar: "p2",
    blurb: "Round and swollen, and always cyan. Sways in its lane and pumps.",
  },
  meteor: {
    kind: "meteor",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb: "Dead rock. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorMedium: {
    kind: "meteorMedium",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling twice as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFast: {
    kind: "meteorFast",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling three times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFaster: {
    kind: "meteorFaster",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling four times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFastest: {
    kind: "meteorFastest",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling five times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  torch: {
    kind: "torch",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Same rock, same colour as a meteor, just twice as wide and the fastest thing in the field. Cannot be shot — and it is what the queen carries on each wing. Shield across both columns, triggered at the right moment.",
  },
  queen: {
    kind: "queen",
    controls: ["aim", "guard"],
    color: null,
    radar: "p2",
    blurb:
      "Huge and armoured. Two marks under her middle, one real and one not: one of you sees what is coming, the other sees which side. Every eight beats one of the two torches she carries drops straight out of its socket.",
  },
  warden: {
    kind: "warden",
    controls: ["aim", "guard"],
    color: null,
    radar: "p2",
    blurb:
      "A ring five columns wide with a hole you can see the field through, and it never moves. The hole slides; the core stands in it for two beats after every line you pull free, and only a shot of the rim's own colour, in the hole's own column, takes a plate.",
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
  throb: {
    kind: "throb",
    controls: ["aim"],
    color: null,
    radar: "p2",
    blurb:
      "Swells and shrinks on the shared beat and carries no colour. Only a shot while it is swollen lands — a miss on the beat it is shut is just a miss.",
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
    // *what*, so it says so — a question mark rather than a colour
    // (`render/veil-marks.ts`, and docs/spec/systems.md 5.2, which asked for
    // exactly that before any of this was built). The half player 2 is missing
    // is on player 1's screen, in the field, where the cloud is see-through.
    radar: "p2",
    blurb:
      "A thundercloud with a slick or a bulb inside it, and only the pilot can see which. It turns over from one to the other every few beats, so the colour you were told expires — and a shot in the wrong one shuts the cloud for two seconds rather than merely missing.",
  },
  tether: {
    kind: "tether",
    // The first `special`: answered by neither cannon nor shield. A hand is
    // the only thing that touches it — dragged rather than gripped — so it
    // carries no control group at all and a wave containing one shows the band
    // its other creatures ask for.
    controls: [],
    color: null,
    // Nobody's strip. It is installed by the boss rather than arriving from
    // above, and the boss is already announced — a second warning of a thing
    // that is not travelling anywhere would be noise on a strip that exists
    // to say what is coming.
    radar: "none",
    blurb:
      "A rope lowered out of the middle of THE WARDEN's rim, with a handle on the end of it. Cannot be shot and cannot be warded, and it never falls — the pilot takes the handle and pulls it aside, and the hatch over the eye opens as far as the rope is taut.",
  },
};
