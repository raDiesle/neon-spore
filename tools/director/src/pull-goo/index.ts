import { PULL_KNOB, PULL_TRACK } from "@neon-spore/render";
import { patch, type Variant } from "../../../versus/variant.js";
import { gooKnob } from "./knob.js";
import { GOO_STYLES, type GooStyle } from "./style.js";
import { gooTrack } from "./track.js";

/**
 * **GOO** — the PULL LAB's own looks for the one generic pull, each built on
 * VERSUS's OOZE and answering the owner's notes on it (10 October 2026):
 * not cyan; a real, living slime with a neon rim; no dots behind the drop,
 * only an uneven strand of goo, quiet, and specks where it went; a louder
 * arrow; a count sealed by a glob falling and splashing, a failure that snaps
 * and spits red rather than drawing lines; no word on the field; and a band
 * either side of the path the hand may wander in, plainly left when it fails.
 *
 * They live with the lab and nowhere else — the owner: *not on "versus" page
 * but this page* — so they are not under `tools/versus/candidates/`, and the
 * VERSUS registry never lists them. Each is still a `Variant`, so the lab
 * holds it in `PULL_KNOB` and `PULL_TRACK` for a frame exactly as it holds a
 * candidate. The shared engine is this directory; a look is one `GooStyle`.
 */
function gooLook(style: GooStyle): Variant {
  return {
    slot: "pull:handle",
    name: style.name,
    sentence: style.sentence,
    dir: "tools/director/src/pull-goo",
    patches: [
      patch({
        target: PULL_KNOB,
        reached: () => PULL_KNOB,
        where: { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" },
        fields: { paint: gooKnob(style) },
      }),
      patch({
        target: PULL_TRACK,
        reached: () => PULL_TRACK,
        where: { file: "packages/render/src/pull-track.ts", symbol: "PULL_TRACK" },
        fields: { paint: gooTrack(style) },
      }),
    ],
  };
}

export const GOO_LOOKS: readonly Variant[] = GOO_STYLES.map(gooLook);
