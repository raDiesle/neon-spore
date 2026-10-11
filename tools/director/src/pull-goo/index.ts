import { PULL_KNOB, PULL_TRACK } from "@neon-spore/render";
import { patch, type Variant } from "../../../versus/variant.js";
import type { Ending } from "./ending.js";
import { FIZZ } from "./fizz.js";
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
 * A failure slurped home by its own tail. And the owner's notes on those
 * (10 October 2026, on SINK): no ring of how far, one green tail, the drop
 * turning — and endings that are a short green and a quick removal where
 * the drop was counted, never a trip home. Of the five endings offered —
 * SINK, STRAINER, VORTEX, WELL and FIZZ — the owner kept FIZZ (`fizz.ts`).
 * The drop itself is flat or a 3D ball, on the lab's bar (`drop-look.ts`), and it is
 * grabbed with a SQUISH (`grab.ts`).
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

/** FIZZ alone, the owner's pick of the five endings (10 October 2026). */
export const GOO_LOOKS: readonly Variant[] = [FIZZ].map(gooLook);
