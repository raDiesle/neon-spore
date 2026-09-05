import type { CreatureDef } from "./creatures.js";

/**
 * **The three bodies a wave never sends**, and the half of `CREATURES` that
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
 * file of rules in `packages/sim`.
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
} satisfies Record<"queen" | "warden" | "tether", CreatureDef>;
