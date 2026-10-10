import { PULL_KNOB, PULL_TRACK } from "@neon-spore/render";
import { patch, type Variant } from "../../../versus/variant.js";
import type { Ending } from "./ending.js";
import { SCATTER, SINK } from "./endings-pool.js";
import { BLOOM, SLING } from "./endings-spring.js";
import { gooKnob } from "./knob.js";
import { GOO } from "./style.js";
import { gooTrack } from "./track.js";

/**
 * **GOO** — the PULL LAB's own looks for the one generic pull, built on
 * VERSUS's OOZE from the owner's notes on it and on the first four GOO looks
 * (10 October 2026). OOZE's guides kept: the call, the dots ahead with the
 * next one blinking, the ghost running the pull, the turning place, the ring
 * of how far. TAR's colour with JELLY's tail. Behind the drop, only a quiet
 * green left by the fluid. A red edge only where the drop touches the limit.
 * A failure slurped home by its own tail. And four endings to choose from,
 * none of them falling: the one thing that differs between these looks.
 *
 * They live with the lab and nowhere else — the owner: *not on "versus" page
 * but this page* — so the VERSUS registry never lists them. Each is still a
 * `Variant`, so the lab holds it in `PULL_KNOB` and `PULL_TRACK` for a frame
 * exactly as it holds a candidate.
 */
function gooLook(ending: Ending): Variant {
  return {
    slot: "pull:handle",
    name: ending.name,
    sentence: ending.sentence,
    dir: "tools/director/src/pull-goo",
    patches: [
      patch({
        target: PULL_KNOB,
        reached: () => PULL_KNOB,
        where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
        fields: { paint: gooKnob(GOO) },
      }),
      patch({
        target: PULL_TRACK,
        reached: () => PULL_TRACK,
        where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
        fields: { paint: gooTrack(GOO, ending) },
      }),
    ],
  };
}

export const GOO_LOOKS: readonly Variant[] = [SINK, SCATTER, SLING, BLOOM].map(gooLook);
