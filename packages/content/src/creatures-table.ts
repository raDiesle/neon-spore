import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";
import { ROCK_CREATURES } from "./creatures-rocks.js";
import { WORN_CREATURES } from "./creatures-worn.js";

/**
 * Adding a creature means adding one entry here. Waves are not touched —
 * a wave shows the union of its creatures' control groups, nothing else. That
 * sentence is an invariant rather than an intention: `controlsForKinds` reads
 * the groups a wave's creatures demand, `groupsCoveredBy` reads the groups its
 * panel answers, and `test/waves.test.ts` puts the two together over every
 * wave — so a guard creature dropped onto a shield-less panel is a red check
 * rather than a creature the pair is shown and cannot answer.
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
  // The five speed tiers and the torch, next door in `creatures-rocks.ts`.
  // Spread in here rather than listed, at exactly the position they have
  // always held, so key order is untouched — the director reads its brush
  // strip off it. See that file for why the rocks are the half that moved.
  ...ROCK_CREATURES,
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
  // The four bodies drawn as something else live next door, in
  // `creatures-worn.ts` — named one by one rather than spread, so this table
  // still reads in the order the bestiary has always had it. See that file for
  // why the worn kinds are the half that moved.
  lure: WORN_CREATURES.lure,
  throb: {
    kind: "throb",
    controls: ["aim"],
    color: null,
    radar: "p2",
    blurb:
      "Swells and shrinks on the shared beat and carries no colour. Only a shot while it is swollen lands — a miss on the beat it is shut is just a miss.",
  },
  shell: WORN_CREATURES.shell,
  clasp: WORN_CREATURES.clasp,
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
  veil: WORN_CREATURES.veil,
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
  echo: WORN_CREATURES.echo,
  // THE RIND, and the sixth: an outsized slick or bulb that is cut back to one
  // by the shots it takes. Next door for the same reason as the other five —
  // it is drawn as the body its colour names and `wornKind` resolves it.
  rind: WORN_CREATURES.rind,
  // THE RECOIL, and the seventh: a slick or a bulb in a cage that throws it
  // back up the field instead of letting it die. Next door for the same reason
  // as the other six — it is drawn as the body its *current* colour names, and
  // `wornKind` resolves it afresh after every bounce.
  recoil: WORN_CREATURES.recoil,
  gyre: {
    kind: "gyre",
    // The cannon alone, and that is the panel a wave with one on it shows.
    // What makes this creature hard is *when* the shot has to be in a column
    // rather than whether the shield reached it — and the maw, which is on
    // that panel already and is not a control group at all (`ControlGroup` is
    // aim and guard, the two things a wave may be missing).
    controls: ["aim"],
    // The hub carries none and no arrival ever authors one, which is the
    // throb's blank rather than the dart's: what has a colour here is each of
    // the six on the rim, and each of those follows from its position
    // (`mountColor`). So no `authorsColor` — the mount's own row next door
    // says why offering one would be offering to turn the creature off.
    color: null,
    // Player 2's strip, like every other aim target. Both screens carry the
    // whole wheel once it is on the field — nothing about it is split — so
    // what the strip is doing is saying that something five columns wide is
    // on its way, which is a thing the pilot has to have cleared a lane for.
    radar: "p2",
    blurb:
      "A wheel with six bodies bolted round its rim, alternating red and cyan, turning as it comes. It falls to the middle of the field and then walks a diamond there, faster and faster, sinking a row each lap until the bottom of it grinds along the ship. Open the maw and the wheel slows, wherever the cannon happens to be standing.",
  },
  lid: {
    kind: "lid",
    // The cannon alone, and the panel a wave with one on it shows. The cord is
    // not a control group: `ControlGroup` is aim and guard, the two things a
    // wave may be missing, and a handle on the field is neither — it is drawn
    // where the body is, the way THE WARDEN's rope and THE MAZE's string are,
    // and no strip has to appear for it.
    controls: ["aim"],
    // No colour of its own: a wave authors one per arrival, the way it does
    // for a clasp. The colour is the *lens's* — what player 2 has to load
    // before the plates part — and it is visible on both screens the whole way
    // down, out of the seam between the plates. What the armour buys here is
    // not surprise, it is timing.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Deliberately not player
    // 1's, for all that the cord is player 1's hand: the pilot already has the
    // body itself to look at from the moment it enters, and a strip announcing
    // one to the seat that cannot fire would be a warning aimed away from the
    // trigger that answers it.
    radar: "p2",
    blurb:
      "An armoured eye with a cord hanging off it. The two plates over the lens part from the middle outwards for exactly as long as the pilot keeps the cord pulled aside, and only while they stand fully apart does the lens's own colour land — so the pull and the shot are one moment in two hands.",
  },
  // The six on that rim, and the sixth worn body — an ordinary slick or bulb
  // with a wheel under it. Next door with the other five for their reason: it
  // is drawn as the body its colour names, and `wornKind` resolves it.
  mount: WORN_CREATURES.mount,
  // THE CAROM, and the eighth worn body: a slick or a bulb inside a rock crust
  // that crosses the field instead of falling. Next door for the same reason
  // as the other seven — it is drawn as the body its colour names, and
  // `wornKind` resolves it right up until the crust comes off, after which
  // there is no body left to resolve.
  carom: WORN_CREATURES.carom,
  // THE CHUTE, and the ninth worn body: the slick or the bulb thrown clear of
  // a cracked carom, under a canopy. Next door with the rest for their reason
  // — it is drawn as the body its colour names, and `wornKind` resolves it.
  chute: WORN_CREATURES.chute,
};
