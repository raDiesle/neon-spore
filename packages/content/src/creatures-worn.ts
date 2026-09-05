import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";
import { BARE_CREATURES, type BareKind } from "./creatures-bare.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings: a name that is not a `CreatureKind` collapses
 * to `never` and the key becomes a build error, so this list cannot fall
 * behind a rename in `creature-kinds.ts`.
 */
type WornKind = Extract<
  CreatureKind,
  "lure" | "shell" | "clasp" | "veil" | "recoil" | "carom" | "chute" | "volley"
>;

/**
 * The eight bodies with something **laid over them**: a slick or a bulb under
 * a disguise, plating, a membrane, weather, a sprung cage, a rock crust, a
 * canopy or a shell of plates. The three with nothing over them at all — an
 * echo drawn small, a rind drawn large, a mount carried round a rim — are
 * `creatures-bare.ts`, spread in below so `WORN_CREATURES` still answers for
 * all eleven.
 *
 * Split out of `creatures-table.ts` when THE ECHO took that file past its
 * 250-line limit, along the seam the game already reads on — these are among
 * the kinds `living-look.ts` answers `null` for and `wornKind` resolves, so
 * the group is a fact about the field rather than a convenient cut. Every one
 * of them is also a reason `authorsColor` exists: the colour is the
 * *arrival's* and not the kind's, which is what the director offers a
 * SLICK/BULB choice for under the map.
 *
 * `CREATURES` names each of these one by one rather than spreading the object,
 * so the table next door still reads top to bottom in the order the bestiary
 * has always had it — the director's brush strip and the bestiary sheet both
 * walk it in key order, and a group spread in one place would have moved the
 * throb and the dart to the end of both.
 */
export const WORN_CREATURES: Record<WornKind | BareKind, CreatureDef> = {
  // The three with nothing laid over them — an echo drawn small, a rind drawn
  // large, a mount carried round a rim — are `creatures-bare.ts` next door,
  // cut out when THE CHUTE took this file over its limit for the third time.
  // Spread rather than listed, because `creatures-table.ts` names every one of
  // these by hand anyway and that is where the bestiary's order is kept.
  ...BARE_CREATURES,
  chute: {
    kind: "chute",
    // Nothing at all, and it is the mount's answer rather than a new one: a
    // chute is thrown out of a carom and never authored, so a wave containing
    // one already contains the `carom` that made it and already shows both
    // panels that entry asks for. A control group here would be the same
    // panel named twice, and a brush for a body no author may place.
    controls: [],
    // No colour of its own — but not because a wave authors one. It keeps
    // whatever the body sealed in the crust was, which is the colour the pair
    // has already been saying out loud, so there is deliberately no
    // `authorsColor` either: the whole point of this body is that it is the
    // one they were looking at a moment ago.
    color: null,
    // Nobody's strip, for the tether's reason: it does not arrive, the carom
    // does. A blip for something that came out of a body already on the field
    // would be a warning about the past.
    radar: "none",
    blurb:
      "The slick or the bulb that was sealed inside a carom, blown out of the hatch the moment the crust cracks. It is the only thing in this game that goes up: it climbs to the top of the field, opens a canopy there and drifts back down at half the speed of a slick, still in its own colour — and it still has to be shot.",
  },
  volley: {
    kind: "volley",
    // **Both**, in the order the carom takes them backwards. The shield opens
    // this one — three times — and the cannon finishes what comes out, so a
    // wave with one on it must show every button both halves need: a
    // cannon-less panel is a body nobody can finish, which
    // `test/waves.test.ts` stops.
    controls: ["aim", "guard"],
    // No colour of its own: a wave authors one per arrival, the way it does
    // for a carom (`CreatureDef.authorsColor`). It is the body sealed inside
    // the shell, and both screens read it through the seams the whole way
    // down — which is the point rather than a leak, because after the third
    // ward there is no time left to work it out.
    color: null,
    // **Player 1's strip, and it is the one row in this file that is not
    // "every aim target is player 2's".** What answers a volley first is the
    // shield, and the pilot is the seat holding its trigger and *not* the seat
    // that can slide it into a column. So the warning goes to the one who has
    // to say a number out loud and then keep a thumb free for four beats,
    // which is the rocks' own arrangement — and a volley is a rock until the
    // third ward.
    radar: "p1",
    authorsColor: true,
    blurb:
      "A rock with a slick or a bulb sealed in it, falling a tile a beat down one lane like any other. The shield does not destroy it — a ward hits it straight back up the field, takes one plate of shell with it, and it comes down the same lane again from higher up. Three wards, and the shell bursts in mid-air over a plain body the cannon has to finish.",
  },
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
};
