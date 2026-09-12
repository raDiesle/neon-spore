import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";
import { BARE_CREATURES } from "./creatures-bare.js";
import { BEATBOX_CREATURE } from "./creatures-beatbox.js";
import { CLING_CREATURES } from "./creatures-cling.js";
import { FIXTURE_CREATURES } from "./creatures-fixtures.js";
import { HANDED_CREATURES } from "./creatures-handed.js";
import { HAZARD_CREATURES } from "./creatures-hazards.js";
import { JOINED_CREATURES } from "./creatures-joined.js";
import { SPLIT_CREATURES } from "./creatures-split.js";
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
 * one — a free shape goes to a creature that does something the standard ones
 * do not, and it has to look clearly different, not merely differently tinted.
 * See docs/spec/bestiary.md.
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
  // The arrivals with nothing alive in them, next door in
  // `creatures-hazards.ts`. Spread in here at exactly the position the rocks
  // have always held, so key order is untouched — the director reads its brush
  // strip off it. See that file for why the family is not the material.
  ...HAZARD_CREATURES,
  // The three bodies a wave never *sends* — the two bosses and the rope one of
  // them lowers — live next door in `creatures-fixtures.ts`, named one by one
  // rather than spread so this table still reads in the order the bestiary has
  // always had it. See that file for why the fixtures are the half that moved.
  queen: FIXTURE_CREATURES.queen,
  warden: FIXTURE_CREATURES.warden,
  // The four bodies drawn as something else live next door, in
  // `creatures-worn.ts` — named one by one rather than spread, so this table
  // still reads in the order the bestiary has always had it. See that file for
  // why the worn kinds are the half that moved.
  lure: WORN_CREATURES.lure,
  throb: {
    kind: "throb",
    controls: ["aim"],
    // The dart's arrangement: none of its own, one authored per arrival. Half
    // the body is that colour and half is plating, and neither says the other.
    color: null,
    authorsColor: true,
    radar: "p2",
    blurb:
      "Cut down the middle: red down one side and cyan down the other, turning clockwise the whole way down. Whichever half is pointing at the cannon is the colour that kills it — so the turn never shuts it, it swaps which trigger is right.",
  },
  shell: WORN_CREATURES.shell,
  clasp: WORN_CREATURES.clasp,
  // THE DART, and the first of the four bodies one seat cannot see whole that
  // wear nothing to do it: next door in `creatures-split.ts`, named one by one
  // rather than spread so this table still reads in the bestiary's order.
  dart: SPLIT_CREATURES.dart,
  veil: WORN_CREATURES.veil,
  // The second, and the sharpest split in the game: the seat that is shown one
  // coming is never the seat that can see where it went. `creatures-split.ts`.
  wisp: SPLIT_CREATURES.wisp,
  // The third fixture, and the only `special` that is not a body something
  // else brought onto the field with it.
  tether: FIXTURE_CREATURES.tether,
  // The third, and the only body one of the two never sees at all. Next door
  // in `creatures-split.ts`, with the dart and the wisp.
  ghost: SPLIT_CREATURES.ghost,
  // The fourth: the count on the pilot's screen, the trigger in the other hand.
  countdown: SPLIT_CREATURES.countdown,
  echo: BARE_CREATURES.echo,
  // THE RIND, and the sixth: an outsized slick or bulb that is cut back to one
  // by the shots it takes. Next door for the same reason as the other five —
  // it is drawn as the body its colour names and `wornKind` resolves it.
  rind: BARE_CREATURES.rind,
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
  mount: BARE_CREATURES.mount,
  // THE CAROM, and the eighth worn body: a slick or a bulb inside a rock crust
  // that crosses the field instead of falling. Next door for the same reason
  // as the other seven — `wornKind` resolves it until the crust comes off.
  carom: WORN_CREATURES.carom,
  // THE CRYSTAL: a slick *and* a bulb in one shell — `creatures-joined.ts`.
  crystal: JOINED_CREATURES.crystal,
  // THE CHUTE, and the ninth worn body: the slick or the bulb thrown clear of
  // a cracked carom, under a canopy. Next door with the rest for their reason
  // — it is drawn as the body its colour names, and `wornKind` resolves it.
  chute: WORN_CREATURES.chute,
  // THE VOLLEY, and the tenth worn body: a slick or a bulb inside a shell the
  // shield knocks off it a plate at a time. `wornKind` resolves it right up
  // until the shell bursts, after which there is nothing left to resolve.
  volley: WORN_CREATURES.volley,
  // THE STRAND, and the fourth bare body: two to five slicks and bulbs on one
  // thread, with nothing laid over any of them. Next door with the echo, the
  // rind and the mount for their reason — what makes a bead a bead is where it
  // is on the line and which one is lit, and neither is a costume.
  strand: BARE_CREATURES.strand,
  magnet: {
    kind: "magnet",
    // **Aim only, and that is the whole creature stated as a control group.**
    // A magnet is ended by the cannon and by nothing else — the shield does not
    // turn it, chip it or slow it — so a panel that could ward and not fire is a
    // panel this body cannot be answered on. It is deliberately *not*
    // `["aim", "guard"]`: the second half of the answer is a **hand**, and a
    // hand is not a control group (`test/waves.test.ts` reads this against the
    // panel).
    controls: ["aim"],
    // Authored, the way a clasp's and a dart's are — and it says more here
    // than anywhere else, because one authored colour is *both* poles: the
    // left one is what a wave writes and the right one is its opposite
    // (`magnetPoleColor`). So an author picks which way round the body stands,
    // and the pair reads the answer off the picture.
    color: null,
    // **The pilot's strip**, and the first arrival on it that is not a rock.
    // The rule is the split itself: the seat that is warned is the seat that
    // has to leave a column and put a thumb on the body, and the seat that
    // holds both triggers is told nothing — so the pilot has to say which side
    // they are coming in on before the colour means anything at all.
    radar: "p1",
    blurb:
      "A horseshoe on two poles, one red and one cyan, with an armoured plate slung under it on a staff. A shot up its own column meets the plate and is reflected straight back down. The only bolt that reaches a pole is one arriving sideways — so player 1 stands the cannon *off* the column and holds the body, and the shot climbs, turns level with it and comes in across. The side it arrives from is the pole it meets, and the pole it meets is the trigger that kills it.",
  },
  choir: {
    kind: "choir",
    // **Aim only, and the whole creature is stated by what is *not* here.**
    // A membrane is opened by a gesture that is not on either panel — the
    // device shaken, or two arrows carried off the edges of the field — and a
    // gesture is not a `ControlGroup`. What the wave's panel must be able to
    // answer is the body that comes out, which is a slick or a bulb, which is
    // the cannon. THE MAGNET's row makes the same argument about a hand.
    controls: ["aim"],
    // No colour of its own while it is two bodies: the membrane is grey and
    // nothing about it says which trigger will be right. The colour arrives
    // *with the merge*, from the wave, which is the one entry in this table
    // where `authorsColor` describes a colour the pair cannot see yet.
    color: null,
    authorsColor: true,
    // **The pilot's strip**, and the rule crossing the controls once more
    // rather than an exception to it: the seat warned is the seat that has to
    // put both hands on the glass, and the seat holding both triggers is told
    // nothing until the body is a body. Whichever way round they work it out,
    // somebody has to say when the shaking starts.
    radar: "p1",
    blurb:
      "Two grey balls standing apart in one lane, and no shot reaches either of them. Shake the phone twice — or carry the two arrows at the edges of the field outward, one and then the other — inside two beats, and they glow, draw together over a beat, and become a single slick or bulb. The colour bleeds in as they close and is only whole when they are one; until then there is nothing to shoot. Miss the window and it sings, and the hull pays for the chord.",
  },
  // THE BEATBOX, and the one row this table names alone rather than spreads:
  // `creatures-beatbox.ts`, cut out when it took this file over its 250-line
  // limit. See that file for why it neither wears nor is bare.
  beatbox: BEATBOX_CREATURE,
  crawler: {
    kind: "crawler",
    // **Both**, and the only kind where the two are not two halves of one
    // arrival but two halves of one *body*: a crawler wants them turn and turn
    // about along a line the pair can read off the field before it has
    // finished coming on. A wave showing one panel is a wave where every third
    // link cannot be answered at all.
    controls: ["aim", "guard"],
    // No colour of its own and none ever authored, which is the throb's blank
    // rather than the dart's: what carries a colour here is each *segment*,
    // and each follows from its place along the body (`segmentColor`). One
    // offered here would be an offer to turn the creature off, because the
    // order red, cyan, plate is the whole of what the pair plans against.
    color: null,
    // Player 2's strip, like every other mixed body. Deliberately not split: a
    // worm announces itself by walking on over a wall, which both screens
    // watch for several beats, so a second strip would warn about a thing
    // already in plain sight.
    radar: "p2",
    blurb:
      "A maggot that comes over one side wall and walks the ship's surface instead of falling on it, a column every other beat. It costs the hull nothing while it walks. Its head and tail are armour; the segments between them run red, cyan, plate, red, cyan, plate — a colour wants the matching cannon under it, a plate wants the shield. Take one off and the body snaps together behind it. Strip it and a beam takes what is left; let it reach the far wall and it eats its way in.",
  },
  // The bodies **neither panel answers at all** are in `creatures-handed.ts`;
  // the two answered by a control being *moved* in `creatures-cling.ts`.
  balloon: HANDED_CREATURES.balloon,
  gum: HANDED_CREATURES.gum,
  weight: HANDED_CREATURES.weight,
  ...CLING_CREATURES,
};
