import type { CreatureDef } from "./creatures.js";

/**
 * **The four bodies a wave never sends**, and the half of `CREATURES` that
 * describes fixtures rather than arrivals.
 *
 * Cut out of `creatures-table.ts` when THE CRAWLER took that file past its
 * 250-line limit, and it is the fourth such cut: `creatures-rocks.ts`,
 * `creatures-worn.ts` and `creatures-bare.ts` are the other three. The seam is
 * a real one rather than a convenient slice. Everything left next door is a
 * body the queue hands the field — it enters at a column, it can be authored,
 * a brush in the director places one. None of these three can be. Two are
 * bosses, installed by `startWave` and standing where they were put, and the
 * third is a rope one of them lowers.
 *
 * That is also why this file does not grow the way the others do: the
 * bestiary gains arrivals, and a boss's *body* is one row here against a whole
 * file of rules in `packages/sim`. THE CAIRN is the fourth and it grew it by
 * exactly one row, which is the claim made good.
 *
 * `creatures-table.ts` names each of the three one by one rather than
 * spreading this object, so the bestiary still reads in the order it has
 * always had — the director reads its brush strip off that order.
 */
export const FIXTURE_CREATURES = {
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
  cairn: {
    kind: "cairn",
    // **The shield alone, and it is the only fixture in this table that does
    // not want the cannon.** Nothing fired reaches the pile and nothing fired
    // reaches what comes out of it either — a rock is a rock — so what a wave
    // carrying one has to be able to answer is the dome, and only the dome. A
    // boss whose every answer is a rock is a boss played entirely on player
    // 2's strip, and the panel has to say so.
    controls: ["guard"],
    // No colour, and none ever authored: a colour is what the cannon has to
    // match and no bolt reaches this body at all (`shot-reach.ts`).
    color: null,
    // Nobody's strip. It is installed where it stands rather than arriving
    // from above, and the pile is the whole of the announcement — the tether's
    // argument, one boss on.
    installed: true,
    radar: "none",
    blurb:
      "Seven of the field's own rocks stacked four, two and one, held in one outline five columns wide, standing still. No shot reaches it and the shield has nothing to turn. Either of you takes hold of the pile and carries the thumb sideways: one rock comes out of that side and falls down that lane as an ordinary rock, to be warded like any other. Every answer you give it is a rock in the air, so the whole fight is how many the other one can be under at once — and a pile left alone for eight beats lets one go itself, into a column only the pilot is shown.",
  },
  curtain: {
    kind: "curtain",
    // **Both groups, and both at once**: the hem is shot at by the pilot's
    // cannon in the navigator's colours, a torch out of the core is the
    // dome's, and the fabric itself is carried by any hand — so a wave
    // carrying one asks for the whole default set, and the panel says so.
    controls: ["aim", "guard"],
    // No colour: the fabric takes any bolt and the core's colour is the
    // boss's own state, rolled and re-rolled behind it (`sim/curtain.ts`).
    color: null,
    // Nobody's strip. It unrolls where it hangs rather than arriving from
    // above, and a membrane seven columns wide is its own announcement.
    installed: true,
    radar: "none",
    blurb:
      "A membrane seven columns wide hung a row below the top of the field, with weighted lobes along its hem and a core hiding somewhere behind it, firing torches down its own column. No shot reaches the core through the fabric. Either of you takes hold of the membrane and carries the thumb sideways: it slides one column, the two of you pulling opposite ways hold it still, and left alone it rolls back over the core. The hem's lobes are its health — a shot into a soft one takes it off, and a lighter curtain slides two columns a shove. Bare the core and shoot it in its own colour, three times; a hem with no lobes left tears the whole sheet off the rail.",
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
    installed: true,
    radar: "none",
    blurb:
      "A rope lowered out of the middle of THE WARDEN's rim, with a handle on the end of it. Cannot be shot and cannot be warded, and it never falls — the pilot takes the handle and pulls it aside, and the hatch over the eye opens as far as the rope is taut.",
  },
} satisfies Record<"queen" | "warden" | "cairn" | "curtain" | "tether", CreatureDef>;
