import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * The three bodies with **nothing laid over them at all**: a slick or a bulb
 * drawn small, drawn large, or standing somewhere a body does not normally
 * stand.
 *
 * Split out of `creatures-worn.ts` when THE CHUTE took that file past its
 * 250-line limit for the third time, and along the seam `living-look.ts` and
 * `wornKind` have both been describing in those words since THE ECHO landed.
 * Next door is a body with an *object* on it — a disguise, plating, a
 * membrane, weather, a cage, a rock crust, a canopy — and every one of those
 * entries has to argue about the thing on top. These three have nothing on
 * top: what makes an echo an echo is that it is smaller, a rind that it is
 * bigger, and a mount that a wheel is carrying it. Size and place are not
 * costumes, and the arguments in the two files stopped rhyming a while ago.
 *
 * Both records are spread into `WORN_CREATURES`, so `creatures-table.ts` and
 * everything downstream still ask one question in one place.
 */
export type BareKind = Extract<CreatureKind, "echo" | "rind" | "mount" | "strand">;

export const BARE_CREATURES: Record<BareKind, CreatureDef> = {
  strand: {
    kind: "strand",
    // The cannon alone, and the panel says so. Nothing about the shield, the
    // beat or the ward changes — what changes is that the pair cannot work out
    // between them which column to put the cannon in without both of them
    // saying something, and control visibility has nothing to say about that.
    controls: ["aim"],
    // No colour of its own, the way an echo and a rind have none: a strand
    // arrives red or cyan and that is the colour of the bead which has to be
    // shot **first**, from which every other one follows by alternating
    // (`beadColor`). So the authored colour is a fact about one arrival, and
    // the fourth blank in this table for the plainest of reasons — a bead
    // simply *is* a slick or a bulb, and a colour here would be the kind
    // claiming one of the two bodies each of them can be.
    color: null,
    authorsColor: true,
    // Player 1's strip, and the same rule THE DART and THE WISP are on rather
    // than an exception to it: the seat that is shown one coming is not the
    // seat that can fire. The pilot has to have the cannon somewhere along the
    // thread before the navigator can name a bead, and they hold no trigger to
    // do anything else with the warning.
    radar: "p1",
    blurb:
      "Two to five slicks and bulbs threaded on one line, alternating, and only one of them can be shot at a time. The navigator is shown which — and no colours at all; the pilot is shown the colours and no mark. A shot at the wrong bead swells the last dead one back to life.",
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
