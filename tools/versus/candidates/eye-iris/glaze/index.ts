import * as eyeLook from "../../../../../packages/render/src/eye-look.js";
import { patch, type Variant } from "../../../variant.js";
import { glaze } from "./paint.js";

/**
 * `eye:iris` / `glaze` — the eye is a wet ball because of how it is *lit*,
 * with the pupil left dead centre where the pair reads it.
 *
 * **This slot is on two bodies at once, and the pair must judge it on both.**
 * `lid.ts` and `warden-eye.ts` both call `drawEyeLens`, which calls the record
 * this patches, so a vote here moves THE LID *and* THE WARDEN. The pose is a
 * lid, where the eye is the whole picture; `WARDEN · ARMOURED` in the gallery
 * is the second picture, and it should be opened before this is voted on.
 *
 * **What the shipped side is.** The roundest thing in the game, drawn with no
 * depth on it at all: an iris concentric with the socket, six spokes turning
 * slowly, a hole in the middle, and a flat wash of the eye's own colour behind
 * the lot. It opens and shuts, and that is the whole of what it does.
 *
 * **What this argues, against TURN standing beside it.** Both candidates agree
 * the eye should read as a ball and disagree about what to spend to get it.
 * TURN spends *motion*: the iris is pinned at a longitude and swept across the
 * surface, squashing toward the limb and losing the light, under a catchlight
 * that stays where the light is. GLAZE spends *nothing that moves*. The iris
 * is left exactly where the game puts it, and the ball is made entirely out of
 * light: a wash across the socket's own squashed frame, bright toward `KEY` and
 * cool at the far rim, with one tight wet point over the top of it.
 *
 * **The reason it can win a fight TURN cannot.** Three, and each one is TURN's
 * own card read from the other side.
 *
 * *The pupil never leaves the middle.* On THE LID the aperture is the readout —
 * the seat without the cord is reading a height off it and a column off the
 * body — and TURN's own card names the risk that a warden with a wandering eye
 * reads as a boss that is dodging, in a game whose first rule is that nothing
 * on the field travels. A centred pupil cannot tell that lie. It also cannot
 * pull a lane call off centre, which is the same defect the ghost slot is
 * arguing about one page over.
 *
 * *It adds no second clock.* The pair are counting beats out loud. TURN puts a
 * slow sweep on the two biggest bodies in the game; this puts nothing on them
 * at all, because `KEY` does not move and the only thing that breathes here is
 * the pupil the game is already breathing — the wet point swells with `pr` and
 * with nothing else, so the eye is alive without there being a second rhythm
 * on the screen.
 *
 * *And it is the same picture at every size.* A disc travelling across a ball
 * needs room to travel; at the two dozen pixels a lid draws at on a phone the
 * whole sweep is a handful of them, and a mark that moves three pixels is a
 * mark that jitters. A light and a shade across an aperture read the same at
 * any size, which is what `docs/dimensional.md` means when it says the two cues
 * are not interchangeable — this one keeps working when the other runs out of
 * pixels.
 *
 * **The readout is untouched, and it had to be.** The height of the aperture is
 * what the seat without the cord reads the tension off, and none of this
 * reaches it — the lens, its two lids and the number they carry are
 * `eye-lens.ts`, next door, and a candidate here cannot patch them. What is
 * repainted is only what is *inside* the gap.
 *
 * **How it can lose, and the pair should watch for exactly this.** *A still
 * life.* `docs/dimensional.md` says plainly that a convincing ball that does
 * not move is half a cue, and this candidate is that half on purpose — if the
 * eye ends up reading as a painted button rather than a wet thing looking at
 * you, that is this look and no amount of turning the wash up will fix it,
 * because the missing half is motion. And the wash is a second value laid over
 * the one colour the pair are matching a shot to: if the cyan of a lid starts
 * looking like a different cyan from the cyan of a slick beside it, this look
 * has cost the field the one thing it must never cost.
 */
export const EYE_GLAZE: Variant = {
  slot: "eye:iris",
  name: "glaze",
  sentence:
    "the eye is made a ball by light alone — a wash bright toward the key and cool at the far rim, with one wet point breathing on the pupil's own clock — and the iris never leaves the middle",
  dir: "tools/versus/candidates/eye-iris/glaze",
  patches: [
    patch({
      target: eyeLook.EYE_LOOK,
      // No accessor: `eye-lens.ts` reads the export itself, inside the clip it
      // has already opened. The module namespace is the whole route there is.
      reached: () => eyeLook.EYE_LOOK,
      where: {
        file: "packages/render/src/eye-look.ts",
        symbol: "EYE_LOOK",
        type: "EyeLook",
      },
      fields: { iris: glaze },
    }),
  ],
};
